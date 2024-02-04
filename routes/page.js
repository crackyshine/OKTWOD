const Router = require('express-promise-router')();
const PageController = require('../controllers/page');
Router.post('/', PageController.login);
Router.get('/win_number/:search_date', PageController.getWinNumber);
module.exports = Router;