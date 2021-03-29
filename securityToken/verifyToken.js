const express = require('express')
const protectRoute = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const config = require('../private/key-jwt');
const userSchema = require('../models/Users')

protectRoute.use((req, res, next) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    const User = conn.model('users', userSchema)
	const token = req.headers['x-access-token'];
	if (!token) {
		return res.status(401).json({auth: false, message: 'no token provided'})
	}
    jwt.verify(token, config.key, (err, decoded) => {
        if (err) {
            return res.status(401).json({auth: false, message: 'token expired'})
        }else{
            User.findById(decoded._id)
            .then(verify => {
                if (!verify) {
                    return res.status(401).json({auth: false, message: 'invalid access'})
                }else{
                    const payload = {
                        _id: verify._id,
                        name: verify.name,
                        user: verify.user,
                        LastAccess: verify.LastAccess
                    }
                    let tokenReload = jwt.sign(payload, config.key, {
                        expiresIn: 60 * 60 * 24
                    })
                    req.requestToken = tokenReload
                    next();
                } 
            })
        }
    })
});

module.exports = protectRoute