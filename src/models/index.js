const User = require('./User');
const Expense = require('./Expense');
const Purchase = require('./Purchase');

User.hasMany(Expense,{foreignKey: 'userId', onDelete: 'CASCADE'});
Expense.belongsTo(User,{foreignKey: 'userId', onDelete: 'CASCADE'});

User.hasMany(Purchase, { foreignKey: 'userId', onDelete: 'CASCADE' });
Purchase.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = {User,Expense,Purchase};