require('dotenv').config();
const {Sequelize} = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
});

sequelize.authenticate()
    .then(() => {
        console.log("Connected to MySQL with Sequelize");
    })
    .catch((error) => {
        console.log("Database connection failed : ",error);
    });

module.exports = sequelize;