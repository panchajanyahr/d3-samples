var fullHeight = 500;
var fullWidth = 800;
var margin = { left: 0, right: 0, top: 15, bottom: 20};
var padding = { left: 15, right: 15, top: 0, bottom: 1};
var chartWidth = fullWidth - margin.left - margin.right - padding.left - padding.right;
var chartHeight = fullHeight - margin.top - margin.bottom - padding.top - padding.bottom;
var baseLineHeight = chartHeight * 0.6;
var current, next, prev, playback;
var duration = 300;
var startedPlayback = false;

$(function() {
	var container = d3.select("#container");

	var svg = container.append("svg")
						.attr("width", fullWidth)
						.attr("height", fullHeight);

	var chart = svg.append("g")
					.attr("class", "chart")
					.attr("transform", "translate(" + (margin.left + padding.left) + ", " + (margin.top + padding.top) + ")");

	var chartContainer = svg.append("g")
					.attr("class", "chart-container")
					.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

	var xLegend = svg.append("g")
					.attr("transform", "translate(" + 0 + ", " + (margin.top + chartHeight) + ")");

	chartContainer.append("line")
		.attr("class", "y-axis")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", chartHeight);

	chartContainer.append("line")
		.attr("class", "x-axis")
		.attr("x1", 0)
		.attr("y1", chartHeight)
		.attr("x2", fullWidth)
		.attr("y2", chartHeight);

	draw = function(data) {
		data.sort(function(a, b) {
			return new Date(a["A"]).getTime() - new Date(b["A"]).getTime();
		});

		var xScale = d3.time.scale()
                    	.range([0, chartWidth])
                		.domain(d3.extent(data, function(d) { return new Date(d["A"]); }));

    	var bScale = d3.scale.linear()
    					.range([baseLineHeight, 0])
    					.domain([d3.min(data, function(d) { return d["B"] }) - 1, 
								 d3.max(data, function(d) { return d["B"] })]);

    	var deScale = d3.scale.linear()
    					.range([0, chartWidth])
    					.domain([0, 1]);


		xLegend.append("text")
				.attr("x", 0)
				.attr("y", margin.bottom)
				.text(data[0]["A"]);

		xLegend.append("text")
				.attr("x", fullWidth - 60)
				.attr("y", margin.bottom)
				.text(data[data.length - 1]["A"]);

		chart.append("rect")
			.attr("class", "d-param")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", chartHeight);

		chart.append("rect")
			.attr("class", "e-param")
			.attr("y", 0)
			.attr("height", chartHeight);

        chart.append("line")
        	.attr("class", "f-param")
        	.attr("x1", 0)
        	.attr("y1", baseLineHeight)
        	.attr("x2", chartWidth)
        	.attr("y2", baseLineHeight);

		var b = d3.svg.line()
					.x(function(d) { return xScale(new Date(d["A"])); })
					.y(function(d) { return bScale(d["B"]); });

		chart.append("path")
			.attr("d", b(data))
			.attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");

		chart.append("circle")
			.attr("class", "b-highlight")
			.attr("r", 10);

		chart.append("rect")
			.attr("class", "b-highlight-shadow");

		chart.append("text")
			.attr("class", "b-param-text");

		chart.append("text")
			.attr("class", "h-param-text");

		chart.append("text")
			.attr("class", "i-param-text");

		show = function(i) {
			if (i >= 0 && i < data.length) {
				current = i;
				var selectedData = data[i];
				var bx = xScale(new Date(selectedData["A"]));
				var by = bScale(selectedData["B"]);
				var bShadowX = bx - 10;
				var bShadowY = by + 12;
				var bShadowHeight = baseLineHeight - bShadowY;
				var bTextX = bx - 20;
				var bTextY = by - 20;

				chart.select("circle.b-highlight")
					.transition()
					.duration(duration)
					.attr("cx", bx)
					.attr("cy", by);

				chart.select("rect.b-highlight-shadow")
					.transition()
					.duration(duration)
					.attr("x", bShadowX)
					.attr("y", bShadowY)
					.attr("width", 20)
					.attr("height", bShadowHeight);

				chart.select("text.b-param-text")
					.transition()
					.duration(duration)
					.attr("x", bTextX)
					.attr("y", bTextY)
					.text("$" + selectedData["B"]);

				chart.select("text.h-param-text")
					.transition()
					.duration(duration)
					.attr("x", bx + 20)
					.attr("y", bShadowY + bShadowHeight / 2)
					.text(selectedData["H"]);

				chart.select("text.i-param-text")
					.transition()
					.duration(duration)
					.attr("x", bx + 20)
					.attr("y", (bShadowY + bShadowHeight / 2) + 20)
					.text(selectedData["I"]);

				chart.select("rect.d-param")
					.transition()
					.duration(duration)
					.attr("width", deScale(selectedData["D"]));

				chart.select("rect.e-param")
					.transition()
					.duration(duration)
					.attr("x", deScale(selectedData["D"]))
					.attr("width", deScale(selectedData["E"]));

				return true;				
			}

			return false;
		};

		next = function() {
			return show(current + 1);
		};

		prev = function() {
			return show(current - 1);
		};

		show(0);

	};


	d3.json("chart_data.json", function(error, json) {
		if (error) return console.warn(error);
		draw(json);
	});

	start = function() {
		$('.playback').removeClass("play");
		$('.playback').addClass("pause");
		playback = setInterval(function() {
			if (!next()) {
				pause();
			}
		}, duration);
	};

	pause = function() {
		$('.playback').removeClass("pause");
		$('.playback').addClass("play");
		clearTimeout(playback);
	};

	$(".playback").click(function(e) { 
		if ($(this).hasClass("playing")) {
			pause();
			$(this).removeClass("playing");
		} else {
			$(this).addClass("playing");
			start(); 
		}
	});

	$(".backward").click(function() { pause(); prev(); });

	$(".forward").click(function() { pause(); next(); });

	$(".stop").click(function() { pause(); show(0); });

});

