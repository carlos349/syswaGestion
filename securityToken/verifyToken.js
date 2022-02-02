const express = require('express')
const protectRoute = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const key = require('../private/key-jwt');
const userSchema = require('../models/Users')
const connect = require('../mongoConnection/conectionInstances')
const root = require('../private/user-root')
protectRoute.use((req, res, next) => {
    const database = req.headers['x-database-connect'];
    
    const User = connect.useDb(database).model('users', userSchema)
	const token = req.headers['x-access-token'];
	if (!token) {
		return res.status(401).json({auth: false, message: 'no token provided'})
	}
    jwt.verify(token, key, (err, decoded) => {
        if (err) {
            return res.status(401).json({auth: false, message: 'token expired', error: err})
        }else{
            if (decoded._id == root.payload._id) {
                const payload = root.payload
                let tokenReload = jwt.sign(payload, key, {
                    expiresIn: 60 * 60 * 24
                })
                req.requestToken = tokenReload
                next();
            }else{
                User.findById(decoded._id)
                .then(verify => {
                    if (!verify) {
                        return res.status(401).json({auth: false, message: 'invalid access'})
                    }else{
                        const payload = {
                            _id: verify._id,
                            first_name: verify.first_name,
                            last_name: verify.last_name,
                            branch: verify.branch,
                            email: verify.email,
                            about: verify.about,
                            status: verify.status,
                            access: verify.access,
                            userImage: verify.userImage,
                            LastAccess: verify.LastAccess,
                            linkLender: verify.linkLender
                        }
                        let tokenReload = jwt.sign(payload, key, {
                            expiresIn: 60 * 60 * 24
                        })
                        req.requestToken = tokenReload
                        next();
                    } 
                })
            }
            
        }
    })
});

module.exports = protectRoute