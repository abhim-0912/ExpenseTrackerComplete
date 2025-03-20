const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({success: false, message: "Acces denied. No token provided."});
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;

        next();

    } catch(error) {
        return res.status(401).json({success: false, message: "Invalid or expired token."});
    }
};