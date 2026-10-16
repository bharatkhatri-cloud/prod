const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    created_on: {
        type: Date, 
        default: () => new Date(),
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true, // All existing users will remain active
    },
    updated_at: {
        type: Date,
        default: () => new Date(),
    },

});


userSchema.methods.getTWTToken = function () {
    const secret = process.env.JWT_SECRET || "iughiugdgduibfiudbgjijdfgasjkfjksadfuiusdfbsdbfjksdfjkOIHHOGDFOGH";
    const expire = process.env.JWT_EXPIRE || "5d";
    return jwt.sign({ id: this._id, name: this.name, role: this.role, email: this.email }, secret, { expiresIn: expire });
};

module.exports = mongoose.model("User", userSchema); 
