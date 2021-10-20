const mongoose = require('mongoose')
const branchSchema = require('../models/Branch')

class Connection {
    constructor(database){
        this.conn = mongoose.createConnection('mongodb://localhost/'+database, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
    }

    returnConnection(){
        // const Branch = this.conn.model('branches', branchSchema)
        return this.conn
    }
}

module.exports = Connection