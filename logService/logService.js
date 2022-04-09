const mongoose = require('mongoose');
const logSchema = require('../models/Log')
const jwt_decode = require("jwt-decode");
const connect = require('../mongoConnection/conectionInstances')

class Log {
    constructor (host, body, params, error, token, database, route){
        this.conn = connect.useDb("syswalogs")
        this.host = host
        this.body = body
        this.params = params
        this.error = error
        this.token = token
        this.database = database
        this.route = route
        this.user = ''
    }

    getUserByToken(){
        if (this.token != undefined) {
            const decoded = jwt_decode(this.token)
            return {
                name: decoded.first_name + ' '+ decoded.last_name,
                email: decoded.email,
                id: decoded._id,
                status: decoded.status,
                LastAccess: decoded.lastAccess,
                branch: decoded.branch
            }
        }else{
            return {
                name: 'no-token-provided',
                email: 'no-token-provided',
                id: 'no-token-provided',
                status: 'no-token-provided',
                LastAccess: 'no-token-provided',
                branch: 'no-token-provided'
            }
        }
    }

    async createLog (){
        const Logs = this.conn.model('logs', logSchema)

        const dataLog = {
            host: this.host,
            body: this.body,
            route: this.route,
            params: this.params,
            error: this.error,
            user: this.getUserByToken(),
            database: this.database,
            createdAt: new Date()
        }
        
        try {
            const createLog = await Logs.create(dataLog)
            return createLog
        }catch(err){
            console.log(err)
        }
    }
} 

module.exports = Log