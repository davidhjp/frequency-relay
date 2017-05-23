const express = require('express'),
	app = express()
const upload = require('multer')()
const fs = require('fs')
const rs = require('randomstring')
const os = require('os')
const spawn = require('child_process').spawn
const path = require('path')

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
	var waveFile = (os.tmpdir() + "/" + input + '.txt').replace(/\\/g, '/')
	var xmlFile = (os.tmpdir() + "/" + input + '.xml').replace(/\\/g, '/')
	console.log(waveFile)
	var xmlContent = xmlString.replace("$WAVE", waveFile)
	var p1 = new Promise(function (resolve,reject) {
		fs.writeFile(waveFile, req.file.buffer.toString(), function(err){
			if(err)
				reject(console.log(err))
			else
				resolve(console.log('written to ' + waveFile))
		})
	})
	var p2 = function() {
		return new Promise((resolve, reject) => {
		fs.writeFile(xmlFile, xmlContent, function(err){
			if(err)
				reject(console.log(err))
			else
				resolve(console.log('written to ' + xmlFile))
		})
	})}
	p1.then(p2).then(function() { 
		return new Promise((resolve,reject) => {
			console.log('starting thread')
			const ls = spawn('bash', ['-c', `CLASSPATH=../bin ../systemj/bin/sysjr ${xmlFile}`])
			var sample_count = []
			ls.stdout.on('data', (data) => {
				var o = JSON.parse(data.toString())
				if(o.sample_count != null)
					sample_count.push(o.sample_count)	
			})
			ls.stderr.on('data', (data) => {console.log(data.toString())})
			ls.on('error', (data) => {reject('error on creating a thread')})
			ls.on('exit', (status) => {resolve(sample_count)})
		}
	)}).then((sample_count) => {
		res.status(200).json({"sample_count": sample_count })
	}).catch((d) => {
		res.status(400).send(d)
	})
})


app.listen(SERVER_PORT)
console.log('Server is runing at port ' + SERVER_PORT)
