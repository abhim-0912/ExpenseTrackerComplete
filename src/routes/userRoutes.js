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

module.exports = router;