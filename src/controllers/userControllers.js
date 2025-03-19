const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.signup = async (req,res) => {
    try {
        console.log(req.body);
        const {name,email,password} = req.body;

        const existingUser = await User.findOne({where: {email}});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }
        const saltRounds = 10;
        const encryptedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({name,email,password: encryptedPassword});
        console.log(newUser);
        res.status(201).json({message: "User registered Succesfully", user: newUser});
    } catch (error) {
        res.status(500).json({message: "Database error",error: error.message});
    }
};

exports.login = async (req,res) => {
    try {
        console.log(req.body);
        const {email,password} = req.body;

        const existingUser = await User.findOne({where : {email}});
        if(existingUser){
            const storedPassword = existingUser.password;
            console.log(storedPassword);
            console.log(password);
            const isMatch = await bcrypt.compare(password,storedPassword);
            if(isMatch){
                return res.status(200).json({message: "Login Successful"});
            } else {
                res.status(400).json({message: "Password Incorrect"});
            }
        } else {
            res.status(400).json({message: "User not found"});
        }
    } catch(error) {
        res.status(500).json({message: "Database error",error: error.message});
    }
};