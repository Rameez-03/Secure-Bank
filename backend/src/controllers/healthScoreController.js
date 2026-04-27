import Transaction from "../models/transactionModel.js";
import User from "../models/userModel.js";
import logger from "../utils/logger.js";

export const getHealthScore = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(1000);

    // No transactions = no meaningful data to score against
    if (transactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          score: 0,
          label: 'No Data',
          color: '#3F3F46',
          empty: true,
          components: [
            { name: 'Budget Adherence', score: 0, max: 25, detail: 'No data' },
            { name: 'Savings Rate', score: 0, max: 25, detail: 'No data' },
            { name: 'Monthly Spending Trend', score: 0, max: 25, detail: 'No data' },
            { name: 'Account Activity', score: 0, max: 25, detail: 'No data' },
          ],
        },
      });
    }

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisMonthTx = transactions.filter(
      (t) => new Date(t.date) >= startOfThisMonth
    );
    const lastMonthTx = transactions.filter(
      (t) =>
        new Date(t.date) >= startOfLastMonth &&
        new Date(t.date) < startOfThisMonth
    );

    const thisMonthSpending = thisMonthTx
      .filter((t) => t.type === "debit" || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const thisIncome = thisMonthTx
      .filter((t) => t.type === "credit" || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const lastMonthSpending = lastMonthTx
      .filter((t) => t.type === "debit" || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const recentTx = transactions.filter(
      (t) => new Date(t.date) >= sevenDaysAgo
    );

    // --- Component 1: Budget Adherence ---
    let budgetScore = 0;
    let budgetDetail = "";

    const budget = user.budget;
    if (!budget || budget <= 0) {
      budgetScore = 12;
      budgetDetail = "No budget set";
    } else {
      const ratio = thisMonthSpending / budget;
      if (ratio <= 0.5) {
        budgetScore = 25;
        budgetDetail = "Well under budget";
      } else if (ratio <= 0.75) {
        budgetScore = 22;
        budgetDetail = "On track";
      } else if (ratio <= 0.9) {
        budgetScore = 18;
        budgetDetail = "Approaching limit";
      } else if (ratio <= 1.0) {
        budgetScore = 15;
        budgetDetail = "Near limit";
      } else if (ratio <= 1.25) {
        budgetScore = 6;
        budgetDetail = "Over budget";
      } else {
        budgetScore = 0;
        budgetDetail = "Significantly over budget";
      }
    }

    // --- Component 2: Savings Rate ---
    let savingsScore = 0;
    let savingsDetail = "";

    if (thisIncome <= 0) {
      savingsScore = 8;
      savingsDetail = "No income recorded";
    } else {
      const savingsRate = (thisIncome - thisMonthSpending) / thisIncome;
      const pct = Math.round(savingsRate * 100);

      if (savingsRate >= 0.3) {
        savingsScore = 25;
        savingsDetail = `Saving ${pct}%`;
      } else if (savingsRate >= 0.2) {
        savingsScore = 20;
        savingsDetail = `Saving ${pct}%`;
      } else if (savingsRate >= 0.1) {
        savingsScore = 15;
        savingsDetail = `Saving ${pct}%`;
      } else if (savingsRate >= 0.0) {
        savingsScore = 10;
        savingsDetail = `Saving ${pct}%`;
      } else {
        savingsScore = 0;
        savingsDetail = "Spending exceeds income";
      }
    }

    // --- Component 3: Monthly Spending Trend ---
    let trendScore = 0;
    let trendDetail = "";

    if (lastMonthSpending <= 0) {
      trendScore = 15;
      trendDetail = "No prior month data";
    } else {
      const change =
        (thisMonthSpending - lastMonthSpending) / lastMonthSpending;
      const pct = Math.round(Math.abs(change) * 100);

      if (change <= -0.1) {
        trendScore = 25;
        trendDetail = `Down ${pct}% vs last month`;
      } else if (change <= 0.0) {
        trendScore = 20;
        trendDetail = "Similar to last month";
      } else if (change <= 0.1) {
        trendScore = 17;
        trendDetail = `Up ${pct}% vs last month`;
      } else if (change <= 0.3) {
        trendScore = 10;
        trendDetail = `Up ${pct}% vs last month`;
      } else {
        trendScore = 4;
        trendDetail = `Up ${pct}% vs last month`;
      }
    }

    // --- Component 4: Account Activity ---
    let activityScore = 0;

    if (thisIncome > 0) activityScore += 12;
    if (recentTx.length > 0) activityScore += 8;
    if (thisMonthTx.length >= 5) activityScore += 5;
    if (activityScore > 25) activityScore = 25;

    let activityDetail = "";
    if (activityScore >= 20) {
      activityDetail = "Regular activity & income";
    } else if (activityScore >= 12) {
      activityDetail = "Income this month";
    } else if (activityScore >= 8) {
      activityDetail = "Recent transactions";
    } else {
      activityDetail = "No recent activity";
    }

    // --- Total Score ---
    const totalScore = budgetScore + savingsScore + trendScore + activityScore;

    let label = "";
    let color = "";

    if (totalScore >= 85) {
      label = "Excellent";
      color = "#10B981";
    } else if (totalScore >= 70) {
      label = "Very Good";
      color = "#16A34A";
    } else if (totalScore >= 55) {
      label = "Good";
      color = "#EAB308";
    } else if (totalScore >= 35) {
      label = "Fair";
      color = "#D97706";
    } else {
      label = "Poor";
      color = "#DC2626";
    }

    res.status(200).json({
      success: true,
      data: {
        score: totalScore,
        label,
        color,
        components: [
          { name: "Budget Adherence", score: budgetScore, max: 25, detail: budgetDetail },
          { name: "Savings Rate", score: savingsScore, max: 25, detail: savingsDetail },
          { name: "Monthly Spending Trend", score: trendScore, max: 25, detail: trendDetail },
          { name: "Account Activity", score: activityScore, max: 25, detail: activityDetail },
        ],
      },
    });
  } catch (error) {
    logger.error("getHealthScore.error", { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: "Server error" });
  }
};
