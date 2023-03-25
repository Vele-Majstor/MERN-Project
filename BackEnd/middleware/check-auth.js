const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req,res,next)=>{
    if (req.method === "OPTIONS"){
        return next();
    }

    let token;
    try {
        token = req.headers.authorization.split(' ')[1];
        if (!token){
            throw new Error("Authorization failed");
        }
        const decodedToken = jwt.verify(token,'somePrivateKeyIdk');
        req.userData = {userId:decodedToken.userId};
        next();
    } catch (error) {
        const err = new HttpError(error.message,500);
        next(err);
    }
}