const express = require('express');
const authmiddleware = require('../middleware/authorisationMiddleware');
const premiumController = require('../controllers/premiumController');
const router = express.Router();

router.get('/showleaderboard',premiumController.showLeaderBoard)

router.get('/reportsPage',premiumController.reportsPage);
router.get('/reports', authmiddleware.userAuthorisation ,premiumController.getExpensesByMonth);

module.exports = router;