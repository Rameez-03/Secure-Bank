import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import User from '../models/userModel.js';

// Helper function to get Plaid client (creates new instance each time with current env vars)
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

// Create Link Token
export const createLinkToken = async (req, res) => {
  try {
    const plaidClient = getPlaidClient(); // Get client with current env vars

    const request = {
      user: {
        client_user_id: req.user.userId.toString(),
      },
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
      }
    });
  } catch (error) {
    console.error("Error creating link token:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Error creating link token",
      error: error.response?.data || error.message
    });
  }
};

// Exchange Public Token for Access Token
export const exchangePublicToken = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const { public_token } = req.body;

    if (!public_token) {
      return res.status(400).json({
        success: false,
        message: "Public token required"
      });
    }

    const plaidResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const accessToken = plaidResponse.data.access_token;
    const itemId = plaidResponse.data.item_id;

    // Save access token to user
    await User.findByIdAndUpdate(req.user.userId, {
      accessToken: accessToken,
      plaidItemId: itemId
    });

    res.status(200).json({
      success: true,
      message: "Bank account linked successfully",
      data: {
        item_id: itemId,
        request_id: plaidResponse.data.request_id
      }
    });
  } catch (error) {
    console.error("Error exchanging public token:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Error linking bank account",
      error: error.response?.data || error.message
    });
  }
};

// Get Auth
export const getAuth = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: "Access token required"
      });
    }

    const plaidResponse = await plaidClient.authGet({
      access_token: access_token,
    });

    res.status(200).json({
      success: true,
      data: {
        accounts: plaidResponse.data.accounts,
        numbers: plaidResponse.data.numbers,
        item: plaidResponse.data.item,
        request_id: plaidResponse.data.request_id
      }
    });
  } catch (error) {
    console.error("Error getting auth:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Error fetching account details",
      error: error.response?.data || error.message
    });
  }
};

// Get Balance
export const getBalance = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const user = await User.findById(req.user.userId);

    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: "No bank account linked"
      });
    }

    const plaidResponse = await plaidClient.accountsBalanceGet({
      access_token: user.accessToken,
    });

    res.status(200).json({
      success: true,
      data: {
        accounts: plaidResponse.data.accounts,
        item: plaidResponse.data.item,
        request_id: plaidResponse.data.request_id
      }
    });
  } catch (error) {
    console.error("Error getting balance:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Error fetching account balance",
      error: error.response?.data || error.message
    });
  }
};

// Get Institution
export const getInstitution = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const { institution_id } = req.body;

    if (!institution_id) {
      return res.status(400).json({
        success: false,
        message: "Institution ID required"
      });
    }

    const plaidResponse = await plaidClient.institutionsGetById({
      institution_id: institution_id,
      country_codes: [CountryCode.Gb, CountryCode.Us],
    });

    res.status(200).json({
      success: true,
      data: {
        institution: plaidResponse.data.institution,
        request_id: plaidResponse.data.request_id
      }
    });
  } catch (error) {
    console.error("Error getting institution:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Error fetching institution details",
      error: error.response?.data || error.message
    });
  }
};

// Get Transactions
export const getPlaidTransactions = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const { access_token, start_date, end_date } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: "Access token required"
      });
    }

    const request = {
      access_token: access_token,
      start_date: start_date || '2023-01-01',
      end_date: end_date || new Date().toISOString().split('T')[0],
    };

    const plaidResponse = await plaidClient.transactionsGet(request);

    // Fetch all pages
    let transactions = plaidResponse.data.transactions;
    const totalTransactions = plaidResponse.data.total_transactions;
    
    while (transactions.length < totalTransactions) {
      const paginatedRequest = {
        ...request,
        options: { offset: transactions.length },
      };
      const paginatedResponse = await plaidClient.transactionsGet(paginatedRequest);
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }

    res.status(200).json({
      success: true,
      data: {
        transactions: transactions,
        accounts: plaidResponse.data.accounts,
        total_transactions: totalTransactions,
        request_id: plaidResponse.data.request_id
      }
    });
  } catch (error) {
    console.error("Error getting transactions:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: error.response?.data || error.message
    });
  }
};

// Sync Transactions
export const syncTransactions = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const user = await User.findById(req.user.userId);

    if (!user || !user.accessToken) {
      return res.status(400).json({
        success: false,
        message: "No bank account linked. Please link a bank account first."
      });
    }

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    
    const request = {
      access_token: user.accessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    };

    const plaidResponse = await plaidClient.transactionsGet(request);
    
    let allTransactions = plaidResponse.data.transactions;
    const totalTransactions = plaidResponse.data.total_transactions;
    
    while (allTransactions.length < totalTransactions) {
      const paginatedRequest = {
        ...request,
        options: { offset: allTransactions.length },
      };
      const paginatedResponse = await plaidClient.transactionsGet(paginatedRequest);
      allTransactions = allTransactions.concat(paginatedResponse.data.transactions);
    }

    const Transaction = (await import('../models/transactionModel.js')).default;
    const savedTransactions = [];
    
    for (const plaidTxn of allTransactions) {
      const existingTxn = await Transaction.findOne({ 
        plaidTransactionId: plaidTxn.transaction_id 
      });

      if (!existingTxn) {
        const newTransaction = await Transaction.create({
          userId: req.user.userId,
          plaidTransactionId: plaidTxn.transaction_id,
          date: plaidTxn.date,
          description: plaidTxn.name,
          amount: plaidTxn.amount,
          category: plaidTxn.category?.[0] || 'Other',
          pending: plaidTxn.pending,
          isManual: false
        });

        await User.findByIdAndUpdate(req.user.userId, {
          $addToSet: { transactions: newTransaction._id }
        });

        savedTransactions.push(newTransaction);
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${savedTransactions.length} new transactions`,
      data: {
        synced_count: savedTransactions.length,
        total_plaid_transactions: allTransactions.length,
        request_id: plaidResponse.data.request_id
      }
    });

  } catch (error) {
    console.error("Error syncing transactions:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Error syncing transactions",
      error: error.response?.data || error.message
    });
  }
};

// Remove Link
export const removePlaidLink = async (req, res) => {
  try {
    const plaidClient = getPlaidClient();
    const user = await User.findById(req.user.userId);

    if (user && user.accessToken) {
      try {
        await plaidClient.itemRemove({
          access_token: user.accessToken,
        });
      } catch (plaidError) {
        console.error("Error removing Plaid item:", plaidError);
      }
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $unset: { accessToken: "", plaidItemId: "" }
    });

    res.status(200).json({
      success: true,
      message: "Bank account unlinked successfully"
    });
  } catch (error) {
    console.error("Error removing Plaid link:", error.response?.data || error);
    res.status(500).json({
      success: false,
      message: "Error unlinking bank account",
      error: error.response?.data || error.message
    });
  }
};

