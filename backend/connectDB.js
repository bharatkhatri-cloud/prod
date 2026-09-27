const mongoose = require('mongoose');

const connectDataBase = () => {
    let DB_URL = process.env.DB_URL;
    
    // Strip surrounding quotes (single or double) if present (common issue with Docker --env-file)
    if (DB_URL) {
        DB_URL = DB_URL.trim();
        if ((DB_URL.startsWith("'") && DB_URL.endsWith("'")) || 
            (DB_URL.startsWith('"') && DB_URL.endsWith('"'))) {
            DB_URL = DB_URL.slice(1, -1);
        }
    }

    if (!DB_URL) {
        console.error("DB_URL is not defined in the environment variables.");
        process.exit(1);
    }
    
    mongoose.connect(DB_URL).then(() => {
        console.log(`Connected with MongoDB at server: ${mongoose.connection.host}`);
    }).catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    });
}

module.exports = connectDataBase;
