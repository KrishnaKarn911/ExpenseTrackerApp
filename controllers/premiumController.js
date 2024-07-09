const sequelize = require('../config/database');
const Expense = require('../models/expense');
const User = require('../models/user');
const { Sequelize, Op } = require('sequelize');
const path=require('path')
const fs = require('fs');


exports.reportsPage =  (req, res) => {
  res.sendFile(path.join(__dirname,'..', 'views', 'reports.html'));
}



exports.showLeaderBoard = async(req,res)=>{
  try{
    const data=await User.findAll({
        order:[['totalExpense','DESC']]
    })
    res.status(200).json({
        status: "success",
        data
    })
  }catch(err){
    console.log(err);
  }
}





// Helper function to get month name
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

exports.getExpensesByMonth = async (req, res) => {
 
  const userId = req.user.dataValues.id; 
 // console.log("In controller", userId);
  try {
    // Step 1: Get grouped data by month and year
    const groupedExpenses = await Expense.findAll({
      where: { userId },
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'month'],
        [Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'year'],
      ],
      group: ['month', 'year'],
      order: [['year', 'DESC'], ['month', 'DESC']],
      raw: true
    });

    // Initialize result object
    const result = {};

    // Step 2: Fetch detailed expenses for each month
    for (const group of groupedExpenses) {
      const { month, year } = group;
      const monthName = getMonthName(month);
      const key = `${monthName} ${year}`;

      // Fetch expenses for the current group
      const expenses = await Expense.findAll({
        where: {
          userId,
          [Op.and]: [
            Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('createdAt')), month),
            Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('createdAt')), year),
          ]
        },
        raw: true
      });

      // Calculate total amount for the current group
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Add expenses and total amount to the result
      result[key] = {
        expenses,
        totalAmount
      };
    }

    const resultStringified = JSON.stringify(result)
     fs.writeFile(path.join(__dirname,'..','files','reportFile.json'),resultStringified,(err,data)=>{
      if(err){
        console.log(err);
      }
      console.log(data);
     }) 

    // Send the response
    res.status(200).json({
      status: 'success',
      result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve expenses by month'
    });
  }
};

exports.downloadReport = async(req,res)=>{
  try{
     
  }catch(err){

  }
}
