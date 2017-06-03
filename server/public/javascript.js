var symchart, freqchart, wavechart

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
$('#dropdown-click-hz').click(function (){
	$('.dropdown-toggle').children().first().text('Hz  ')
})
$('#dropdown-click-khz').click(function (){
	$('.dropdown-toggle').children().first().text('Khz ')
})

$('#add-wave').click(function (){
	var data = new FormData($('form[id=main-submit]')[0])
	var gain = parseInt(data.get('gain')), wfreq = parseFloat(data.get('wfreq')), cycle = parseInt(data.get('cycle'))
	if(isNaN(gain) || isNaN(wfreq) || isNaN(cycle)) {
		alert('Missing field(s) or entered incorrect format(s)')
		return null
	}
	$('<li></li>', {class: 'list-group-item wave-component', gain: gain, wfreq: wfreq, cycle: cycle})
				.prepend(`<b>Wave</b>: sin(2&pi;${wfreq})&nbsp&nbsp<b>Cycle</b>: ${cycle}
									<a href="#">
									<span style="float: right" class="glyphicon glyphicon-remove" aria-hidden="true"></span>
									</a>`).appendTo('#wave-list')
//         text: `Wave: sin(2 * pi * ${wfreq}) Cycle: ${cycle}`}).appendTo('#wave-list')
})

$('#wave').change(function(e){
	var fr = new FileReader()
	fr.onload = function (e) {
		const arr = e.target.result.split("\n")
		var ctx = $('#input-chart')
		var data = createDatasets({
			'labels': Array.apply(null, {length: arr.length}).map(Number.call, Number),
			'datasets': arr,
			'datalabel': 'Wave input'
		})

		if(wavechart != null)
			wavechart.destroy()

		wavechart = new Chart(ctx, {
			type: 'line',
			data: data,
				options: {
					scales: {
						xAxes: [{
							ticks: {
								maxTicksLimit: 30
							}
						}]
					}
				}
		})
	}
	fr.readAsText(e.target.files[0])
})
$('form[id=main-submit]').on('submit', function(e) {
	e.preventDefault()
	var data = new FormData(this)
	if(typeof(data.get('wave')) != 'object' || data.get('freq').trim() == '') {
		if(!$('.alert').length){
			$('#alert').prepend("<div class='alert alert-warning alert-dismissible' role='alert'> \
				<button type='button' class='close' data-dismiss='alert' aria-label='Close'>\
				<span aria-hidden='true'>&times;</span></button>\
				<strong>Warning!</strong> Missing required input</div>")
		}
		$('#my-modal').modal('hide')
		return;
	}

	data.append('unit', $('.dropdown-toggle').children().first().text().trim())
	$.ajax({
		url: "/submit",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		success: function(data, status) { 
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
					scales: {
//             yAxes: [{
//               ticks: {
//                 min: 0,
//               }
//             }],
						xAxes: [{ ticks: {maxTicksLimit: 20 }}]
					}
				}
			})
			var sym_val = data.sym_val
			ctx = $('#sym-chart')
			dataz = createDatasets({
				'labels': Array.apply(null, {length: sym_val.length}).map(Number.call, Number),
				'datasets': sym_val,
				'datalabel': 'Correlation result'
			})

			if(symchart != null)
				symchart.destroy()

			symchart = new Chart(ctx, {
				type: 'line',
				data: dataz,
				options: {
					scales: {
						xAxes: [{
							ticks: {
								min: 0,
								maxTicksLimit: 20
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
			console.log(err.statusText)
		}
	})
})
})
