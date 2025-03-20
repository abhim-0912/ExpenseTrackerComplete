const User = require('./User');
const Expense = require('./Expense');

User.hasMany(Expense,{foreignKey: 'userId', onDelete: 'CASCADE'});
Expense.belongsTo(User,{foreignKey: 'userId', onDelete: 'CASCADE'});

module.exports = {User,Expense};