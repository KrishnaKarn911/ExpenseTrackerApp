const path=require('path');
const Sib = require('sib-api-v3-sdk');
const User = require('../models/user');
const sendEmail = require('../utils/sendMail')
const crypto = require('crypto');
const {Op} = require('sequelize');
const jwt = require('jsonwebtoken');

const signToken = (id, isPremium) => {
    return jwt.sign({ id: id, isPremium: isPremium }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


exports.forgotpasswordPage = (req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','forgotpassword.html'));
}

exports.resetPasswordPage = (req,res)=>{
    res.sendFile(path.join(__dirname,'..','views','resetPassword.html'));
}

exports.forgotpassword = async(req,res)=>{
    try{
       // console.log(req.body.email);
        const  user = await User.findOne({where:{email: req.body.email}})
      //  console.log(user);
        if(!user){
            return res.status(404).json({
                status: "fail",
                message: "No user found"
            })
        }
        
        const resetToken = user.createPasswordResetToken();
        await user.save()

        const resetURL = `${req.protocol}://${req.get('host')}/password/resetPassword/${resetToken}`

        const message = `Forgot a password, click on the below link to reset the password::: ${resetURL}`;

        await sendEmail({
            email: req.body.email,
            message,
        })

        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        })
        
    }catch(err){
        user.passwordResetToken= undefined;
        user.passwordResetExpires=undefined;
       await  user.save()
        res.status(500).json({
            status: "fail",
            err
        })
    }
   

}

exports.resetPassword = async (req, res) => {
    try {
        // Get token from user
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
     //   console.log("From Reset Backend", hashedToken);

        const user = await User.findOne({
            where: {
                passwordResetToken: hashedToken, 
                passwordResetExpires: {
                    [Op.gt]: Date.now()
                }
            }
        });

        // If token has expired or user does not exist
        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "Token expired or User not available"
            });
        }

        // Update user's password
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        const token = signToken(user.id, user.isPremium);
       // console.log('Password Changed');

        res.status(200).json({
            status: "success",
            token
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json({
            status: "fail",
            message: err.message
        });
    }
};