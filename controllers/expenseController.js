const AppError = require('../utils/appError');
const Expense = require('../models/expense');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const FileURL = require('../models/fileDownload');
const sequelize = require('../config/database');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_KEY_PASSWORD
})

const s3= new AWS.S3();




exports.postExpenses = async (req,res, next) => {
    try{
        const t=await sequelize.transaction();
        const { description, amount, category } = req.body;
        const userId = req.user.id;

        // Create expense
       const newExpense = await Expense.create({
            description,
            amount,
            category,
            userId
        },{transaction: t})
       // console.log(req.user.totalExpense);
       // console.log(amount);

        const totalExpense = Number(req.user.totalExpense)+Number(amount);
        await User.update(
                             { totalExpense: totalExpense },{ where:{id: userId},transaction: t }
                         )
       // console.log(totalExpense); 
        await t.commit();   
        res.status(200).json({
                status: "success",
                message: "Expense created successfully",
                data: newExpense
            });
    }catch(err){
        await t.rollback();
        res.status(500).json({
            status: "fail",
            message: "something went wrong",
            data: err 
    });
        
    }
       
}

exports.getExpense = catchAsync(async(req,res,next)=>{

    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const offset = (page - 1) * limit;

    const { count, rows: expense } = await Expense.findAndCountAll({
        where: { userId: userId },
        limit: limit,
        offset: offset
    });

    if (!expense) {
        return next(new AppError('No Expense found with that id', 404));
    }
    res.status(200).json({
        status: 'success',
        data:{
            expense,
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        }
    })
})


exports.downloadReport = async (req,res)=>{
    try{
    const userId = req.user.id;

    const expenses = await Expense.findAll({where: {userId: userId}})
   // console.log(expenses);
    const stringifiedExpense = JSON.stringify(expenses);

    //console.log(stringifiedExpense);

    const params = {
        Bucket: 'expensetrackerdata',
      Key: `expense-${userId}-${Date()}.json`,
      Body: Buffer.from(stringifiedExpense),
      ContentType: 'application/json',
      ACL: 'public-read'
    }

    s3.upload(params, async(err, data) => {
        try {
            if (err) {
              console.error('Error uploading data: ', err);
              return res.status(500).send('Error uploading data');
            }
            const filedownloadurl = await FileURL.create({
                fileURL: data.Location,
                userId: userId
    
            })
            
          
            res.status(200).json({
                status: "success",
                data,
                filedownloadurl,
    
            });
        } catch (error) {
            console.log(error);
        }
      });

    }catch (error) {
        console.error('Error fetching or uploading data: ', error);
        res.status(500).send('Error fetching or uploading data');
      }
    
}

exports.getFileURL = catchAsync(async(req,res, next)=>{
    const userId = req.user.id;
    const fileURLs = await FileURL.findAll({where: {userId: userId}});
   // console.log(fileURLs);
    const links = fileURLs.map(fileURL => fileURL.dataValues.fileURL)
    res.status(200).json({
        status: "success",
        links
    })
})

exports.deleteExpense = async (req, res) => {
  try{
    const t=await sequelize.transaction();
    const userId = req.user.id;
     
    const expenseId = req.params.id;

    const deleteExpense = await Expense.findOne({where:{id:expenseId}, transaction:t});
    const totalExpense=Number(req.user.totalExpense)-Number(deleteExpense.amount);
    await User.update({totalExpense: totalExpense},{where:{id:userId}});
    const deletedExpense = await Expense.destroy({where:{id: expenseId}, transaction: t});
     

if (!deletedExpense) {
   
    return res.status(404).json({
        status: "error",
        message: "Expense not found"
    });
}

 await t.commit()
// Respond with success message
res.status(200).json({
    status: "success",
    message: "Expense deleted successfully",
    data: deletedExpense
});
  }catch(err){
    await t.rollback();
    res.status(500).json({
        status: "fail",
        message: "something went wrong",
        data: err 
     })
    }
}
        
