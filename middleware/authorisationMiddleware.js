const jwt = require('jsonwebtoken');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')

exports.userAuthorisation = catchAsync(async(req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorized user... Try login again"
            });
        }

        // Remove 'Bearer ' prefix if it exists
        // if (token.startsWith('Bearer ')) {
        //     token = token.slice(7, token.length);
        // }

        const userObj = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(userObj.id);

        req.user = user;
        next();
    } catch (err) {
        console.log("In Middleware", err);
        res.status(401).json({
            status: "fail",
            message: "Unauthorized user... Try login again"
        });
    }
});