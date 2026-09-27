const catchAsyncError = require("../middleware/catchAsyncError");
const userModel = require("../models/userModel");
const UserModel = require("../models/userModel");
const ApiFeatures = require("../utils/Apifeatures");
const Errorhandler = require("../utils/Errorhandler");
var CryptoJS = require("crypto-js");
const sentToken = require("../utils/jwtToken");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

exports.createUser = catchAsyncError(async (req, res, next) => {
    const userData = req.body;

    // console.log("userData",userData);
    let user = await userModel.findOne({ "email": req.body.email });
    if (user) {
        return next(new Errorhandler("Email Already Taken", 404));
    }

    console.log("userData.password", userData.password);
    console.log("userData.cfmPassword", userData.cfmPassword);

    if (userData.password !== userData.cfmPassword) {
        return next(new Errorhandler("Password not match", 422));
    }


    // Hash password
    var hashedPassword = CryptoJS.AES.encrypt(userData.password, process.env.AES_SECRET).toString();
    userData.password = hashedPassword;

    let createdUser = await UserModel.create(userData)
    if (!createdUser) {
        return next(new Errorhandler("Error in user creation", 404));
    }
    res.status(201).json({
        success: true,
        message: "User Added Successfully",
        userData
    })
})

exports.getUsers = catchAsyncError(async (req, res, next) => {

    const resultPerPage = 50;
    const totalUserData = await UserModel.countDocuments()


    const apiFeatures = new ApiFeatures(UserModel.find({ isActive: true }), req.query).filter().pagination(resultPerPage);
    const usersData = await apiFeatures.query;
    if (!usersData) {
        return next(new Errorhandler("Users not found", 404));
    }

    res.status(200).json({
        message: "Users data",
        totalCount: usersData.length,
        totalUserData,
        usersData
    })
})




//! old delete user if below is working then remove it 
// exports.deleteUser = catchAsyncError(async (req, res, next) => {
//     let user = await userModel.findById(req.params.id);
//     const loggedInUser = req.user;

//     if (loggedInUser._id.toString() === req.params.id) {
//         return next(new Errorhandler("You Can't Delete Yourself", 404))
//     }

//     if (!user) {
//         return next(new Errorhandler("User Not Found", 404))
//     }

//     await user.deleteOne();

//     res.status(200).json({
//         success: true,
//         message: "User Remove"

//     });
// });

exports.deleteUser = catchAsyncError(async (req, res, next) => {
    let user = await userModel.findById(req.params.id);
    const loggedInUser = req.user;

    if (loggedInUser._id.toString() === req.params.id) {
        return next(new Errorhandler("You Can't Delete Yourself", 403));
    }

    if (!user) {
        return next(new Errorhandler("User Not Found", 404));
    }

    const result = await userModel.updateOne(
        { _id: req.params.id },
        { $set: { isActive: false, deActivatedAt: new Date() } },
        {
            new: true,
            runValidators: true,
            strict: false
        }
    );

    if (result.modifiedCount === 0) {
        return next(new Errorhandler("Failed to delete user", 500));
    }

    res.status(200).json({
        success: true,
        message: "User has been deleted",
    });
});








exports.loginUser = catchAsyncError(async (req, res, next) => {
    console.log("HHHHHHHHHHHHHHHHHHHHHHHhh");
    const enteredData = req.body;
    if (!enteredData.email || !enteredData.password) {
        return next(new Errorhandler("Please Enter Email & Password", 404));
    }

    let user = await userModel.findOne({ "email": enteredData.email , isActive: true});
    

    if (user) {

        var bytes = CryptoJS.AES.decrypt(user.password, process.env.AES_SECRET);
        var pwd = bytes.toString(CryptoJS.enc.Utf8);

        if (enteredData.email == user.email && enteredData.password == pwd) {
            // If credentials match, send the token and user details
            const dbToken = user.getTWTToken();

            const COOKIE_EXPIRE_TIME = 5;
            const option = {
                expires: new Date(Date.now() + COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000),
                // expires: new Date(Date.now() +  30*60 * 1000),
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            };

            res.status(200).cookie("dhaDbTkn", dbToken, option).json({
                message: `You have successfully logged in, Mr./Ms. "${user.name}".`,
                success: true,
                user,
                dhaDbTkn: dbToken
            });


            // sentToken(user, 200, res);
        } else {
            return next(new Errorhandler("Invalid credentials", 401));
        }
    } else {
        return next(new Errorhandler("Unauthorized attempt: External users are restricted; kindly contact the admin for assistance.", 401));
    }
});



exports.loggedInUserProfile = catchAsyncError(async (req, res, next) => {
    const loggedInUser = req.user;
    const { dhaDbTkn } = req.cookies;
    if (!loggedInUser) {
        return next(new Errorhandler("Please Login to access this data", 404))
    }
    res.status(200).json({
        success: true,
        loggedInUser,
        dhaDbTkn
    });
});




exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("dhaDbTkn", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });

    res.status(200).json({
        success: true,
        message: "Logout Out",
    })
})


exports.sendUserInfoEmail = catchAsyncError(async (req, res, next) => {
    const { email } = req.query;

    // Find the user
    let user = await userModel.findOne({ email });
    if (!user) {
        return next(new Errorhandler("User not found", 404));
    }

    // Decrypt password
    let bytes = CryptoJS.AES.decrypt(user.password, process.env.AES_SECRET);
    let decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);


    // Generate a JWT token that expires in 5 minutes
    const token = jwt.sign(
        {
            userId: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                password: decryptedPassword,
                created_on: user.created_on
            }
        },
        process.env.EMAIL_JWT_SECRET,
        { expiresIn: "5m" }
    );

    // Construct the temporary access link
    const accessLink = `${process.env.FRONTEND_URL}access-user-info?token=${token}`;
    // const accessLink = `${`http://localhost:3000`}/access-user-info?token=${token}`;

    const loginnedAdmin = req.user
    
    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.FROM_EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: loginnedAdmin.email,
        subject: `${user.name} Account Information (Temporary Access)`,
        html: `
            <p>Hii ${""}</p>
            <p>You can access account details using the link below. This link will expire in 5 minutes:</p>
            <a href="${accessLink}" target="_blank">Access Account Info</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Regards,<br/>Your Team</p>
        `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return next(new Errorhandler("Failed to send email: " + error.message, 500));
        }

        res.status(200).json({
            success: true,
            message: `User info sent to this email ${loginnedAdmin.email}`,
            info: info.response,
        });
    });
});





exports.accessUserInfo = catchAsyncError(async (req, res, next) => {
    const { token } = req.query;

    if (!token) {
        return next(new Errorhandler("Invalid or expired link", 400));
    }
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.EMAIL_JWT_SECRET);
    const user = decoded.userId


    if (!user) {
        return next(new Errorhandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user
    });


});