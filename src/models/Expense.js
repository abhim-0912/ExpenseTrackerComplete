const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');
const User = require('./User');

const Expense = sequelize.define('Expense',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    expenseName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    expenseType: {
        type: DataTypes.STRING,
        allowNull: false,
    }
},{
        timestamps: true,
});

Expense.belongsTo(User, {foreignKey: 'userId', onDelete: 'CASCADE'});

module.exports = Expense;

