const ROUTER =require('express-promise-router')();
const CONTROLLER =require('../controllers/three_d');
const SCHEMA =require('../schemas/three_d');
const VALIDATOR =require('../../helpers/validator');
ROUTER.post('/check_three_d_number',VALIDATOR.validateBody(SCHEMA.check_three_d),CONTROLLER.checkThreeD);
ROUTER.post('/save_three_d_number',VALIDATOR.validateBody(SCHEMA.save_three_d),CONTROLLER.saveThreeD);
ROUTER.post('/three_d_ticket_ledger',VALIDATOR.validateBody(SCHEMA.check_between_date),CONTROLLER.threeDTicketNumber);
ROUTER.post('/three_d_delete_ticket_ledger',VALIDATOR.validateBody(SCHEMA.check_between_date),CONTROLLER.threeDDeleteTicketNumber);
ROUTER.post('/delete_three_d_ticket',VALIDATOR.validateBody(SCHEMA.check_id),CONTROLLER.deleteThreeDTicket);
ROUTER.post('/three_d_table_numbers',VALIDATOR.validateBody(SCHEMA.check_date),CONTROLLER.threeDTableNumber);
ROUTER.post('/cut_number',VALIDATOR.validateBody(SCHEMA.check_date),CONTROLLER.threeDCutNumber);
ROUTER.post('/cut_by_name',VALIDATOR.validateBody(SCHEMA.cut_number),CONTROLLER.cutByName);
ROUTER.post('/cash_voucher',VALIDATOR.validateBody(SCHEMA.check_id),CONTROLLER.cashVoucher);
ROUTER.post('/profit_ledger',VALIDATOR.validateBody(SCHEMA.check_between_date),CONTROLLER.getProfitLedger);
ROUTER.post('/three_d_final_ledger',VALIDATOR.validateBody(SCHEMA.check_date),CONTROLLER.getThreeDFinalLedger);
ROUTER.post('/remark',VALIDATOR.validateBody(SCHEMA.check_remark),CONTROLLER.remarkThreeD);
module.exports = ROUTER;

