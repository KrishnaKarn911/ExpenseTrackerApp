const Razorpay = require('razorpay');
const Order=require('../models/order');
const jwt=require('jsonwebtoken');

const signToken = (id, isPremium) => {
    return jwt.sign({ id: id, isPremium: isPremium }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


exports.purchasepremium = async(req,res)=>{
    try{
        var instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });
          const amount = 2500;
          var options = {
            amount: amount,  
            currency: "INR",
            receipt: "order_rcptid_11"
          };
          instance.orders.create(options, function(err, order) {
            if(err){
                
                console.log(err);
            }
            //console.log(order);
            req.user.createOrder({
                orderId: order.id,
                status: "PENDING",
            }).then(()=>{
                return res.status(201).json({
                    order,
                    key_id: instance.key_id
                })
            }).catch(err=>{
                throw new Error(err);
            })
            
          });

    }catch(err){
        res.status(500).json({
            message: "Something went wrong",
            err,
        })
    }
}

exports.updateTransactionStatus = (req,res)=>{
    const {payment_id, order_id} = req.body;
    Order.findOne({where: {orderId: order_id}}).then(order=>{
        order.update({paymentId: payment_id, status:"SUCCESSFUL"}).then(()=>{

            req.user.update({isPremium: true}).then(()=>{
                 return res.status(201).json({
                    status: "success",
                    message: "Transaction successfully completed",
                    token: signToken(req.user.id, true)
                })
                 }).catch(err=>{
                    return res.status(500).json({
                            status:"failed",
                            message:"Something went wrong",
                            err
                     })
               })
          }).catch(err=>{
        return res.status(500).json({
            status:"failed",
            message:"Something went wrong",
            err
       })
    })
    }).catch(err=>{
        return res.status(500).json({
            status:"failed",
            message:"Something went wrong",
            err
    })
 })
}
