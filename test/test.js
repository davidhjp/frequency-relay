var freq = 16000

for(var i=0; i<freq/50*10; i++){
	console.log(eval(`50 * Math.sin((2 * Math.PI * 50 * ${i})/${freq}) + 50`))
}
for(var i=0; i<freq/48*10; i++){
	console.log(eval(`50 * Math.sin((2 * Math.PI * 48 * ${i})/${freq}) + 50`))
}
for(var i=0; i<freq/50*10; i++){
	console.log(eval(`50 * Math.sin((2 * Math.PI * 50 * ${i})/${freq}) + 50`))
}
for(var i=0; i<freq/53*10; i++){
	console.log(eval(`50 * Math.sin((2 * Math.PI * 52 * ${i})/${freq}) + 50`))
}
