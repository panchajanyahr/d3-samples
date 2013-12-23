var fullHeight = 450;
var fullWidth = 800;
var margin = { left: 0, right: 0, top: 35, bottom: 20};
var padding = { left: 25, right: 25, top: 0, bottom: 1};
var chartWidth = fullWidth - margin.left - margin.right - padding.left - padding.right;
var chartHeight = fullHeight - margin.top - margin.bottom - padding.top - padding.bottom;
var current, next, prev, playback;
var animationDuration = 300;
var startedPlayback = false;
var labels = {
	"f-param" : "F COLUMN LABEL",
	"g-param" : "G COLUMN LABEL",
	"h-param" : "H COLUMN LABEL",
	"i-param" : "I COLUMN LABEL"
}

$(function() {
	var container = d3.select("#chart_container");

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

		var bExtent = d3.extent(data, function(d) { return d["B"]; });
		var fExtent = d3.extent(data, function(d) { return d["F"]; });
		var bfExtent = d3.extent(bExtent.concat(fExtent));
		var roundUpBy5 = function(num) { return 5 * Math.ceil(num / 5); };
		var roundDownBy5 = function(num) { return 5 * Math.floor(num / 5); };

    	var bfScale = d3.scale.linear()
    					.range([chartHeight, 0])
    					.domain([roundDownBy5(bfExtent[0] * 0.9), roundUpBy5(bfExtent[1] * 1.01)]);

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
        	.attr("x2", chartWidth);

		var b = d3.svg.line()
					.x(function(d) { return xScale(new Date(d["A"])); })
					.y(function(d) { return bfScale(d["B"]); });

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
			.attr("class", "h-param-text")
			.append("tspan")
			.attr("class", "value");

		chart.append("text")
			.attr("dy", "1.35em")
			.attr("class", "i-param-text")
			.append("tspan")
			.attr("class", "value");

		chart.append("text")
			.attr("class", "g-param-text")
			.attr("x", chartWidth / 2)
			.attr("y", chartHeight + 20)
			.append("tspan")
			.attr("class", "value");

		show = function(i) {
			if (i >= 0 && i < data.length) {
				current = i;
				var selectedData = data[i];
				var bx = xScale(new Date(selectedData["A"]));
				var by = bfScale(selectedData["B"]);
				var fy = bfScale(selectedData["F"]);
				var bShadowX = bx - 10, bShadowY, bShadowHeight;
				var bTextX = bx - 20, bTextY, hiParamX, hiParamTextAnchor;

				if (bx < chartWidth / 2) {
					hiParamX = bx + 20;
					hiParamTextAnchor = "start";
				} else {
					hiParamX = bx - 20;
					hiParamTextAnchor = "end";
				}

				if (by < fy) {
					bShadowY = by + 12;
					bShadowHeight = fy - bShadowY;					
					bTextY = by - 20;
				} else {
					bShadowY = fy;
					bShadowHeight = by - bShadowY - 12;
					bTextY = by + 40;
				}

				chart.select("circle.b-highlight")
					.transition()
					.duration(animationDuration)
					.attr("cx", bx)
					.attr("cy", by);

				chart.select("rect.b-highlight-shadow")
					.transition()
					.duration(animationDuration)
					.attr("x", bShadowX)
					.attr("y", bShadowY)
					.attr("width", 20)
					.attr("height", bShadowHeight);

				chart.select("text.b-param-text")
					.transition()
					.duration(animationDuration)
					.attr("x", bTextX)
					.attr("y", bTextY)
					.text("$" + selectedData["B"]);

				chart.select("text.h-param-text")
					.transition()
					.duration(animationDuration)
					.attr("text-anchor", hiParamTextAnchor);

				chart.select("text.h-param-text tspan.value")
					.transition()
					.duration(animationDuration)
					.attr("x", hiParamX)
					.attr("y", bShadowY + bShadowHeight / 2)
					.text(selectedData["H"]);

				chart.select("text.i-param-text")
					.transition()
					.duration(animationDuration)
					.attr("text-anchor", hiParamTextAnchor);

				chart.select("text.i-param-text tspan.value")
					.transition()
					.duration(animationDuration)
					.attr("x", hiParamX)
					.attr("y", bShadowY + bShadowHeight / 2)
					.text(selectedData["I"]);

				chart.select("text.g-param-text tspan.value")
					.transition()
					.duration(animationDuration)
					.text(selectedData["I"]);

				chart.select("rect.d-param")
					.transition()
					.duration(animationDuration)
					.attr("width", deScale(selectedData["D"]));

				chart.select("rect.e-param")
					.transition()
					.duration(animationDuration)
					.attr("x", deScale(selectedData["D"]))
					.attr("width", deScale(selectedData["E"]));

				chart.select("line.f-param")
					.transition()
					.duration(animationDuration)
					.attr("y1", bfScale(selectedData["F"]))
    		    	.attr("y2", bfScale(selectedData["F"]));

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
		$.each(labels, function(k, v) {
			$('input.' + k).val(v);
			setLabel(k, v);
		});
	};


	d3.json("chart_data.json", function(error, json) {
		if (error) return console.warn(error);
		draw(json);
	});

	start = function() {
		$(".play").hide();
		$(".pause").show();

		playback = setInterval(function() {
			if (!next()) {
				pause();
			}
		}, animationDuration);
	};

	pause = function() {
		$(".pause").hide();
		$(".play").show();

		clearTimeout(playback);
	};

	$(".play").click(function(e) { 
		start();
	});

	$(".pause").click(function(e) { 
		pause();
	});

	$(".backward").click(function() { pause(); prev(); });

	$(".forward").click(function() { pause(); next(); });

	$(".stop").click(function() { pause(); show(0); });

	$('#controls i').popup()

	$('.pause').hide();

	setLabel = function(key, value) {
		var texts = d3.select('text.'+key+'-text')
						.selectAll('tspan.text')
						.data([value]);

		texts.enter()
			.append('tspan')
			.attr('class', 'text');

		texts.text(" " + value);
	};

	$('#configuration input').keyup(function() {
		setLabel($(this).attr('class'), $(this).val());
	});

});

