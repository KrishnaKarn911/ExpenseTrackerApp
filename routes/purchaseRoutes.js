const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const authenticateController = require('../middleware/authorisationMiddleware');

const router = express.Router();

router.get('/premiummembership',authenticateController.userAuthorisation, purchaseController.purchasepremium);
router.post('/updateTransactionStatus',authenticateController.userAuthorisation, purchaseController.updateTransactionStatus)

module.exports = router;