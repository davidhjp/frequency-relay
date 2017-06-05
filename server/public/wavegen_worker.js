importScripts('/mathjs/dist/math.min.js')

self.onmessage = function(e) {
	var waves = e.data['waves']
	var ts = e.data['ts']
	var wave_sample = []
	for(var i=0; i<waves.length;i++){
		var wave = waves[i]
		for(var j=0; j<wave.duration; j+=ts){
			try{
				var r = math.eval(wave.equation, {pi: Math.PI, t: j})
				wave_sample.push(r)
			} catch(e) {
				self.postMessage({error: true, err: `Unable to process equation - ${wave.equation}`})
				return
			}
		}
	}
	self.postMessage({error: false, data: wave_sample})
}
