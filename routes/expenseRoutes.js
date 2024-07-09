const express=require('express');
const authMiddleWare = require('../middleware/authorisationMiddleware')
const expenseController = require('../controllers/expenseController');

const router = express.Router();

router.get('/expense',authMiddleWare.userAuthorisation, expenseController.getExpense)

router.post('/expense',authMiddleWare.userAuthorisation,expenseController.postExpenses);

router.get('/expense/:id',expenseController.getExpense);

router.delete('/expense/:id',authMiddleWare.userAuthorisation , expenseController.deleteExpense);

router.get('/download', authMiddleWare.userAuthorisation, expenseController.downloadReport);

router.get('/links', authMiddleWare.userAuthorisation, expenseController.getFileURL);


module.exports=router;
