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
		alert('Missing field(s) or entered incorrect format(s)')
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

function warn(msg){
//   if(!$('.alert').length){
		$('#alert').prepend(`<div class='alert alert-warning alert-dismissible' role='alert'> \
			<button type='button' class='close' data-dismiss='alert' aria-label='Close'>\
			<span aria-hidden='true'>&times;</span></button>\
			<strong>Warning!</strong> ${msg}</div>`)
//   }
	$('#my-modal').modal('hide')
}

function error(msg){
//   if(!$('.alert').length){
		$('#alert').prepend(`<div class='alert alert-danger alert-dismissible' role='alert'> \
			<button type='button' class='close' data-dismiss='alert' aria-label='Close'>\
			<span aria-hidden='true'>&times;</span></button>\
			<strong>Error!</strong> ${msg}</div>`)
//   }
	$('#my-modal').modal('hide')
}

$('form[id=main-submit]').on('submit', function(e) {
	e.preventDefault()
	var data = new FormData(this)
	var freq = data.get('freq').trim()
	if(freq == '') {
		warn('Missing sampling frequency value!!')
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
		warn('Add wave equation')
		return;
	}
	data.append('waves', JSON.stringify(wc))
	$.ajax({
		url: "/submit",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		success: function(data, status) { 
			// Drawing input wave
			var wave_sample = data.wave.split('\n')
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

			// Drawing frequency
			var sample_count = data.sample_count
			var ctx = $('#freq-chart')
			var dataz = createDatasets({
				'labels': Array.apply(null, {length: sample_count.length}).map(Number.call, Number),
				'datasets': sample_count,
				'datalabel': 'Frequency',
//         'stepped': true
			})

			if(freqchart != null)
				freqchart.destroy()

			freqchart = new Chart(ctx, {
				type: 'line',
				data: dataz,
				options: {
					title: {
						display: true, text: 'Frequency (Hz)'
					},
					scales: {
//             yAxes: [{
//               ticks: {
//                 min: 0,
//               }
//             }],
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
			error(err.responseText)
		}
	})
})

})
