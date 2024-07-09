const express=require('express');
const passwordController = require('../controllers/passwordController');

const router = express.Router()


router.get('/forgotpassword',passwordController.forgotpasswordPage)
router.post('/forgotpassword',passwordController.forgotpassword);


router.get('/resetPassword/:token', passwordController.resetPasswordPage)
router.patch('/resetPassword/:token',passwordController.resetPassword)





module.exports=router;