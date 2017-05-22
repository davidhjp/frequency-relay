$(function(){
$('#dropdown-click-hz').click(function (){
	$('.dropdown-toggle').children().first().text('Hz  ')
})
$('#dropdown-click-khz').click(function (){
	$('.dropdown-toggle').children().first().text('Khz ')
})
$('#wave').change(function(e){
	var fr = new FileReader()
	fr.onload = function (e) {
		const arr = e.target.result.split("\n")
		var ctx = $('#input-chart')
		var data = {
				labels: Array.apply(null, {length: arr.length}).map(Number.call, Number),
				datasets: [
					{
						label: "Input wave samples",
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
						data: arr,
//             data: [65, 59, 80, 81, 56, 55, 40],
						spanGaps: false
					}
		    ]
		}
		var chart = new Chart(ctx, {
			type: 'line',
			data: data,
		})
	}
	fr.readAsText(e.target.files[0])
})
$('form[id=main-submit]').on('submit', function(e) {
	e.preventDefault()
	var data = new FormData(this)
	data.append('unit', $('.dropdown-toggle').children().first().text().trim())
	$.ajax({
		url: "/submit",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		success: function() { 
			console.log('donec')
		},
		error: function(err) {}
	})
})
})
