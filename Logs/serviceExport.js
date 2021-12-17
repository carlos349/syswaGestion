const log4js = require('log4js');

log4js.configure({
    appenders: {
        node: {
            type: 'file',
            filename: "./Logs/LogsRecords/node.log"
        },
        dates: {
            type: 'file',
            filename: "./Logs/LogsRecords/dates.log"
        }
    },
    categories: {
        default: {
            appenders: ["node"],
            level: "info"
        },
        dates: {
            appenders: ["dates"],
            level: "info"
        }
    }
});

module.exports = log4js;