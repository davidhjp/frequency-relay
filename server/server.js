var express = require('express'),
	app = express()
var upload = require('multer')()

const SERVER_PORT = 8080

app.use(express.static('public'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery'));
app.use('/chart.js', express.static(__dirname + '/node_modules/chart.js'));
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded())

app.post('/submit', upload.single('wave'), function(req,res){
	console.log(req.file)
	console.log(req.body)
	res.status(200).send()
})


app.listen(SERVER_PORT)
console.log('Server is runing at port ' + SERVER_PORT)
