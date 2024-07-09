const User = require('../models/user');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');




exports.getAllUsers = catchAsync(async(req,res, next)=>{
    
        const users = await User.findAll();
        res.status(200).json({
            status: "success",
            data: {
                users
            }
        })
    
})

exports.signUpUser =  (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'views', 'signup.html'));
}



exports.loginUser = (req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'..','views','login.html'));
}
