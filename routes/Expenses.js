const express = require('express')
const expenses = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const expenseSchema = require('../models/Expenses')
const reinvestmentSchema = require('../models/Reinvestment')
const saleSchema = require('../models/Sales')
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
    const sinceActual = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() + 1)+"-1"
    const untilActual = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() + 1)+"-31"
    const sinceBefore = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() == 0 ? 12 : dateDaily.getMonth())+"-1"
    const untilBefore = dateDaily.getFullYear() +"-"+(dateDaily.getMonth() == 0 ? 12 : dateDaily.getMonth())+"-31"

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
                Mensual: 0
            }
            for (const expense of thisMonth) {
                thisTotals[expense.type] = expense.amount + thisTotals[expense.type]
            }
            var beforeTotals = {
                Inventario: 0,
                Bono: 0,
                Mensual: 0
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
        const findReinvesment = await Reinvestment.findOne({branch: req.body.branch})
        if (findReinvesment) {
            if (findReinvesment.validator) {
                res.json({status: 'ok', data: findReinvesment, token: req.requestToken})
            }else{
                res.json({status: 'bad', data: findReinvesment, token: req.requestToken})
            }
        }else{
            const data = {
                branch: req.body.branch,
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

    const gain = ((req.body.totalFinal - req.body.reinvestment) / req.body.totalFinal) * 100
    const data = {
        reinvestment: formats.price(req.body.reinvestment),
        sales: formats.price(req.body.sales),
        expenses: formats.price(req.body.expenses),
        commissions: formats.price(req.body.commissions),
        totalFinal: formats.price(req.body.totalFinal),
        gain: gain.toFixed(2)
    }
    const options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        footer: {
            height: "10mm",
            contents: {
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
            }
        }
    };
    try {
        const findExpenses = await Expense.find({
            $and: [
                {branch: req.body.branch},
                {validator: true}
            ]
        })
        var expenses = []
        for (const expense of findExpenses) {
            expenses.push({
                detaill: expense.detail,
                typee: expense.type,
                createdAt: formats.dates(expense.createdAt),
                amount: formats.price(expense.amount)
            })
        }
        const document = {
            html: html,
            data: {
                expenses: expenses,
                data: data
            },
            path: "./public/reportExpenses.pdf",
            type: "",
        };
        console.log(expenses)
        pdf
        .create(document, options)
        .then(async (respon) => {
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
                    const updateSale = await Sale.updateMany({
                        $and: [
                            {branch: req.body.branch},
                            {expenseValid: true}
                        ]},
                        {
                        $set: {
                            expenseValid: false
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
                        res.json({status: 'ok'})
                    }catch(err){res.send(err)}
                }catch(err){res.send(err)}
            }catch(err){res.send(err)}
        })
        .catch((error) => {
            console.error(error);
        });
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
expenses.delete('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Expense = conn.model('expenses', expenseSchema)

    try {
        const deleteExpense = await Expense.findByIdAndRemove(req.params.id)
        if (deleteExpense) {
            res.json({status: 'ok', token: req.requestToken})  
        }
    }catch(err){
        res.send(err)
    }
})

module.exports = expenses