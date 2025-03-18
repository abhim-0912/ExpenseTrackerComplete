const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.use(express.json());

router.post('/signup', async (req,res) => {
    try {
        console.log(req.body);
        const {name,email,password} = req.body;

        const existingUser = await User.findOne({where: {email}});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }

        const newUser = await User.create({name,email,password});
        console.log(newUser);
        res.status(201).json({message: "User registered Succesfully", user: newUser});
    } catch (error) {
        res.status(500).json({message: "Database error",error: error.message});
    }
});

router.post('/login', async (req,res) => {
    try {
        console.log(req.body);
        const {email,password} = req.body;

        const existingUser = await User.findOne({where : {email}});
        if(existingUser){
            const storedPassword = existingUser.password;
            console.log(storedPassword);
            console.log(password);
            if(storedPassword === password){
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
});

module.exports = router;