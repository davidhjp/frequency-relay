const express = require('express'),
	app = express()
const upload = require('multer')()
const fs = require('fs')
const rs = require('randomstring')
const os = require('os')
const spawn = require('child_process').spawn
const path = require('path')
const readline = require('readline')
const math = require('mathjs')

const SERVER_PORT = 8080
var xmlString
fs.readFile(__dirname + '/../lcf/relay2.xml', (err, data) =>{
	xmlString = data.toString()
})

app.use(express.static('public'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery'));
app.use('/chart.js', express.static(__dirname + '/node_modules/chart.js'));
app.use('/mathjs', express.static(__dirname + '/node_modules/mathjs'));

function genWave(freq, waves, filename) {
	var s = fs.createWriteStream(filename, {flags: 'a'})
	var ts = 1 / freq
	for(var i=0;i<waves.length;i++){
		var wave = waves[i]
		for(var j=0; j<wave.duration; j+=ts){
			try{
				var r = math.eval(wave.equation, {pi: Math.PI, t: j})
			} catch(e) {
					throw new SyntaxError(wave.equation)
			}
			s.write(`${r}\n`)
		}
	}
}

app.post('/submit',  upload.single(), function(req,res){
	var size_avblock = req.body['param-avblock']
	var size_symblock = req.body['param-symblock']
	var freq = parseInt(req.body.freq)
	var unit = req.body.unit
	if(unit == "Khz")
		freq = freq * 1000
	var input = rs.generate(7)
	var waveFile = (os.tmpdir() + "/" + input + '.txt').replace(/\\/g, '/')
	var xmlFile = (os.tmpdir() + "/" + input + '.xml').replace(/\\/g, '/')
	var xmlContent = xmlString.replace("$WAVE", waveFile)

	try{
		genWave(freq, JSON.parse(req.body.waves), waveFile)
	} catch (e) {
		res.status(500).send('Unable to process the given formula: ' + e.message)
		return;
	}
	console.log('written to ' + waveFile)

	var p2 = new Promise((resolve, reject) => {
		fs.writeFile(xmlFile, xmlContent, function(err){
			if(err)
				reject(console.log(err))
			else
				resolve(console.log('written to ' + xmlFile))
		})
	})
	p2.then(function() { 
		return new Promise((resolve,reject) => {
			console.log('starting thread')
			const ls = spawn('bash', ['-c', `JAVA_OPTS="-Dsymsize=${size_symblock} -Davesize=${size_avblock}" CLASSPATH=../bin ../systemj/bin/sysjr ${xmlFile}`])
			var sample_count = []
			var sym_val = []
			var rl = readline.createInterface({
				input: ls.stdout
			})
			rl.on('line', (data) => {
				var o = JSON.parse(data.toString())
				if(o.sample_count != null)
					sample_count.push(freq / (o.sample_count * 2))	
				if(o.sym_val != null)
					sym_val.push(o.sym_val)
			})
			ls.stderr.on('data', (data) => {console.log(data.toString())})
			ls.on('error', (data) => {reject('error on creating a thread')})
			ls.on('exit', (status) => {
				console.log('SystemJ - done')
				resolve({'sample_count': sample_count, 'sym_val': sym_val})}
			)
		}
	)})
	.then((data) => {
		return new Promise((resolve,reject) => {
			console.log('Starting reading the wave file')
			fs.readFile(waveFile, (err, d) => {
				if(err)	
					reject('could not read the input wavefile for visualization')
				data['wave'] = d.toString()
				console.log('Finished reading the wave file')
				resolve(data)
			})
		})
	})
	.then((data) => {
		res.status(200).json(data)
	}).catch((d) => {
		console.log(d)
		res.status(400).send(d)
	})
})


app.listen(SERVER_PORT)
console.log('Server is runing at port ' + SERVER_PORT)
