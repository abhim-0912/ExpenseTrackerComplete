const sequelize = require('./database');
const User = require('../models/User');

(async () => {
    try {
        await sequelize.sync({alter: true});
        console.log("Database synced");
    }
    catch(error) {
        console.log("Error in Syncing database : ",error);
    } finally {
        process.exit();
    }
})();