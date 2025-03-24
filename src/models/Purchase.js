const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');
const User = require('./User');

const Purchase = sequelize.define('Purchase',{
    id : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references : {
            model: User,
            key: 'id'
        }
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
},
{
    timestamps: true
});

module.exports = Purchase;