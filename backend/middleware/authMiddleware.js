const errorHandler = require("../utils/Errorhandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{
    const {dhaDbTkn} = req.cookies;

    if (!dhaDbTkn) {
        return next(new errorHandler("Please Login to access this resources",401));
    }
    const decodeData = jwt.verify(dhaDbTkn,process.env.JWT_SECRET);
    req.user = await UserModel.findById(decodeData.id);
    // console.log("dhaDbTkn-authMiddleware2",req.user);
    next();
})

exports.authorizeRoles=(...roles)=>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role)) {
           
           return next( new errorHandler(
                `Role : ${req.user.role} is not allowed to access this resource`,403
           ));
        }
        next()
    }
}