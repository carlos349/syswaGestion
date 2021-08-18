const express = require('express')
const expenses = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const expenseSchema = require('../models/Expenses')
const reinvestmentSchema = require('../models/Reinvestment')
const historyExpensesSchema = require('../models/HistoryExpenses')
const employeSchema = require('../models/Employes')
const saleSchema = require('../models/Sales')
const inventorySchema = require('../models/Inventory')
const cashfundSchema = require('../models/CashFunds')
const formats = require('../formats')
const pdf = require("pdf-creator-node");
const fs = require("fs");
const html = fs.readFileSync("./templatesPDF/reportExpenses.html", "utf8");

const cors = require('cors')

expenses.use(cors())

// Api to find expenses by this month and after month
//input null - output status, data, token
expenses.get('/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Expense = conn.model('expenses', expenseSchema)

    const dateDaily = new Date()
    const sinceActual = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() + 1)+"-1 00:00"
    const untilActual = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() + 1)+"-31 24:00"
    const sinceBefore = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() == 0 ? 12 : dateDaily.getMonth())+"-1 00:00"
    const untilBefore = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() == 0 ? 12 : dateDaily.getMonth())+"-31 24:00"

    try{
        const thisMonth = await Expense.find({
            $and: [
                {createdAt: { $gte: sinceActual, $lte: untilActual }},
                {branch: req.params.branch},
                {validator: true}
            ]
        })
        try {
            const beforeMonth = await Expense.find({
                $and: [
                    {createdAt: { $gte: sinceBefore, $lte: untilBefore }},
                    {branch: req.params.branch}
                ]
            })
            var thisTotals = {
                Inventario: 0,
                Bono: 0,
                Mensual: 0,
                Comision: 0
            }
            for (const expense of thisMonth) {
                thisTotals[expense.type] = expense.amount + thisTotals[expense.type]
            }
            var beforeTotals = {
                Inventario: 0,
                Bono: 0,
                Mensual: 0,
                Comision: 0
            }
            for (const expense of beforeMonth) {
                beforeTotals[expense.type] = expense.amount + beforeTotals[expense.type]
            }
            const data = {
                expenses: thisMonth,
                expenseTotals: thisTotals,
                expenseTotalsBefore: beforeTotals
            }
            res.json({status: 'ok', data: data, token: req.requestToken})
        }catch(err){
            res.send(err)
        }
    }catch(err){
        res.send(err)
    }
})

// Api to find expenses by this month and after month
//input null - output status, data, token
expenses.get('/findReinvestment/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Reinvestment = conn.model('reinvestments', reinvestmentSchema)

    try {
        const findReinvesment = await Reinvestment.findOne({branch: req.params.branch})
        if (findReinvesment) {
            if (findReinvesment.validator) {
                res.json({status: 'ok', data: findReinvesment, token: req.requestToken})
            }else{
                res.json({status: 'bad', data: findReinvesment, token: req.requestToken})
            }
        }else{
            const data = {
                branch: req.params.branch,
                amount: 0,
                amountEgress: 0,
                validator: false
            }
            try {
                const createReinvestment = await Reinvestment.create(data)
                if (createReinvestment) {
                    res.json({status: 'bad', data: findReinvesment, token: req.requestToken})
                }
            }catch(err){
                res.send(err)
            }
        }
    }catch(err){
        res.send(err)
    }
})

// Api to create expense
// input branch, detail, amount, type - output status, token
expenses.post('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Expense = conn.model('expenses', expenseSchema)
    const data = {
        branch: req.body.branch,
        detail: req.body.detail,
        amount: req.body.amount,
        employe: req.body.employe,
        type: req.body.type,
        validator: true,
        createdAt: new Date()
    }

    try {
        const createExpense = await Expense.create(data)
        if (createExpense) {
            res.json({status: 'ok', token: req.requestToken})  
        }
    }catch(err){
        res.send(err)
    }
})

// Api to find expenses by this month and after month
//input null - output status, data, token
expenses.post('/findByDates/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Expense = conn.model('expenses', expenseSchema)
    
    try {
        const findExpenses = await Expense.find({
            $and: [
                {branch: req.params.branch},
                {createdAt: { $gte: req.body.dates[0]+' 00:00', $lte: req.body.dates[1]+' 24:00' }},
            ]
        })
        if (findExpenses.length > 0) {
            res.json({status: 'ok', data: findExpenses, token: req.requestToken})
        }else{
            res.json({status: 'bad'})
        }
    }catch(err){
        res.send(err)
    }
    
})

// Api to create expense
// input branch, detail, amount, type - output status, token
expenses.post('/closeExpenses', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Expense = conn.model('expenses', expenseSchema)
    const Sale = conn.model('sales', saleSchema)
    const Reinvestment = conn.model('reinvestments', reinvestmentSchema)
    const HistoryExpense = conn.model('historyexpenses', historyExpensesSchema)

    const gain = ((req.body.totalFinal - req.body.reinvestment) / req.body.totalFinal) * 100
    const data = {
        reinvestment: formats.price(req.body.reinvestment),
        sales: formats.price(req.body.sales),
        expenses: formats.price(req.body.expenses),
        totalFinal: formats.price(req.body.totalFinal),
        gain: gain.toFixed(2)
    }
    const historyData = {
        expenses: [],
        totals: {},
        branch: req.body.branch,
        createdAt: new Date()
    }
    
    try {
        const findExpenses = await Expense.find({
            $and: [
                {branch: req.body.branch},
                {validator: true}
            ]
        })
        var expenses = []
        var expensesNumber = []
        for (const expense of findExpenses) {
            expenses.push({
                detaill: expense.detail,
                typee: expense.type,
                createdAt: formats.dates(expense.createdAt),
                amount: formats.price(expense.amount)
            })
            expensesNumber.push({
                detaill: expense.detail,
                typee: expense.type,
                createdAt: formats.dates(expense.createdAt),
                amount: expense.amount
            })
        }
        historyData.expenses = expensesNumber
        historyData.totals = data
        try {
            const editSales = await Sale.updateMany({ closeExpense: true },
            {
                $set: {
                    closeExpense: false
                }
            })
            try {
                const findExpenses = await Expense.updateMany({
                    $and: [
                        {branch: req.body.branch},
                        {validator: true}
                    ]},
                    {
                    $set: {
                        validator: false
                    }
                })
                try {
                    const updateReinvestment = await Reinvestment.findByIdAndUpdate(req.body.reinvestmentId, {
                        $set: {
                            amount: 0,
                            amountEgress: 0,
                            validator: false
                        }
                    })
                    try {
                        const createHistory = await HistoryExpense.create(historyData)
                        res.json({status: 'ok'})
                    }catch(err){res.send(err)}
                }catch(err){res.send(err)}
            }catch(err){res.send(err)}
        }catch(err){res.send(err)}
    }catch(err){
        res.send(err)
    }
})

// Api to valid close
expenses.post('/validclose', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    const Inventory = conn.model('inventories', inventorySchema)
    const CashFund = conn.model('cashfunds', cashfundSchema)

    try {
        const findEmployes = await Employe.find({branch: req.body.branch})
        if (findEmployes) {
            var validEmployes = true
            findEmployes.forEach(element => {
                if (element.commission > 0) {
                    validEmployes = false
                }
            });
            if (validEmployes == false) {
                res.json({status:'bad employes', token: req.requestToken})
            }else{
                try{
                    const findInventories = await Inventory.find({branch: req.body.branch})
                    if (findInventories) {
                        var validInventories = true
                        findInventories.forEach(element => {
                            if (element.entry > 0 || element.consume > 0) {
                                validInventories = false
                            }
                        })
                        if (validInventories == false) {
                            res.json({status:'bad inventories', token: req.requestToken})
                        }else{
                            try{
                                const findCashFound = await CashFund.find({branch: req.body.branch})
                                if (findCashFound) {
                                    if (findCashFound[0].validator) {
                                        res.json({status:'bad cashfound', token: req.requestToken})
                                    }else{
                                        res.json({status:'ok',data:findEmployes, data2:findInventories, data3:findCashFound,  token: req.requestToken})
                                    }
                                }
                            }catch(err){
                                res.send(err)
                            }
                        }
                    }
                }catch(err){
                    res.send(err)
                }
            }
        }
    }catch(err){
        res.send(err)
    }
})

// Api to find expenses by this month and after month
//input null - output status, data, token
expenses.put('/regReinvestment/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Reinvestment = conn.model('reinvestments', reinvestmentSchema)
    try {
        const editReinvestment = await Reinvestment.findByIdAndUpdate(req.params.id, {
            $set: {
                amount: req.body.amount,
                validator: true
            }
        })
        if (editReinvestment) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

// Api to delete expense
// input branch, detail, amount, type - output status, token
expenses.put('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Expense = conn.model('expenses', expenseSchema)
    const Employe = conn.model('employes', employeSchema)

    try {
        const deleteExpense = await Expense.findByIdAndRemove(req.params.id)
        if (deleteExpense) {
            if (req.body.type == 'Comision') {
                try {
                    const employeEdit = await Employe.findByIdAndUpdate(req.body.idEmploye, {
                        $inc: {
                            advancement: parseFloat('-'+req.body.total)
                        }
                    })
                    if (employeEdit) {
                        res.json({status: 'ok', token: req.requestToken})
                    }
                }catch(err){res.send(err)}
            }

            if (req.body.type == 'Bono') {
                try {
                    const employeEdit = await Employe.findByIdAndUpdate(req.body.idEmploye, {
                        $inc: {
                            bonus: parseFloat('-'+req.body.total)
                        }
                    })
                    if (employeEdit) {
                        res.json({status: 'ok', token: req.requestToken})
                    }
                }catch(err){res.send(err)}
            }

            res.json({status: 'ok', token: req.requestToken})  
        }
    }catch(err){
        res.send(err)
    }
})

module.exports = expenses