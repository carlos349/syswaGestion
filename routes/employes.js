const express = require('express')
const employes = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const employeSchema = require('../models/Employes')
const userSchema = require('../models/Users')
const datesBlockSchema = require('../models/datesBlocks')
const serviceSchema = require('../models/Services')
const expenseSchema = require('../models/Expenses')
const saleSchema = require('../models/Sales')
const cors = require('cors')

employes.use(cors())

// Api que busca todos los empleados. (Ingreso: nulo) -- Api that search all the users. (input: Null)

employes.get('/', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    try{
        const getEmployes = await Employe.find()
        if (getEmployes.length > 0) {
            res.json({status: 'ok', data: getEmployes, token: req.requestToken})
        }else{
            res.json({status:'There is not employes'})
        }
    }catch(err){
        res.send(err)
    }
})


employes.get('/UsersEmployes/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    const User = conn.model('users', userSchema)

    try{
        const getEmployes = await Employe.find()
        if (getEmployes.length > 0) {
            try {
                const users = await User.populate(getEmployes, {path: "users"})
                console.log(users)
                const sendData =  []
                for (const employe of users) {
                    if (employe.users) {
                        sendData.push({name: employe.firstName + ' '+ employe.lastName, img: employe.users.userImage != '' ? employe.users.userImage : 'no', days: employe.days, class: employe.class, _id: employe._id})
                    }else{
                        sendData.push({name: employe.firstName + ' '+ employe.lastName, img: 'no', days: employe.days, class: employe.class, _id: employe._id})
                    }
                }
                res.json({status: 'ok', data: sendData, token: req.requestToken})
            }catch(err){
                res.send(err)
            }
        }else{
            res.json({status:'There is not employes'})
        }
    }catch(err){
        res.send(err)
    }
})
// Fin de la api. (Retorna datos de los empeados) -- Api end (output employes' data)

//----------------------------------------------------------------------------------

// Api que busca un solo empleado por id. (Ingreso: ObjectId) -- Api that search one an by id. (Input: ObjectId)

employes.get('/justonebyid/:id', protectRoute, async (req, res) =>{
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    try{
        const findById = await Employe.findById(req.params.id)
        if (findById) {
            res.json({status: 'ok', data: findById, token: req.requestToken})
        }else{
            res.json({status: 'employe not found'})
        }
    }catch(err){
        res.send(err)
    }

})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//----------------------------------------------------------------------------------

// Api que busca empleados por branch. (Ingreso:Branch´s ObjectId) -- Api that search employes by branch. (Input: Branch´s ObjectId)

employes.get('/employesbybranch/:branch', protectRoute, async (req, res) =>{
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    const User = conn.model('users', userSchema)

    try{
        const findByBranch = await Employe.find({branch: req.params.branch})
        if (findByBranch) {
            try {
                const users = await User.populate(findByBranch, {path: "users"})
                for (const user of users) {
                    if (user.users) {
                        user.users.password = 'password removed for security'
                    }
                }
                res.json({status: 'ok', data: users, token: req.requestToken})
            }catch(err){
                res.send(err)
            }
        }else{
            res.json({status: 'employes not found'})
        }
    }catch(err){
        res.send(err)
    }

})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//----------------------------------------------------------------------------------

// Api que busca empleados por branch. (Ingreso:Branch´s ObjectId) -- Api that search employes by branch. (Input: Branch´s ObjectId)

employes.get('/employesbybranchForClients/:branch', async (req, res) =>{
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    try{
        const findByBranch = await Employe.find({branch:req.params.branch})
        if (findByBranch) {
            res.json({status: 'ok', data: findByBranch, token: req.requestToken})
        }else{
            res.json({status: 'employes not found'})
        }
    }catch(err){
        res.send(err)
    }

})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//----------------------------------------------------------------------------------

// Api que busca las ventas de un empleado específico por su id. (Ingreso: ObjectId) -- Api that search the especific sales from an employe by id. (Input: ObjectId)

employes.get('/salesbyemploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Sale = conn.model('sales', saleSchema)
    try{
        const findSalesById = await Sale.find({'employe.id': req.params.id})
        if (findSalesById){
            res.json({status: 'ok', data: findSalesById, token: req.requestToken})
        }else{
            res.json({status: 'sales not found'})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api. (Retorna ventas del empleado) -- Api end (output employe's sales)

//----------------------------------------------------------------------------------

//Api que registra un nuevo empleado. (Ingreso: branch, firstName, lastName, document, days) -- Api that create a new employe. (Input: branch, firstName, lastName, document, days)

employes.post('/', async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)

    Employe.find({document:req.body.document})
    .then(findEmploye => {
        if (findEmploye.length > 0) {
            res.json({status: 'employe already exist'})
        }else{
            Employe.find()
            .then(findAll => {
                const today = new Date()
                const dataEmploye = {
                    branch: req.body.branch,
                    days: req.body.days,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    document: req.body.document,
                    commission: 0,
                    advancement: 0,
                    bonus: 0,
                    class: ''
                }
                if (findAll) {
                    var count = findAll.length
                    dataEmploye.class = 'class' + count++
                }
                Employe.create(dataEmploye)
                .then(employeCreated => {
                    res.json({status: 'employe created', data: employeCreated, token: req.requestToken})
                }).catch(err => {
                    res.send(err)
                })
            }).catch(err => {
                res.send(err)
            })
        }
    }).catch(err => {
        res.send(err)
    })
    
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

//Api que registra un avance a un empleado específico. (Ingreso: branch, detail, ObjectId del empleado, firstName,document, avance o bono, amount) -- Api that register an avancement from an especific employe (Input: branch, detail, employe´s ObjectId, firstName, document, advancement or bonus, amount)

employes.post('/registerexpenseforemploye', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    const Expense = conn.model('expenses', expenseSchema)

    const type = req.body.type ? 'Bonus' : 'Advancement'
    const advancement = {
        branch: req.body.branch,
        detail: req.body.detail,
        amount: req.body.amount,
        employe: {
            id: req.body.id,
            firstName: req.body.firstName,
            document: req.body.document,
        },
        type: type
    }

    Expense.create(advancement)
    .then(createdExpense => {
        if (req.body.type) {
            Employe.findByIdAndUpdate(req.body.id, { $inc: { bonus: req.body.amount }})
            .then(employeUpdated => {
                res.json({status:'bonus updated', data: createdExpense, token: req.requestToken})
            }).catch(err => {
                res.send(err)
            })
        }else{
            Employe.findByIdAndUpdate(req.body.id, { $inc: { advancement: req.body.amount }})
            .then(employeUpdated => {
                res.json({status:'advancement updated', data: createdExpense, token: req.requestToken})
            }).catch(err => {
                res.send(err)
            })
        }
    }).catch(err => {
        res.send(err)
    })
})

//Fin de la api. -- Api end.

//------------------------------------------------------------------------------------

//Api que elimina un empleado. (Ingreso: ObjectId del empleado) -- Api that delete an employe (Input: employe´s ObejctId)

employes.delete('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)

    try{
        const deleteEmploye = await Employe.findByIdAndRemove(req.params.id)
        if (deleteEmploye) {
            res.json({status: 'employe deleted', data:deleteEmploye, token: req.requestToken })
        }else{
            res.json({status: 'employe not found'})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api -- Api end.

//--------------------------------------------------------------------------------------------------------------

//Api que edita a un empleado. (Ingreso: ObjectId de el empleado, days, firstName, lastName, document ) -- Api that edit an employe. (Input: Employes´s ObjectId, days, firstName, lastName, document)

employes.put('/', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    const Service = conn.model('services', serviceSchema)
    const dateBlock = conn.model('datesblocks', datesBlockSchema)

    const dayValid = req.body.dayValid
    const normalDays = req.body.days
    Employe.findById(req.body.id)
    .then(found => {
        Employe.find({document:req.body.document})
        .then(employeFind => {
            const originalDays = found.days
            if (found.document != req.body.document && employeFind.length > 0) {
                res.json({status: 'document already in use'})
            }else{
                Employe.findByIdAndUpdate(req.body.id, {
                    $set: {
                        days: req.body.days,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        document: req.body.document
                    }
                })
                .then(employeEdited => {
                    Service.find({branch: req.body.branch})
                    .then(services => {
                        for (const service of services) {
                            for (const employe of service.employes) {
                                if (employe.id == req.body.id) {
                                    employe.days = req.body.days
                                }
                            }
                            Service.findByIdAndUpdate(service._id, {
                                $set: {
                                    employes: service.employes
                                }
                            }).then(ready => {})
                        }
                        if (dayValid) {
                            const employeForBlock = {
                                name: req.body.firstName + ' ' + req.body.lastName,
                                id: req.body.id,
                                class: employeEdited.class,
                                valid: false,
                                img: employeEdited.img 
                            }
                            let iO = null
                            for (let i = 0; i < normalDays.length; i++) {
                                const element = normalDays[i]
                                
                                dateBlock.find({$and:[{"dateData.dateDay": element.day}, {"dateData.branch":req.body.branch}]})
                                .then(res => {
                                    for (let t = 0; t < originalDays.length; t++) {
                                        const elementO = originalDays[t];
                                        if (element.day == elementO.day) {
                                            iO = t
                                            break
                                        }
                                    }
                                    if (res.length > 0) {
                                        for (let e = 0; e < res.length; e++) {
                                            const blocks = res[e].blocks
                                            for (let w = 0; w < blocks.length; w++) {
                                                if (blocks[w].hour == originalDays[iO].hours[0]) {
                                                    
                                                    for (let q = 0; q < 120; q++) {
                                                        if (blocks[w + q].hour == originalDays[iO].hours[1]) {
                                                            break
                                                        }
                                                        blocks[w + q].employes.push(employeForBlock)
                                                        
                                                    }
                                                }
                                            }
                                            for (let j = 0; j < blocks.length; j++) {
                                                if (blocks[j].hour == element.hours[0]) {
                                                    for (let q = 0; q < 120; q++) {
                                                        if (blocks[j + q].hour == element.hours[1]) {
                                                            break
                                                        }
                                                        for (let indexB = 0; indexB < blocks[j + q].employes.length; indexB++) {
                                                            const elementB = blocks[j + q].employes[indexB];
                                                            
                                                            if (elementB.id == req.body.id) {
                                                                blocks[j + q].employes.splice(indexB, 1)
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            dateBlock.findByIdAndUpdate(res[e]._id,{
                                                $set:{
                                                    blocks:blocks
                                                }
                                            }).then(resEdit=>{}) 
                                        }
                                    }
                                })
                            }
                        }
                        res.json({status: 'employe edited', data: employeEdited, token: req.requestToken})
                    }).catch(err => res.send(err))
                }).catch(err => {
                    res.send(err)
                })
            }
        }).catch(err => {
            res.send(err)
        })
    }).catch(err => {
        res.send(err)
    })
    
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

//Api que cierra a un empleado (Ingreso: ObjectId del empleado) -- Api that close an employe (Input: employe´s ObjectId)


employes.put('/registerBonus/:id', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)

    Employe.findByIdAndUpdate(req.params.id, {
        $inc: {
            bonus: req.body.amount
        }
    })
    .then(editEmploye => {
        if (editEmploye) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }).catch(err => {
        res.send(err)
    })
    
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

//Api que cierra a un empleado (Ingreso: ObjectId del empleado) -- Api that close an employe (Input: employe´s ObjectId)


employes.put('/regAdvancement/:id', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)

    Employe.findByIdAndUpdate(req.params.id, {
        $inc: {
            advancement: req.body.amount
        }
    })
    .then(editEmploye => {
        if (editEmploye) {
            res.json({status: 'ok', token: req.requestToken})
        }
    }).catch(err => {
        res.send(err)
    })
    
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

//Api que cierra a un empleado (Ingreso: ObjectId del empleado) -- Api that close an employe (Input: employe´s ObjectId)

employes.put('/closeemploye', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)

    Employe.findByIdAndUpdate(req.body.id, {
        $set: {
            commission:0,
            advancement:0,
            bonus:0
        }
    })
    .then(employeClosed => {
        res.json({status: 'employe closed', data: employeClosed, token: req.requestToken})
    }).catch(err => {
        res.send(err)
    })
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------

module.exports = employes