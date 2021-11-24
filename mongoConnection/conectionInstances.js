const mongoose = require('mongoose');

const connect = mongoose.createConnection('mongodb://localhost', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

module.exports = connect