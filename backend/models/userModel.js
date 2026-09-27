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
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE,});
    // this se indivisual ka id milega. 
};

module.exports = mongoose.model("User", userSchema); 
