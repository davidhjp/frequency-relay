var express = require('express'),
	app = express()

const SERVER_PORT = 8080

app.use(express.static('public'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery'));


app.listen(SERVER_PORT)
console.log('Server is runing at port ' + SERVER_PORT)
