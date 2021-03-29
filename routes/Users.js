const express = require('express')
const users = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const userSchema = require('../models/Users')
const bcrypt = require('bcrypt')
const cors = require('cors')
users.use(cors())

users.get('/', (req, res) => {
    res.send('holaaaa')
})

module.exports = users