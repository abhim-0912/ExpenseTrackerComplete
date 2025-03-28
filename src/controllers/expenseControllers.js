const { Expense, User } = require("../models/index");

exports.addExpense = async (req, res) => {
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
    const newExpense = await Expense.create({
      userId,
      expenseName,
      amount,
      expenseType,
    });
    const userData = await User.findOne({ where: { id: userId } });
    const currExpense = userData.totalExpense;
    const updatedExpense = currExpense + parseFloat(amount);
    await User.update(
      { totalExpense: updatedExpense },
      { where: { id: userId } }
    );
    console.log(newExpense);
    res.status(201).json({
      success: true,
      message: "New Expense created",
      expense: newExpense,
    });
  } catch (error) {
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
    const allExpenses = await Expense.findAll({ where: { userId } });

    res.status(200).json({ success: true, expenses: allExpenses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to find expenses",
      error: error.message,
    });
  }
};

exports.editExpense = async (req, res) => {
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
    await Expense.update(updatedExpense, { where: { id: expenseId, userId } });
    expenseUpdated = await Expense.findOne({ where: { id: expenseId } });
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
      { where: { id: userId } }
    );
    console.log(expenseUpdated);
    res.status(200).json({
      success: true,
      message: "Expense Updated succesfully",
      expense: expenseUpdated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update the Expense",
      error: error.message,
    });
  }
};

exports.deleteExpense = async (req, res) => {
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
      { where: { id: userId } }
    );
    await deleteExpense.destroy();
    res
      .status(200)
      .json({ success: true, message: "Deleted the Expense Successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in deleting the expense",
      error: error.message,
    });
  }
};
