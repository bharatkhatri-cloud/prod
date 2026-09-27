
//Create Token and saving in cookie
const COOKIE_EXPIRE_TIME = 5;
const sentToken = (userDetails,statusCode,res)=>{
    const dbToken = userDetails.getTWTToken();

    //option for cookie
    const option={
        expires:new Date(
            // Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000
            Date.now()+COOKIE_EXPIRE_TIME*24*60*60*1000
        ),
        httpOnly:true,
        secure:true,
        sameSite:'none'
    };

    res.status(statusCode).cookie("dhaDbTkn",dbToken,option).json({
        success:true,
        userDetails,
        dbToken,
    });

};

module.exports = sentToken;


