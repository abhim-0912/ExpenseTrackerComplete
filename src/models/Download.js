const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');
const User = require('./User');

const Download = sequelize.define('Download',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE'
    }
},{
    timestamps: true,
});
User.hasMany(Download,{foreignKey: 'userId',onDelete: "CASCADE"});
Download.belongsTo(User,{foreignKey: 'userId',onDelete: "CASCADE"});

module.exports = Download;