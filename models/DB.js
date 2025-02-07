const UserDB = require('../models/users');
const SettingDB = require('../models/settings');
const MoneyChangeDB = require('../models/money_changes');
const TicketLedgerDB = require('../models/ticket_ledgers');
const PriceSettingDB = require('../models/price_setting');
const WinNumberDB = require('../models/win_numbers');
const RefillRecordDB = require('../models/refill_records');
const BornNumberDB = require('../models/born_numbers');
const TransferDB = require('../models/ticket_transfers');
const PromotionDB = require('../models/promotions');
const TwoDNumberDB = require('../models/two_d_numbers');
const TwoDWinNumberDB = require('../models/two_d_win_numbers');
const TwoDCutNumber = require('../models/two_d_cut_numbers');
const TwoDSettingDB = require('../models/two_d_settings');
const TwoDBlockNumberDB = require('../models/two_d_block_numbers');
const TwoDKyatNumberDB = require('../models/two_d_kyat_numbers');
const TwoDKyatCutNumber = require('../models/two_d_cut_kyat_numbers');
const TwoDBlockKyatNumberDB = require('../models/two_d_block_kyat_numbers');
const THREE_D_SETTING_DB = require('../three_d_package/models/three_d_settings');
const THREE_D_TICKET_DB = require("../three_d_package/models/three_d_tickets");
const THREE_D_BLOCK_NUMBER_DB = require("../three_d_package/models/three_d_block_numbers");
const THREE_D_CUT_NUMBER_DB = require('../three_d_package/models/three_d_cut_numbers');
const THREE_D_WIN_NUMBER_DB = require('../three_d_package/models/three_d_win_numbers');
const LAO_SETTING_DB = require('../lao_package/models/lao_settings');
const LAO_BLOCK_NUMBER_DB = require('../lao_package/models/lao_block_numbers');
const LAO_CUT_NUMBER_DB = require('../lao_package/models/lao_cut_numbers');
const LAO_WIN_NUMBER_DB = require('../lao_package/models/lao_win_numbers');
const LAO_TICKET_DB = require('../lao_package/models/lao_tickets');
const LAO_KYAT_TICKET_DB = require('../lao_package/models/lao_kyat_tickets');
const THREE_D_KYAT_TICKET_DB = require("../three_d_kyat_package/models/three_d_kyat_tickets");
const THREE_D_BLOCK_KYAT_NUMBER_DB = require("../three_d_kyat_package/models/three_d_block_kyat_numbers");
const THREE_D_CUT_KYAT_NUMBER_DB = require('../three_d_kyat_package/models/three_d_cut_kyat_numbers');
const THAI_BALANCE_DB = require('../models/thai_balances');
const THAI_LEDGER = require('../thai_package/models/thai_ledgers');
const THAI_SHOP_LEDGER = require('../thai_package/models/thai_shop_ledgers');
const SIMPLE_PRICE_SETTING = require('../thai_package/models/simple_price_settings');
const THAI_CASH_LEDGER = require('../thai_package/models/thai_cash_ledgers');
const THAI_EXTRA = require('../thai_package/models/thai_extras');
module.exports = {
    UserDB,
    SettingDB,
    MoneyChangeDB,
    TicketLedgerDB,
    PriceSettingDB,
    WinNumberDB,
    RefillRecordDB,
    BornNumberDB,
    TransferDB,
    PromotionDB,
    TwoDNumberDB,
    TwoDWinNumberDB,
    TwoDCutNumber,
    TwoDSettingDB,
    TwoDBlockNumberDB,
    TwoDKyatNumberDB,
    TwoDKyatCutNumber,
    TwoDBlockKyatNumberDB,
    THREE_D_SETTING_DB,
    THREE_D_TICKET_DB,
    THREE_D_BLOCK_NUMBER_DB,
    THREE_D_CUT_NUMBER_DB,
    THREE_D_WIN_NUMBER_DB,
    LAO_SETTING_DB,
    LAO_BLOCK_NUMBER_DB,
    LAO_CUT_NUMBER_DB,
    LAO_WIN_NUMBER_DB,
    LAO_TICKET_DB,
    LAO_KYAT_TICKET_DB,
    THREE_D_KYAT_TICKET_DB,
    THREE_D_BLOCK_KYAT_NUMBER_DB,
    THREE_D_CUT_KYAT_NUMBER_DB,
    THAI_BALANCE_DB,
    THAI_LEDGER,
    THAI_SHOP_LEDGER,
    SIMPLE_PRICE_SETTING,
    THAI_CASH_LEDGER,
    THAI_EXTRA
}

