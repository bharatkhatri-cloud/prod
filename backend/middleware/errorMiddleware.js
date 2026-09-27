const Errorhandler = require("../utils/Errorhandler")

exports.errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500; // Default status code is 500
    let message = err.message || 'Internal Server Error'; // Default error message

   
    if (err.name === "CastError") {
        const message = `Invalid MongoDB Id Error (Database error). Invalid : ${err.path}`;
        err = new Errorhandler(message,400)
    }


    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: err.message,
        error: err.stack
    });

    

} 