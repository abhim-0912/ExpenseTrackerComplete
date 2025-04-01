const { Expense, User } = require("../models/index");
const sequelize = require("../config/database");
const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");
const { writeToPath } = require("fast-csv");

exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log(req.body);
    const userId = req.userId;
    const { expenseName, amount, expenseType } = req.body;
    if (!expenseName || !expenseType) {
      return res.status(400).json({
        success: false,
        message: "Expense name and type are required",
      });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number",
      });
    }
    const newExpense = await Expense.create(
      {
        userId,
        expenseName,
        amount,
        expenseType,
      },
      { transaction: t }
    );
    const userData = await User.findOne({ where: { id: userId } });
    const currExpense = userData.totalExpense;
    const updatedExpense = currExpense + parseFloat(amount);
    await User.update(
      { totalExpense: updatedExpense },
      { where: { id: userId }, transaction: t }
    );
    await t.commit();
    console.log(newExpense);
    res.status(201).json({
      success: true,
      message: "New Expense created",
      expense: newExpense,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message,
    });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const offset = (page - 1) * limit;
    const { count, rows } = await Expense.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      expenses: rows,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to find expenses",
      error: error.message,
    });
  }
};

exports.editExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log(req.body);
    const expenseId = req.params.id;
    const { expenseName, amount, expenseType } = req.body;
    const userId = req.userId;
    const expenseStored = await Expense.findOne({ where: { id: expenseId } });
    console.log(expenseStored);
    if (!expenseStored) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }
    if (Number(userId) !== Number(expenseStored.userId)) {
      console.log(userId);
      console.log(expenseStored.userId);
      return res
        .status(403)
        .json({ success: false, message: "Forbidden access" });
    }
    const updatedExpense = {};
    if (req.body.expenseName) {
      updatedExpense.expenseName = req.body.expenseName;
    }
    if (req.body.amount) {
      updatedExpense.amount = req.body.amount;
    }
    if (req.body.expenseType) {
      updatedExpense.expenseType = req.body.expenseType;
    }
    console.log(updatedExpense);
    await Expense.update(updatedExpense, {
      where: { id: expenseId, userId },
      transaction: t,
    });
    const expenseUpdated = await Expense.findOne({ where: { id: expenseId } });
    const userData = await User.findOne({ where: { id: userId } });
    const originalAmount = parseFloat(expenseStored.amount);
    const newAmount =
      updatedExpense.amount !== undefined
        ? parseFloat(updatedExpense.amount)
        : originalAmount;
    const updatedTotalExpense =
      userData.totalExpense - originalAmount + newAmount;
    await User.update(
      { totalExpense: updatedTotalExpense },
      { where: { id: userId }, transaction: t }
    );
    console.log(expenseUpdated);
    await t.commit();
    res.status(200).json({
      success: true,
      message: "Expense Updated succesfully",
      expense: expenseUpdated,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: "Failed to update the Expense",
      error: error.message,
    });
  }
};

exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.userId;
    const expenseId = req.params.id;
    const deleteExpense = await Expense.findOne({ where: { id: expenseId } });
    console.log(deleteExpense);
    if (!deleteExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }
    if (Number(userId) !== Number(deleteExpense.userId)) {
      console.log(userId);
      console.log(deleteExpense.userId);
      return res
        .status(403)
        .json({ success: false, message: "Forbidden access" });
    }
    const userData = await User.findOne({ where: { id: userId } });
    const updatedExpense = userData.totalExpense - deleteExpense.amount;
    await User.update(
      { totalExpense: updatedExpense },
      { where: { id: userId }, transaction: t }
    );
    await deleteExpense.destroy({ transaction: t });
    await t.commit();
    res
      .status(200)
      .json({ success: true, message: "Deleted the Expense Successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: "Error in deleting the expense",
      error: error.message,
    });
  }
};

function getISOWeekString(date) {
  const temp = new Date(date);
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  const weekNo =
    1 +
    Math.round(
      ((temp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    );
  return `${temp.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

exports.downloadReport = async (req, res) => {
  try {
    const userId = req.userId;
    const expenses = await Expense.findAll({ where: { userId } });

    const weekly = {};
    const monthly = {};
    const yearly = {};
    const rows = [];

    expenses.forEach((exp) => {
      const dateObj = new Date(exp.createdAt);
      const dayKey = format(dateObj, "yyyy-MM-dd");
      const weekKey = getISOWeekString(dateObj);
      const monthKey = format(dateObj, "yyyy-MM");
      const yearKey = format(dateObj, "yyyy");

      // ✅ Daily rows with full detail
      rows.push({
        Date: dayKey,
        Expense: exp.expenseName,
        Type: exp.expenseType,
        Amount: parseFloat(exp.amount).toFixed(2),
        Category: "Daily",
      });

      // Accumulate for summaries
      weekly[weekKey] = (weekly[weekKey] || 0) + parseFloat(exp.amount);
      monthly[monthKey] = (monthly[monthKey] || 0) + parseFloat(exp.amount);
      yearly[yearKey] = (yearly[yearKey] || 0) + parseFloat(exp.amount);
    });

    // ✅ Summary rows with only Date, Amount, Category
    for (let [week, amount] of Object.entries(weekly)) {
      rows.push({
        Date: week,
        Expense: "",
        Type: "",
        Amount: amount.toFixed(2),
        Category: "Weekly",
      });
    }
    for (let [month, amount] of Object.entries(monthly)) {
      rows.push({
        Date: month,
        Expense: "",
        Type: "",
        Amount: amount.toFixed(2),
        Category: "Monthly",
      });
    }
    for (let [year, amount] of Object.entries(yearly)) {
      rows.push({
        Date: year,
        Expense: "",
        Type: "",
        Amount: amount.toFixed(2),
        Category: "Yearly",
      });
    }

    const fileName = `report-user${userId}-${Date.now()}.csv`;
    const filePath = path.join(__dirname, "../public/downloads", fileName);
    const downloadsDir = path.join(__dirname, "../public/downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    await writeToPath(filePath, rows, {
      headers: ["Date", "Expense", "Type", "Amount", "Category"],
    });

    const fileUrl = `/downloads/${fileName}`;
    res.status(200).json({ success: true, fileUrl });
  } catch (error) {
    console.error("CSV Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate CSV report",
      error: error.message,
    });
  }
};
