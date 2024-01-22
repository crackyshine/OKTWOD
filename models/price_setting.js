const MONGO = require('mongoose');
const Schema = MONGO.Schema;
const priceSettingDB = new Schema({
    show_id: {type: Number, default: 0},
    air: {
        first_price: {
            six_d: {
                title: {type: String, default: "ပထမဆု(၆)လုံးတိုက်"},
                amount: {type: Number, default: 160000}
            },
            back_five_d: {
                title: {type: String, default: "ပထမဆုနောက်(၅)လုံးတိုက်"},
                amount: {type: Number, default: 120000}
            },
            back_three_d: {
                title: {type: String, default: "ပထမဆုနောက်(၃)လုံးတိုက်"},
                amount: {type: Number, default: 40000}
            },
            front_five_d: {
                title: {type: String, default: "ပထမဆုရှေ့(၅)လုံးတိုက်"},
                amount: {type: Number, default: 3600}
            },
            back_three_near: {
                title: {type: String, default: "ပထမဆုနောက်(၃)လုံး(နီစပ်)"},
                amount: {type: Number, default: 1000}
            },
            back_three_permute: {
                title: {type: String, default: "ပထမဆုနောက်(၃)လုံး(ပတ်လည်)"},
                amount: {type: Number, default: 1000}
            },
            back_two_d: {
                title: {type: String, default: "ပထမဆုနောက်(၂)လုံးတိုက်"},
                amount: {type: Number, default: 1000}
            },
            back_two_permute: {
                title: {type: String, default: "ပထမဆုနောက်(၂)လုံးပြန်"},
                amount: {type: Number, default: 400}
            },
        },
        second_price: {
            six_d: {
                title: {type: String, default: "ဒုတိယဆု(၆)လုံးတိုက်"},
                amount: {type: Number, default: 4000}
            },
            front_five_d: {
                title: {type: String, default: "ဒုတိယဆုရှေ့(၅)လုံးတိုက်"},
                amount: {type: Number, default: 2400}
            },
            back_five_d: {
                title: {type: String, default: "ဒုတိယဆုနောက်(၅)လုံးတိုက်"},
                amount: {type: Number, default: 2000}
            },
            back_four_d: {
                title: {type: String, default: "ဒုတိယဆုနောက်(၄)လုံးတိုက်"},
                amount: {type: Number, default: 1000}
            },
            back_three_d: {
                title: {type: String, default: "ဒုတိယဆုနောက်(၃)လုံးတိုက်"},
                amount: {type: Number, default: 400}
            },
            back_three_equal: {
                title: {type: String, default: "ဒုတိယဆုနောက်(၃)လုံး(ထွိုင်)"},
                amount: {type: Number, default: 2400}
            },
            back_two_d: {
                title: {type: String, default: "ဒုတိယဆု(၂)လုံးတိုက်"},
                amount: {type: Number, default: 400}
            }
        },
        third_price: {
            six_d: {
                title: {type: String, default: "တတိယဆု(၆)လုံးတိုက်"},
                amount: {type: Number, default: 2000}
            },
            back_five_d: {
                title: {type: String, default: "တတိယဆုနောက်(၅)လုံးတိုက်"},
                amount: {type: Number, default: 1200}
            },
            back_four_d: {
                title: {type: String, default: "တတိယဆုနောက်(၄)လုံးတိုက်"},
                amount: {type: Number, default: 800}
            },
            back_three_d: {
                title: {type: String, default: "တတိယဆုနောက်(၃)လုံးတိုက်"},
                amount: {type: Number, default: 400}
            },
            back_three_equal: {
                title: {type: String, default: "တတိယဆုနောက်(၃)လုံး(ထွိုင်)"},
                amount: {type: Number, default: 2000}
            }
        },
        fourth_price: {
            back_five_d: {
                title: {type: String, default: "စတုတ္ထဆုနောက်(၅)လုံးတိုက်"},
                amount: {type: Number, default: 1200}
            },
            back_four_d: {
                title: {type: String, default: "စတုတ္ထဆုနောက်(၄)လုံးတိုက်"},
                amount: {type: Number, default: 400}
            },
            back_three_d: {
                title: {type: String, default: "စတုတ္ထဆုနောက်(၃)လုံးတိုက်"},
                amount: {type: Number, default: 400}
            },
            back_three_equal: {
                title: {type: String, default: "စတုတ္ထဆုနောက်(၃)လုံး(ထွိုင်)"},
                amount: {type: Number, default: 1200}
            },
        },
        fifth_price: {
            back_five_d: {
                title: {type: String, default: "ပဉ္စမဆုနောက်(၅)လုံးတိုက်"},
                amount: {type: Number, default: 1200}
            },
            back_four_d: {
                title: {type: String, default: "ပဉ္စမဆုနောက်(၄)လုံးတိုက်"},
                amount: {type: Number, default: 400}
            },
            back_three_equal: {
                title: {type: String, default: "ပဉ္စမဆုနောက်(၃)လုံး(ထွိုင်)"},
                amount: {type: Number, default: 600}
            },
        },
        below_price: {
            below_three_d: {
                title: {type: String, default: "နောက်(၃)လုံးတိုက်"},
                amount: {type: Number, default: 2000}
            },
            below_three_permute: {
                title: {type: String, default: "နောက်(၃)လုံးပတ်လည်"},
                amount: {type: Number, default: 400}
            },
            below_three_equal: {
                title: {type: String, default: "နောက်(၃)လုံး(ထွိုင်)"},
                amount: {type: Number, default: 2400}
            },
            below_two_d: {
                title: {type: String, default: "နောက်(၂)လုံးတိုက်"},
                amount: {type: Number, default: 1000}
            },
            below_two_permute: {
                title: {type: String, default: "နောက်(၂)လုံးပြန်"},
                amount: {type: Number, default: 400}
            }
        }
    },
    simple: {
        first_price: {type: String, default: "ပထမဆု(၆)လုံးတိုက်"},
        first_near: {type: String, default: "ပထမဆု(၆)လုံး(နီးစပ်)"},
        second_price: {type: String, default: "ဒုတိယဆု(၆)လုံးတိုက်"},
        third_price: {type: String, default: "တတိယဆု(၆)လုံးတိုက်"},
        fourth_price: {type: String, default: "စတုတ္ထဆု(၆)လုံးတိုက်"},
        fifth_price: {type: String, default: "ပဉ္စမဆု(၆)လုံးတိုက်"},
        upper_three_d: {type: String, default: "ရှေ့(၃)လုံးတိုက်"},
        below_three_d: {type: String, default: "နောက်(၃)လုံးတိုက်"},
        below_two_d: {type: String, default: "နောက်(၂)လုံးတိုက်"},
    }
});

const PriceSettingDB = MONGO.model('price_setting', priceSettingDB);
module.exports = PriceSettingDB;