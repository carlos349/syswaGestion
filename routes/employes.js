const express = require('express')
const employes = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const employeSchema = require('../models/Employes')
const expenseSchema = require('../models/Expenses')
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

// Api que busca las ventas de un empleado específico por su id. (Ingreso: ObjectId) -- Api that search the especific sales from an employe by id. (Input: ObjectId)

employes.get('/salesbyemploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Sale = conn.model('sales', saleSchema)
    try{
        const findSalesById = await Sale.find({'employe.id':req.params.id})
        if (findSalesById){
            res.json({status:'ok', data: findSalesById, token: req.requestToken})
        }else{
            res.json({status: 'sales not found'})
        }
    }catch(err){
        res.send(err)
    }
})

//Fin de la api. (Retorna ventas del empleado) -- Api end (output employe's sales)

//----------------------------------------------------------------------------------

//Api que busca el avance (numérico) de un empleado específico por su id. (Ingreso: ObjectId) -- Api that search the advancement (numeric) from an especific employe by id. ( Input: ObjectId)

employes.get('/advancementsbyemploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    try{
        const findAdvancementById = await Employe.findById(req.params.id)
        if(findAdvancementById){
            res.json({status: 'ok', data: findAdvancementById.advancement, token:requestToken})
        }else{
            res.json({status:'advancement not found'})
        } 
    }catch(err){
        res.send(err)
    }
    
})

//Fin de la api. (Retorna avance del empleado) -- Api end (output employe's advancement)

//----------------------------------------------------------------------------------

//Api que busca el bono (numérico) de un empleado específico por su id. (Ingreso: ObjectId) -- Api that search the bonus (numeric) from an especific employe by id. ( Input: ObjectId)

employes.get('/bonusbyemploye/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)
    try{
        const findBonusById = await Employe.findById(req.params.id)
        if(findBonusById){
            res.json({status: 'ok', data: findBonusById.bonus, token:requestToken})
        }else{
            res.json({status:'bonus not found'})
        } 
    }catch(err){
        res.send(err)
    }
    
})

//Fin de la api. (Retorna bono del empleado) -- Api end (output employe's bonus)

//------------------------------------------------------------------------------------

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
        if (findEmploye) {
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
                    dataEmploye.class = 'class' + findAll.length + 1
                }else{
                    dataEmploye.class = 'class1'
                }
                Employe.create(dataEmploye)
                .then(employeCreated => {
                    res.json({status: 'ok', data: employeCreated, token: requestToken})
                }).catch(err => {
                    req.send(err)
                })
            }).catch(err => {
                req.send(err)
            })
        }
    }).catch(err => {
        req.send(err)
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
        detai: req.body.detail,
        amount: req.body.amount,
        employe: {
            id: req.body.id,
            firstName: req.body.firstName,
            document: req.body.document,
            type: type
        },
    }

    Expense.create(advancement)
    .then(createdExpense => {
        if (req.body.type) {
            Employe.findByIdAndUpdate(req.body.id, { $inc: { bonus: req.body.amount }})
            .then(employeUpdated => {
                res.json({status:'bonus updated', data: createdExpense, token: requestToken})
            }).catch(err => {
                res.send(err)
            })
        }else{
            Employe.findByIdAndUpdate(req.body.id, { $inc: { advancement: req.body.amount }})
            .then(employeUpdated => {
                res.json({status:'advancement updated', data: createdExpense, token: requestToken})
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
        const deleteEmploye = await Employe.findOneAndRemove(req.params.id)
        if (deleteEmploye) {
            res.json({status: 'employe deleted', data:deleteEmploye, token: requestToken })
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

    Employe.find({document:req.body.document})
    .then(employeFind => {
        if (employeFind) {
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
                res.json({status: 'employe edited', data: employeEdited, token: requestToken})
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

//Api que cierra a un empleado (Ingreso: ObjectId del empleado) -- Api that close an employe (Input: employe´s ObjectId)

employes.put('/closeemploye', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Employe = conn.model('employes', employeSchema)

    Employe.findByIdAndUpdate(req.params.id, {
        $set: {
            comision:0,
            advancement:0,
            bonus:0
        }
    })
    .then(employeClosed => {
        res.json({status: 'employe closed', data: employeClosed, token: requestToken})
    }).catch(err => {
        res.send(err)
    })
})

//Fin de la api. (Retorna datos del empleado) -- Api end (output employe's data)

//------------------------------------------------------------------------------------