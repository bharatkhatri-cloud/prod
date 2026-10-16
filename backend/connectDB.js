const mongoose = require('mongoose');

const connectDataBase = () => {
    let DB_URL = process.env.DB_URL || process.env.MONGODB_URI || 'mongodb+srv://serverTeam:KUyvLTDCKt0wrjer@dharakshadb.rodoa.mongodb.net/dharaksha?authSource=admin&retryWrites=true&w=majority&appName=dharakshaDB';
    
    // Strip surrounding quotes (single or double) if present (common issue with Docker --env-file)
    if (DB_URL) {
        DB_URL = DB_URL.trim();
        if ((DB_URL.startsWith("'") && DB_URL.endsWith("'")) || 
            (DB_URL.startsWith('"') && DB_URL.endsWith('"'))) {
            DB_URL = DB_URL.slice(1, -1);
        }
    }

    if (DB_URL && DB_URL.includes("Ankit%404202")) {
        DB_URL = DB_URL.replace("Ankit%404202", "KUyvLTDCKt0wrjer");
    }
    if (DB_URL && !DB_URL.includes("authSource=")) {
        DB_URL = DB_URL.includes("?") 
            ? DB_URL.replace("?", "?authSource=admin&") 
            : DB_URL + "?authSource=admin";
    }

    mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 8000 }).then(() => {
        console.log(`Connected with MongoDB at server: ${mongoose.connection.host}`);
    }).catch((err) => {
        console.warn("MongoDB not connected — some features may not work:", err.message);
    });
}

module.exports = connectDataBase;
