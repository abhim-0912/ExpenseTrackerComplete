const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    totalExpense: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    resetToken : {
        type: DataTypes.STRING,
        allowNull: true
    },
    tokenExpiry : {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = User;