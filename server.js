const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = require('./private/port.js')
// const database = require('./private/database.js')
// const verify = require('./accessFunctions/verify.js')

//Websockets
io.on('connection', socket  => {
  socket.on('sendNotification', data => {
	  io.emit('notify', data);
  })
});

// settings
app.set('port', process.env.PORT || port)
app.set('trust proxy', true);

//middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
// verify()
//Routes

app.use('/users', require('./routes/Users.js'))
// app.use('/ventas', require('./routes/Venta.js'))
// app.use('/manicuristas', require('./routes/Manicuristas.js'))
app.use('/services', require('./routes/Services.js'))
// app.use('/metrics', require('./routes/Metrics.js'))
// app.use('/citas', require('./routes/Citas.js'))
// app.use('/expenses', require('./routes/Expenses.js'))
// app.use('/inventario', require('./routes/Inventario.js'))
// app.use('/clients', require('./routes/Clients.js'))
// app.use('/pedidos', require('./routes/Pedidos.js'))
// app.use('/notifications', require('./routes/Notifications.js'))


//Static files

app.use('/static', express.static(__dirname + '/public'));

// server in listened
// var httpServer = http.createServer(app);
// var httpsServer = https.createServer(options, app);

server.listen(app.get('port'), () => {
	console.log('Server on port: ', app.get('port'))
});

