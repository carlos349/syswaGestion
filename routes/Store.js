const express = require('express')
const stores = express.Router()
const mongoose = require('mongoose')
const protectRoute = require('../securityToken/verifyToken')
const inventorySchema = require('../models/Inventory')
const storeSchema = require('../models/Store')
const providerSchema = require('../models/Providers')
const historyInventorySchema = require('../models/HistoryInventories')
const historyClosedInventorySchema = require('../models/HistoryClosedInventories')
const cors = require('cors')

stores.use(cors())

//Api que busca todos los datos de los productos de la bodega (Ingreso: Nullo) -- Api that search all the products´ data of the store (Input: Null)

stores.get('/getstore', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Store = conn.model('stores', storeSchema)

    try{
        const getStore = await Store.find()
        if (getStore.length > 0 ) {
            res.json({status: 'ok', data: getStore, token: req.requestToken})
        }else{
            res.json({status: 'nothing found'})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos de productos) -- Api end. (Return: Products´ data)

//--------------------------------------------------------------------------------------

//Api que busca los productos por sucursal (Input: branch) -- Api that search products by branch (Input: branch)

stores.get('/getinventorybybranch/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Inventory = conn.model('inventories', inventorySchema)

    try{
        const getInventoryByBranch = await Inventory.find({branch: req.params.branch})
        if (getInventoryByBranch.length > 0) {
            res.json({status: 'ok', data: getInventoryByBranch, token: req.requestToken})
        }else{
            res.json({status: 'inventories not found'})
        }
    }catch(err){
        res.json(err)
    }
})

//Final de la api. (Retorna: Datos del inventario de la sucursal) -- Api end. (Return: inventory´s data of the branch)

//--------------------------------------------------------------------------------------

//Api que busca los provedores (Ingreso: Null) -- Api that search providers (Input: Null)

stores.get('/getproviders', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Provider = conn.model('providers', providerSchema)

    try{
        const getProviders = await Provider.find()
        if (getProviders.length > 0) {
            res.json({status: 'ok', data: getProviders, token: req.requestToken})
        }else{
            res.json({status: 'providers not found'})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos de los provedores) -- Api end. (Return: Providers´ data)

//--------------------------------------------------------------------------------------

//Api que busca el historial de la bodega. (Ingreso: Null) -- Api that search store´s history. (Input: Null)

stores.get('getstorehistory', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const History = conn.model('historyInventories', historyInventorySchema)

    try{
        const getHistory = await History.find()
        if (getHistory.length > 0) {
            res.json({status: 'ok', data: getHistory, token: req.requestToken})
        }else{
            res.json({status: 'history not found'})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del historial de la bodega) -- Api end. (Return: Store history´s data)

//--------------------------------------------------------------------------------------

//Api que busca el historial por sucursal (Input: branch) -- Api that search history by branch (Input: branch)

stores.get('/gethistorybybranch/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const History = conn.model('historyInventories', historyInventorySchema)

    try{
        const historyByBranch = await History.find({branch: req.params.branch})
        if (historyByBranch.length > 0) {
            res.json({status: 'ok', data: historyByBranch, token: req.requestToken})
        }else{
            res.json({status: 'history not found'})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del historial de la sucursal) -- Api end. (Return: branch history´s data)

//--------------------------------------------------------------------------------------

//Api que edita un producto de la bodega (Input: ObjectId del producto ,product, measure, price) -- Api that edit a product in the store (Input: product´s ObjectId, product, measure, price)

stores.put('/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Store = conn.model('stores', storeSchema)

    Store.findById(req.params.id)
    .then(found => {
        Store.find({product:req.body.product})
        .then(storeFind => {
            if (found.product != req.body.product && storeFind.length > 0) {
                res.json({status: 'product already in use'})
            }else{
                Store.findByIdAndUpdate(req.params.id, {
                    $set: {
                        product: req.body.product,
                        measure: req.body.measure,
                        price: req.body.price,
                        alertTotal: req.body.alertTotal
                    }
                })
                .then(storeEdited => {
                    res.json({status: 'store edited', data: storeEdited, token: req.requestToken})
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

//Final de la api. (Retorna: Datos del producto) -- Api end. (Return: product´s data)

//--------------------------------------------------------------------------------------

//Api que edita un provedor (Ingreso: ObjectId del provedor ,name, document, contact, contactPlus, location) -- Api that edit a product in the store (Input: Provider´s ObjectId ,name, document, contact, contactPlus, location)

stores.put('/updateprovider/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Provider = conn.model('providers', providerSchema)

    Provider.findById(req.params.id)
    .then(found => {
        Provider.find({document:req.body.document})
        .then(providerFind => {
            if (found.document != req.body.document && providerFind.length > 0) {
                res.json({status: 'provider already exist'})
            }else{
                Provider.findByIdAndUpdate(req.params.id, {
                    $set: {
                        name: req.body.name,
                        document: req.body.document,
                        contact: req.body.contact,
                        contactPlus: req.body.contactPlus,
                        location: req.body.location
                    }
                })
                .then(providerEdited => {
                    res.json({status: 'provider edited', data: providerEdited, token: req.requestToken})
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

//Final de la api. (Retorna: Datos del provedor) -- Api end. (Return: Provider´s data)

//--------------------------------------------------------------------------------------

//Api que agrega cantidades a un producto (Ingreso: ObjectId del producto, user´s ObjectId, nameUser, documentUser, product, entry, date, price, provider) -- Api that add quantity to a product (Input: Product´s ObjectId, user´s ObjectId, nameUser, documentUser, product, measure, entry, date, price, provider)

stores.put('/add/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Store = conn.model('stores', storeSchema)
    const History = conn.model('historyInventories', historyInventorySchema)

    const historical = {
        id: req.params.id,
        user: {
            id: req.body.idUser,
            name: req.body.nameUser,
            document: req.body.documentUser
        },
        product: req.body.product,
        entry: req.body.entry,
        measure: req.body.measure,
        price: req.body.price,
        provider: req.body.provider,
        date: req.body.date
    }

    try{
        const add = await Store.findByIdAndUpdate(req.params.id, {
            $inc: {entry: req.body.entry},
            $push: {purchaseHistory: historical} 
        })
        if (add) {
            const addHistory = await History.create(hitorical)
            if (addHistory) {
                res.json({status: 'added', data: add, token: req.requestToken })
            }
        } 
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del producto) -- Api end. (Return: Product´s data)

//--------------------------------------------------------------------------------------

//Api que registra un producto en una sucursal (Ingreso: ObjectId de la sucursal, product, measure, price) -- Api that register a product to a branch (Input: branch´s ObjectId, product, measure, price)

stores.put('/registertobranch/:id', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Inventory = conn.model('inventories', inventorySchema)

    try{
        const inspector = await Inventory.find({$and:[{branch:req.params.id}, {product: req.body.product}]})
        if (inspector.length > 0) {
            res.json({status: 'product already exist'})
        }else{
            const dataProduct = {
                addingHistory:[],
                branch: req.body.branch,
                product: req.body.product,
                measure: req.body.measure,
                price: req.body.price,
                quantity: 0,
                entry: 0,
                consume: 0,
                alertTotal: 0
            }

            const register = await Inventory.create(dataProduct)
            if (register) {
                res.json({status: 'product registered', data: register, token: req.requestToken})
            }
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del producto) -- Api end. (Return: Product´s data)

//--------------------------------------------------------------------------------------

//Api que registra cantidades a un producto de una sucursal (Ingreso: ObjectId de la sucursal, product´s ObjectId, user´s ObjectId, nameUser, documentUser, product, entry) -- Api that register quantity to a product by branh (Input: branch´s ObjectId, product´s ObjectId, user´s ObjectId, nameUser, documentUser, product, entry, measure)

stores.put('/addtobranch/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Inventory = conn.model('inventories', inventorySchema)
    const History = conn.model('historyInventories', historyInventorySchema)
    const Store = conn.model('stores', storeSchema)

    const historical = {
        id: req.body.productId,
        branch: req.params.id,
        user: {
            id: req.body.idUser,
            name: req.body.nameUser,
            document: req.body.documentUser
        },
        product: req.body.product,
        entry: req.body.entry,
        measure: req.body.measure,
        date: new Date()
    }

    try{
        const add = await Inventory.findOneAndUpdate({$and:[{branch:req.params.id}, {product: req.body.product}]}, {
            $inc: {entry: req.body.entry},
            $push: {addingHistory: historical} 
        })
        if (add) {
            const storeBalance = await Store.findByIdAndUpdate(req.body.productId, {
                $inc:{consume: req.body.entry}
            })
            if (storeBalance) {
                const addHistory = await History.create(hitorical)
                if (addHistory) {
                    res.json({status: 'added', data: add, token: req.requestToken })
                }
            } 
        } 
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del producto) -- Api end. (Return: Product´s data)

//--------------------------------------------------------------------------------------

//Api que realiza un reporte de cierre de la bodega (Ingreso: user´s ObjectId, nameUser, documentUser, products[{ObjectId del producto, count, difference (default : ''), ideal, measure}]) -- Api that make a closed report of the store (Input: user´s ObjectId, nameUser, documentUser, products[{ Product´s ObjectId, count, difference (default : ''), ideal, measure}])

stores.put('/closestore', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const HistoryClosed = conn.model('historyClosedInventories', historyClosedInventorySchema)
    const Store = conn.model('stores', storeSchema)

    const products = req.body.products

    for (let i = 0; i < products.length; i++) {
        Store.findByIdAndUpdate(products[i].id, {
            $set: {
                quantity:products[i].count,
                entry:0,
                consume:0
            }
        })
        .then(ready => {})
        var difference = parseFloat(products[i].count) - parseFloat(products[i].ideal)
        if (difference == 0) {
            products[i].difference = "Sin diferencia"
        }
        if (difference > 0) {
            products[i].difference = "+" + difference + " " + products[i].measure
        }
        if (diferencia < 0) {
            products[i].difference = difference + " " + products[i].measure
        }
    }

    const historical = {
        user: {
            id: req.body.idUser,
            name: req.body.nameUser,
            document: req.body.documentUser
        },
        totalProduct:products.length,
        products:products,
        createdAt: new Date()
    }

    try{
        const history = await HistoryClosed.create(historical)
        if (history) {
            res.json({status: 'closed', data: history, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del historial) -- Api end. (Return: Historical´s data)

//--------------------------------------------------------------------------------------

//Api que realiza un reporte de cierre del inventario de una sucursal (Ingreso: user´s ObjectId, nameUser, documentUser, products[{ObjectId del producto, count, difference (default : ''), ideal, measure}]) -- Api that make a closed report of the branch´s inventory (Input: user´s ObjectId, nameUser, documentUser, products[{ Product´s ObjectId, count, difference (default : ''), ideal, measure}])

stores.put('/closeinventorybybranch/:branch', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const HistoryClosed = conn.model('historyClosedInventories', historyClosedInventorySchema)
    const Inventory = conn.model('inventories', inventorySchema)

    const products = req.body.products

    for (let i = 0; i < products.length; i++) {
        Inventory.findByIdAndUpdate(products[i].id, {
            $set: {
                quantity:products[i].count,
                entry:0,
                consume:0
            }
        })
        .then(ready => {})
        var difference = parseFloat(products[i].count) - parseFloat(products[i].ideal)
        if (difference == 0) {
            products[i].difference = "Sin diferencia"
        }
        if (difference > 0) {
            products[i].difference = "+" + difference + " " + products[i].measure
        }
        if (diferencia < 0) {
            products[i].difference = difference + " " + products[i].measure
        }
    }

    const historical = {
        user: {
            id: req.body.idUser,
            name: req.body.nameUser,
            document: req.body.documentUser
        },
        branch: req.params.branch,
        totalProduct:products.length,
        products:products,
        createdAt: new Date()
    }

    try{
        const history = await HistoryClosed.create(historical)
        if (history) {
            res.json({status: 'closed', data: history, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del historial) -- Api end. (Return: Historical´s data)

//--------------------------------------------------------------------------------------

//Api que edita la alarma de stock de un producto de la bodega (Ingreso: ObjectId del producto, stock) -- Api that edit stock alarm from the store (Input: Product´s ObjectId, stock)
stores.put('/editstockalarmfromstore/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Store = conn.model('stores', storeSchema)

    Store.findByIdAndUpdate(req.params.id, {
        $set: {alertTotal: req.body.stock}
    })
    .then(done => {
        if (done) {
            res.json({status: 'ok'})     
        }
    }).catch(err => {
        res.send(err)
    })
})

//Final de la api. (Retorna: Respuesta simple) -- Api end. (Return: Simple response)

//--------------------------------------------------------------------------------------

//Api que edita la alarma de stock de un producto del inventario por sucursal (Ingreso: ObjectId del producto, stock) -- Api that edit stock alarm from the inventory by branch (Input: Product´s ObjectId, stock)
stores.put('/editstockalarmfrominventory/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Inventory = conn.model('inventories', inventorySchema)

    Inventory.findByIdAndUpdate(req.params.id, {
        $set: {alertTotal: req.body.stock}
    })
    .then(done => {
        if (done) {
            res.json({status: 'ok'})     
        }
    }).catch(err => {
        res.send(err)
    })
})

//Final de la api. (Retorna: Respuesta simple) -- Api end. (Return: Simple response)

//--------------------------------------------------------------------------------------

//Api que registra un producto en la bodega (Ingreso: product, measure, price) -- Api that register a product to the store (Input: product, measure, price)

stores.post('/', protectRoute, async (req,res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Store = conn.model('stores', storeSchema)

    try{
        const inspector = await Store.find({product: req.body.product})
        if (found.length > 0) {
            res.json({status: 'product already exist'})
        }else{
            const dataProduct = {
                purchaseHistory:[],
                product: req.body.product,
                measure: req.body.measure,
                price: req.body.price,
                quantity: 0,
                entry: 0,
                consume: 0,
                alertTotal: 0
            }

            const register = await Store.create(dataProduct)
            if (register) {
                res.json({status: 'product registered', data: register, token: req.requestToken})
            }
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del producto) -- Api end. (Return: Product´s data)

//--------------------------------------------------------------------------------------

//Api que registra un provedor (Ingreso: name, document, contact, contactPlus, locations) -- Api that register a provider (Input: name, document, contact, contactPlus, locations)

stores.post('/addprovider', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Provider = conn.model('providers', providerSchema)

    try{
        const inspector = await Provider.find({$or:[{name:req.body.name}, {document: req.body.document}]})
        if (inspector.length > 0) {
            res.json({status: 'name or document already exist'})
        }else{
            const dataProvider = {
                name: req.body.name,
                document: req.body.document,
                contact: req.body.contact,
                contactPlus: req.body.contactPlus,
                location: req.body.location
            }

            const register = await Provider.create(dataProvider)
            if (register) {
                res.json({status: 'provider registered', data: register, token: req.requestToken})
            }
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Datos del provedor) -- Api end. (Return: Provider´s data)

//--------------------------------------------------------------------------------------

//Api que elimina un producto de la bodega (Input: ObjectId del producto) -- Api that delete a product from the store (Input: Product´s ObjectId)

stores.delete('/deletestoreproduct/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Store = conn.model('stores', storeSchema)

    try{
        const deleteProduct = await Store.delete(req.params.id)
        if (deleteProduct) {
            res.json({status: 'product deleted', data: deleteProduct, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Respuesta simple) -- Api end. (Return: Simple response)

//--------------------------------------------------------------------------------------

//Api que elimina un producto del inventario (Input: ObjectId del producto) -- Api that delete a product from the inventory (Input: Product´s ObjectId)

stores.delete('/deleteinventoryproduct/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Inventory = conn.model('inventories', inventorySchema)

    try{
        const deleteProduct = await Inventory.delete(req.params.id)
        if (deleteProduct) {
            res.json({status: 'product deleted', data: deleteProduct, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Respuesta simple) -- Api end. (Return: Simple response)

//--------------------------------------------------------------------------------------

//Api que elimina un provedor (Input: ObjectId del provedor) -- Api that delete a provider (Input: Provider´s ObjectId)

stores.delete('/deleteprovider/:id', protectRoute, async (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Provider = conn.model('providers', providerSchema)

    try{
        const deleteProduct = await Inventory.delete(req.params.id)
        if (deleteProduct) {
            res.json({status: 'provider deleted', data: deleteProduct, token: req.requestToken})
        }
    }catch(err){
        res.send(err)
    }
})

//Final de la api. (Retorna: Respuesta simple) -- Api end. (Return: Simple response)

//--------------------------------------------------------------------------------------

//Api que realiza un consumo por venta en el inventario (Ingreso: products[{ObjectId del producto, count}]) -- Api that make a cosume for sale in the inventory (Input: products[{product´s ObjectId, count}])

stores.post('/processsale', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Inventory = conn.model('inventories', inventorySchema)

    const products = req.body.products

    for (let i = 0; i < products.length; i++) {
        Inventory.findByIdAndUpdate(products[i].id, {
            $inc: {consume:products[i].count }
        })
        .then(ready => {})
    }
})

//Final de la api. (Retorna: Nullo) -- Api end. (Return: Null)

//--------------------------------------------------------------------------------------

//Api que crea una alerta de stock (Ingreso: Nullo) -- Api that make an alert of stock (Input: Null)

stores.get('/alertstoreproducts', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Store = conn.model('stores', storeSchema)

    var productsToAlert = []
    Store.find()
    .then(products => {
        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            const total = (parseFloat(product.entry) + parseFloat(product.quantity)) - parseFloat(product.consume)
            if (total <= product.alertTotal) {
                productsToAlert.push({total: total, measure: product.measure, nameProduct: product.producto})
            }            
        }
        if (productsToAlert.length > 0) {
            res.json({status: true, productsToAlert: productsToAlert})
        }else{
            res.json({status: false})
        }
    }).catch(err => {
        res.send(err)
    })
})

//Fin de la api (Retorna: Array con productos por alertar) -- Api end (Return: Array with product for alert)

//--------------------------------------------------------------------------------------

//Api que reinserta consumo cuando se anula una venta (Ingreso: products[{ObjectId del producto, consume]}) -- Api that reinsert consume when a sale is nulled (Input: products[{product´s ObjectId, consume}])

stores.post('/nullsale', protectRoute, (req, res) => {
    const database = req.headers['x-database-connect'];
    const conn = mongoose.createConnection('mongodb://localhost/'+database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    const Inventory = conn.model('inventories', inventorySchema)

    var products = req.body.products
    for (let i = 0; i < products.length; i++) {
        Inventory.findByIdAndUpdate(products[i].id, {
            $inc: {consume:-products[i].count}
        })
        .then(ready => {})  
    } 
})

//Final de la api. (Retorna: Nullo) -- Api end. (Return: Null)

//--------------------------------------------------------------------------------------

module.exports = stores