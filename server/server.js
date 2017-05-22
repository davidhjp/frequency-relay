var express = require('express'),
	app = express()
var upload = require('multer')()
var fs = require('fs')
var rs = require('randomstring')
var os = require('os')

const SERVER_PORT = 8080
var xmlString
fs.readFile(__dirname + '/../lcf/relay2.xml', (err, data) =>{
	xmlString = data.toString()
})

app.use(express.static('public'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery'));
app.use('/chart.js', express.static(__dirname + '/node_modules/chart.js'));

app.post('/submit', upload.single('wave'), function(req,res){
	var input = rs.generate(7)
	var waveFile = os.tmpdir() + "/" + input + '.txt'
	var xmlFile = os.tmpdir() + "/" + input + '.xml'
	var xmlContent = xmlString.replace("$WAVE", xmlFile)
	// TODO: Need to use Promises
	fs.writeFile(waveFile, req.file.buffer.toString(), function(err){
		if(err){
			console.log(err)
		}
		else
			console.log('written to ' + waveFile)
	})
	fs.writeFile(xmlFile, xmlContent, function(err){
		if(err){
			console.log(err)
		}
		else
			console.log('written to ' + xmlFile)
	})
	console.log(req.body)
	res.status(200).send()
})


app.listen(SERVER_PORT)
console.log('Server is runing at port ' + SERVER_PORT)
