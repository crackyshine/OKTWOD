const fs = require('fs');
const DB = require('../models/DB');
const storage = file => "./migrations/backups/" + file + ".json";
const writeFile = async (file, data) => await fs.writeFileSync(file, JSON.stringify(data), "utf8");
const readFile = async (file) => JSON.parse(await fs.readFileSync(file, 'utf8'));

const migrator = {
    backup: async (DB, file) => {
        let data = await DB.find();
        await writeFile(storage(file), data);
        console.log(file, " Backup Done!");
    },
    restore: async (DB, file) => {
        let data = await readFile(storage(file));
        await DB.insertMany(data);
        console.log(file, " Migrated!");
    }
}

let backup = async () => {
    await migrator.backup(DB.UserDB, "users");
    await migrator.backup(DB.TicketLedgerDB, "ticket_ledgers");
    await migrator.backup(DB.WinNumberDB, "win_numbers");
}

let migrate = async () => {
    await migrator.restore(DB.UserDB, "users");
    await migrator.restore(DB.TicketLedgerDB, "ticket_ledgers");
    await migrator.restore(DB.WinNumberDB, "win_numbers");

}

module.exports = {
    backup,
    migrate
}