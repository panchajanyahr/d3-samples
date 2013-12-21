var fullHeight = 500;
var fullWidth = 800;
var margin = { left: 0, right: 0, top: 0, bottom: 0};
var width = fullWidth - margin.left - margin.right;
var height = fullHeight - margin.top - margin.bottom;
var baseLineHeight = height * 0.6;
var current, next, prev, playback;
var duration = 300;
var startedPlayback = false;

$(function() {
	var container = d3.select("#container");

	var svg = container.append("svg")
						.attr("width", fullWidth)
						.attr("height", fullHeight);

	svg.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", fullHeight)
		.style("stroke", "black")
		.style("stroke-width", "3");

	svg.append("line")
		.attr("x1", 0)
		.attr("y1", fullHeight)
		.attr("x2", fullWidth)
		.attr("y2", fullHeight)
		.style("stroke", "black")
		.style("stroke-width", "3");

	draw = function(data) {
		data.sort(function(a, b) {
			return new Date(a["date"]).getTime() - new Date(b["date"]).getTime();
		});

		var xScale = d3.time.scale()
                    	.range([0, width])
                		.domain(d3.extent(data, function(d) { return new Date(d["date"]); }));

    	var bScale = d3.scale.linear()
    					.range([baseLineHeight, 0])
    					.domain([d3.min(data, function(d) { return d["param1"] }) - 1, 
								 d3.max(data, function(d) { return d["param1"] })]);

		var b = d3.svg.line()
					.x(function(d) { return xScale(new Date(d["date"])); })
					.y(function(d) { return bScale(d["param1"]); });

		svg.append("path")
			.attr("d", b(data))
			.attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        svg.append("line")
        	.attr("x1", 0)
        	.attr("y1", baseLineHeight)
        	.attr("x2", width)
        	.attr("y2", baseLineHeight)
        	.style("stroke", "black")
			.style("stroke-dasharray", "5,5");



		svg.append("circle")
			.attr("class", "b-highlight")
			.style("fill", "none")
			.style("stroke", "red")
			.style("stroke-width", "5")
			.attr("r", 10);

		show = function(i) {
			if (i >= 0 && i < data.length) {
				current = i;
				var firstData = data[i];

				svg.select("circle.b-highlight")
					.transition()
					.duration(duration)
					.attr("cx", xScale(new Date(firstData["date"])))
					.attr("cy", bScale(firstData["param1"]));

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


	d3.json("/chart_data.json", function(error, json) {
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

