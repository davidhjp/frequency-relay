var unit = 1/16000
for(var i=0; i<1; i+=unit){
	console.log(eval(`100 * Math.sin(2 * Math.PI * 100 * ${i}) + 100`))
}
