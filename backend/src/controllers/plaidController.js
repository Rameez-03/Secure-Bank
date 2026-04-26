import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import User from '../models/userModel.js';
import { encrypt, safeDecrypt } from '../utils/encrypt.js';

const isProd = process.env.NODE_ENV === 'production';

const getPlaidClient = () => {
  const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  });
  return new PlaidApi(configuration);
};

// Sanitises error responses — never expose Plaid internals to clients in production
const plaidError = (error) => {
  const data = error.response?.data;
  console.error('[Plaid]', data || error.message || error);
  return isProd ? undefined : (data || error.message);
};

// Create Link Token
export const createLinkToken = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();

    const request = {
      user: { client_user_id: req.user.userId.toString() },
      client_name: 'Secure Banking App',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Gb, CountryCode.Us],
      language: 'en',
    };

    if (process.env.PLAID_REDIRECT_URI) {
      request.redirect_uri = process.env.PLAID_REDIRECT_URI;
    }

    const createTokenResponse = await plaidClient.linkTokenCreate(request);

    res.status(200).json({
      success: true,
      data: {
        link_token: createTokenResponse.data.link_token,
        expiration: createTokenResponse.data.expiration,
        request_id: createTokenResponse.data.request_id,
      },
    });
  } catch (error) {
    const detail = plaidError(error);
    res.status(500).json({
      success: false,
      message: 'Error creating link token',
      ...(detail && { error: detail }),
    });
  }
};

// Exchange Public Token — encrypts the access token before persisting
export const exchangePublicToken = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const { public_token } = req.body;

    if (!public_token) {
      return res.status(400).json({ success: false, message: 'Public token required' });
    }

    const plaidResponse = await plaidClient.itemPublicTokenExchange({ public_token });

    const rawToken = plaidResponse.data.access_token;
    const itemId = plaidResponse.data.item_id;

    // Encrypt before storing — requires ENCRYPTION_KEY env var
    const encryptedToken = encrypt(rawToken);

    await User.findByIdAndUpdate(req.user.userId, {
      accessToken: encryptedToken,
      plaidItemId: itemId,
    });

    res.status(200).json({
      success: true,
      message: 'Bank account linked successfully',
      data: {
        item_id: itemId,
        request_id: plaidResponse.data.request_id,
      },
    });
  } catch (error) {
    const detail = plaidError(error);
    res.status(500).json({
      success: false,
      message: 'Error linking bank account',
      ...(detail && { error: detail }),
    });
  }
};

// Get Auth — uses stored (encrypted) token; never accepts token from client
export const getAuth = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const user = await User.findById(req.user.userId).select('+accessToken');

    if (!user || !user.accessToken) {
      return res.status(400).json({ success: false, message: 'No bank account linked' });
    }

    const plainToken = safeDecrypt(user.accessToken);
    const plaidResponse = await plaidClient.authGet({ access_token: plainToken });

    res.status(200).json({
      success: true,
      data: {
        accounts: plaidResponse.data.accounts,
        numbers: plaidResponse.data.numbers,
        item: plaidResponse.data.item,
        request_id: plaidResponse.data.request_id,
      },
    });
  } catch (error) {
    const detail = plaidError(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching account details',
      ...(detail && { error: detail }),
    });
  }
};

// Get Balance
export const getBalance = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const user = await User.findById(req.user.userId).select('+accessToken');

    if (!user || !user.accessToken) {
      return res.status(400).json({ success: false, message: 'No bank account linked' });
    }

    const plainToken = safeDecrypt(user.accessToken);
    const plaidResponse = await plaidClient.accountsBalanceGet({ access_token: plainToken });

    res.status(200).json({
      success: true,
      data: {
        accounts: plaidResponse.data.accounts,
        item: plaidResponse.data.item,
        request_id: plaidResponse.data.request_id,
      },
    });
  } catch (error) {
    const detail = plaidError(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching account balance',
      ...(detail && { error: detail }),
    });
  }
};

// Get Institution
export const getInstitution = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const { institution_id } = req.body;

    if (!institution_id) {
      return res.status(400).json({ success: false, message: 'Institution ID required' });
    }

    const plaidResponse = await plaidClient.institutionsGetById({
      institution_id,
      country_codes: [CountryCode.Gb, CountryCode.Us],
    });

    res.status(200).json({
      success: true,
      data: {
        institution: plaidResponse.data.institution,
        request_id: plaidResponse.data.request_id,
      },
    });
  } catch (error) {
    const detail = plaidError(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching institution details',
      ...(detail && { error: detail }),
    });
  }
};

// Get Transactions — uses stored (encrypted) token; never accepts token from client
export const getPlaidTransactions = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const { start_date, end_date } = req.body;

    const user = await User.findById(req.user.userId).select('+accessToken');

    if (!user || !user.accessToken) {
      return res.status(400).json({ success: false, message: 'No bank account linked' });
    }

    const plainToken = safeDecrypt(user.accessToken);

    const request = {
      access_token: plainToken,
      start_date: start_date || '2023-01-01',
      end_date: end_date || new Date().toISOString().split('T')[0],
    };

    const plaidResponse = await plaidClient.transactionsGet(request);

    let transactions = plaidResponse.data.transactions;
    const totalTransactions = plaidResponse.data.total_transactions;

    while (transactions.length < totalTransactions) {
      const paginatedResponse = await plaidClient.transactionsGet({
        ...request,
        options: { offset: transactions.length },
      });
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }

    res.status(200).json({
      success: true,
      data: {
        transactions,
        accounts: plaidResponse.data.accounts,
        total_transactions: totalTransactions,
        request_id: plaidResponse.data.request_id,
      },
    });
  } catch (error) {
    const detail = plaidError(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      ...(detail && { error: detail }),
    });
  }
};

// Sync Transactions — cursor-based /transactions/sync (Plaid recommended)
export const syncTransactions = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const user = await User.findById(req.user.userId).select('+accessToken');

    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: 'No bank account linked. Please link a bank account first.',
      });
    }

    const plainToken = safeDecrypt(user.accessToken);

    const Transaction = (await import('../models/transactionModel.js')).default;

    let cursor = req.body?.reset ? null : (user.plaidCursor || null);
    let added = [];
    let modified = [];
    let removed = [];
    let hasMore = true;

    while (hasMore) {
      const params = { access_token: plainToken };
      if (cursor) params.cursor = cursor;

      let response;
      try {
        response = await plaidClient.transactionsSync(params);
      } catch (syncErr) {
        const code = syncErr.response?.data?.error_code;
        if (code === 'TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION' || cursor) {
          cursor = null;
          added = []; modified = []; removed = [];
          response = await plaidClient.transactionsSync({ access_token: plainToken });
        } else {
          throw syncErr;
        }
      }

      const { data } = response;
      added    = added.concat(data.added    || []);
      modified = modified.concat(data.modified || []);
      removed  = removed.concat(data.removed  || []);
      hasMore  = data.has_more;
      cursor   = data.next_cursor;
    }

    await User.findByIdAndUpdate(user._id, { plaidCursor: cursor });

    const toAmount = (plaidAmount) => -plaidAmount;
    const toCategory = (txn) =>
      txn.personal_finance_category?.primary ||
      (Array.isArray(txn.category) ? txn.category[0] : null) ||
      'Other';

    let savedCount = 0;
    for (const txn of added) {
      const exists = await Transaction.findOne({ plaidTransactionId: txn.transaction_id });
      if (!exists) {
        const newTx = await Transaction.create({
          userId: user._id,
          plaidTransactionId: txn.transaction_id,
          date: txn.date,
          description: txn.name,
          amount: toAmount(txn.amount),
          category: toCategory(txn),
          pending: txn.pending,
          isManual: false,
        });
        await User.findByIdAndUpdate(user._id, { $addToSet: { transactions: newTx._id } });
        savedCount++;
      }
    }

    let modifiedCount = 0;
    for (const txn of modified) {
      const result = await Transaction.findOneAndUpdate(
        { plaidTransactionId: txn.transaction_id },
        {
          date: txn.date,
          description: txn.name,
          amount: toAmount(txn.amount),
          category: toCategory(txn),
          pending: txn.pending,
        }
      );
      if (result) modifiedCount++;
    }

    let removedCount = 0;
    for (const txn of removed) {
      const deleted = await Transaction.findOneAndDelete({ plaidTransactionId: txn.transaction_id });
      if (deleted) {
        await User.findByIdAndUpdate(user._id, { $pull: { transactions: deleted._id } });
        removedCount++;
      }
    }

    console.log(`Sync complete: +${savedCount} added, ~${modifiedCount} modified, -${removedCount} removed`);

    res.status(200).json({
      success: true,
      message: `Sync complete: ${savedCount} new, ${modifiedCount} updated, ${removedCount} removed`,
      data: { added: savedCount, modified: modifiedCount, removed: removedCount },
    });
  } catch (error) {
    const detail = plaidError(error);
    res.status(500).json({
      success: false,
      message: 'Error syncing transactions',
      ...(detail && { error: detail }),
    });
  }
};

// Remove Link — revokes Plaid access, deletes all transactions, clears user state
export const removePlaidLink = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const user = await User.findById(req.user.userId).select('+accessToken');

    if (user?.accessToken) {
      try {
        const plainToken = safeDecrypt(user.accessToken);
        await plaidClient.itemRemove({ access_token: plainToken });
      } catch (plaidError) {
        console.error('Plaid itemRemove error (continuing):', plaidError?.response?.data || plaidError.message);
      }
    }

    const Transaction = (await import('../models/transactionModel.js')).default;

    await Transaction.deleteMany({ userId: req.user.userId });

    await User.findByIdAndUpdate(req.user.userId, {
      $unset: { accessToken: '', plaidItemId: '', plaidCursor: '' },
      $set: { transactions: [] },
    });

    res.status(200).json({
      success: true,
      message: 'Bank account unlinked and all transactions deleted',
    });
  } catch (error) {
    const detail = plaidError(error);
    res.status(500).json({
      success: false,
      message: 'Error unlinking bank account',
      ...(detail && { error: detail }),
    });
  }
};
