const express = require('express')
const employes = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const employeSchema = require('../models/Employes')
const credentials = require('../private/private-credentials')
const bcrypt = require('bcrypt')
const cors = require('cors')
const jwt = require('jsonwebtoken')
employes.use(cors())