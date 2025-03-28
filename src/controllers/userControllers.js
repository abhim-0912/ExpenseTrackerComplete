const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signup = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const saltRounds = 10;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      name,
      email,
      password: encryptedPassword,
    });
    console.log(newUser);
    res
      .status(201)
      .json({ message: "User registered Succesfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const storedPassword = existingUser.password;
      console.log(storedPassword);
      console.log(password);
      const isMatch = await bcrypt.compare(password, storedPassword);
      if (isMatch) {
        const token = jwt.sign(
          { id: existingUser.id, isPremium: existingUser.isPremium }, // include isPremium here
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res
          .status(200)
          .json({ success: true, message: "Login Successful", token });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Password Incorrect" });
      }
    } else {
      res.status(400).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Database error",
        error: error.message,
      });
  }
};

exports.leaderboardFeature = async (req, res) => {
  try {
    const userExpenses = await User.findAll({
      attributes: ["name", "totalExpense"],
      order: [["totalExpense", "DESC"]],
    });

    res.status(200).json({ success: true, leaderboard: userExpenses });
  } catch (error) {
    console.log("Failed to fetch total Expenses: ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
