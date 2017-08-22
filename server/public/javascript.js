var symchart, freqchart, wavechart
Chart.defaults.global.legend.display = false;

function createDatasets(data) {
		var data = {
				labels: data['labels'],
				datasets: [
					{
						label: data['datalabel'],
						fill: false,
						lineTension: 0.1,
						backgroundColor: "rgba(75,192,192,0.4)",
						borderColor: "rgba(75,192,192,1)",
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						pointBorderColor: "rgba(75,192,192,1)",
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: "rgba(75,192,192,1)",
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 1,
						pointHitRadius: 10,
						data: data['datasets'],
						spanGaps: false,
						steppedLine: data['stepped']
					}
		    ]
		}
	return data;
}

$(function(){

$('.dropdown-click').click(function () {
	$(this).parents('.input-group-btn').find('.dropdown-display').text($(this).text() + ' ')
})


$('#add-wave').click(function (){
	var data = new FormData($('form[id=main-submit]')[0])
	var eq = data.get('equation'), duration = parseFloat(data.get('duration'))
	if(!eq.trim() || isNaN(duration)) {
		alert('Missing equation/time duration or entered incorrect format(s)', ALERT_CODE.WARN)
		return null
	}
	var unit = $('.id-duration-unit').text().trim()
	if(unit == 'ms')
		duration = duration / 1000
	$('<li></li>', {class: 'list-group-item wave-component',  duration: duration, equation: eq})
				.prepend(`<b>Wave</b>: ${eq}&nbsp&nbsp<b>Duration</b>: ${duration} s
									<a href="#" class="remove-wave">
									<span style="float: right" class="glyphicon glyphicon-remove" aria-hidden="true"></span>
									</a>`).appendTo('#wave-list')
})

$(document).on('click', '.remove-wave', function() {
	$(this).parents('li').eq(0).remove()
})

var ALERT_CODE = {
	WARN: 0,
	ERROR: 1
}

function alert(msg, code){
	$('.alert').alert('close')
	if(code == ALERT_CODE.WARN)
		$('#alert').prepend(`<div class='alert alert-warning alert-dismissible' role='alert'> \
			<button type='button' class='close' data-dismiss='alert' aria-label='Close'>\
			<span aria-hidden='true'>&times;</span></button>\
			<strong>Warning!</strong> ${msg}</div>`)
	else if(code == ALERT_CODE.ERROR)
		$('#alert').prepend(`<div class='alert alert-danger alert-dismissible' role='alert'> \
			<button type='button' class='close' data-dismiss='alert' aria-label='Close'>\
			<span aria-hidden='true'>&times;</span></button>\
			<strong>Error!</strong> ${msg}</div>`)
	$('#my-modal').modal('hide')
}

function genWave(ts, waves) {
	return new Promise((resolve,reject) => {
		var wave_sample = []
		var count = 0, lastj = 0, lasti = 0
		const SEG_SIZE = 50
		function iteration() {
			for(var i=lasti; i<waves.length;i++){
				var wave = waves[i]
				for(var j=lastj; j<wave.duration; j+=ts){
					try{
						var r = math.eval(wave.equation, {pi: Math.PI, t: j})
						wave_sample.push(r)
						count = count + 1
						if (count > SEG_SIZE){
							lasti = i
							lastj = j
							count = 0
							setTimeout(iteration, 5)
							return;
						}
					} catch(e) {
						reject(e)
//             throw new SyntaxError(`Unable to process equation - ${wave.equation}`)
					}
				}
			}
			resolve(wave_sample)
		}
		iteration()
	})
}

$('form[id=main-submit]').on('submit', function(e) {
	$('.modal-title').text('Sampling the wave...')
	$('.progress-bar').attr('aria-valuenow', 50).css('width', '50%')
	e.preventDefault()
	var data = new FormData(this)
	var freq = data.get('freq').trim()
	if(freq == '') {
		alert('Missing sampling frequency value!!', ALERT_CODE.WARN)
		return;
	}
	freq = parseFloat(freq)
	if($('.id-freq-unit').text().trim() == 'Khz')
		freq = freq * 1000
	var ts = 1 / freq

	data.append('unit', $('.id-freq-unit').text().trim())
	var wc = []
	$('.wave-component').each(function (i, o){
		wc.push({duration: $(o).attr('duration'), equation: $(o).attr('equation')})
	})

	if(wc.length == 0){
		alert('Add wave equation', ALERT_CODE.WARN)
		return;
	} else if(!data.get('param-avblock').trim()){
		alert('Specify averaging block size', ALERT_CODE.WARN)
		return
	} else if(!data.get('param-symblock').trim()){
		alert('Specify symmetry block size', ALERT_CODE.WARN)
		return
	}

	// Drawing input wave
	var worker = new Worker('wavegen_worker.js')
	worker.postMessage({waves: wc, ts: ts})
	worker.addEventListener('message', function(e) {
		if(e.data.error){
			alert(e.data['err'], ALERT_CODE.ERROR)
			return
		}
		var wave_sample = e.data['data']
		var xlabels = Array.apply(null, {length: wave_sample.length}).map(function(o, i){
			return `${(i*ts).toFixed(2)}`
		})
		var ctx = $('#input-chart')
		var wave = createDatasets({
			'labels': xlabels,
			'datasets': wave_sample,
			'datalabel': 'Wave input'
		})

		if(wavechart != null)
			wavechart.destroy()

		wavechart = new Chart(ctx, {
			type: 'line',
			data: wave,
				options: {
					layout: {padding: {left:10}},
					title: {
						display: true, text: 'Input wave'
					},
					scales: {
						xAxes: [{
							ticks: {maxTicksLimit: 20},
							scaleLabel: {
								display: true,
								labelString: 'seconds'
							}
						}]
					}
				}
		})

		$('.modal-title').text('Analyzing frequency')
		$('.progress-bar').attr('aria-valuenow', 100).css('width', '100%')

		data.append('waves', JSON.stringify(wave_sample))
		$.ajax({
			url: "/submit",
			type: "POST",
			data: data,
			processData: false,
			contentType: false,
			success: function(data, status) { 
				// Drawing frequency
				var sample_count = data.sample_count
				var ctx = $('#freq-chart')
				var dataz = createDatasets({
					'labels': Array.apply(null, {length: sample_count.length}).map(Number.call, Number),
					'datasets': sample_count,
					'datalabel': 'Frequency',
				})

				if(freqchart != null)
					freqchart.destroy()

				freqchart = new Chart(ctx, {
					type: 'line',
					data: dataz,
					options: {
						layout: {padding: {left:10}},
						title: {
							display: true, text: 'Frequency (Hz)'
						},
						scales: {
							xAxes: [{ ticks: {maxTicksLimit: 20 },
									scaleLabel: {
										display: true,
										labelString: '# of peaks detected'
									}
							}]
						}
					}
				})

				// Drawing sym chart
				var sym_val = data.sym_val
				ctx = $('#sym-chart')
				dataz = createDatasets({
					'labels': xlabels,
					'datasets': sym_val,
					'datalabel': 'Correlation result'
				})

				if(symchart != null)
					symchart.destroy()

				symchart = new Chart(ctx, {
					type: 'line',
					data: dataz,
					options: {
						layout: {padding: {left:10}},
						title: {
							display: true, text: 'Symmetry function result'
						},
						scales: {
							xAxes: [{
								ticks: {
									min: 0,
									maxTicksLimit: 20
								},
								scaleLabel: {
									display: true,
									labelString: 'seconds'
								}
							}]
						}
					}
				})
				$('#my-modal').modal('hide')
				if($('.alert').length)
					$('.alert').alert('close')
			},
			error: function(err) {
				alert(err.responseText, ALERT_CODE.ERROR)
			}
		})
		worker.terminate()
	})
})


})

