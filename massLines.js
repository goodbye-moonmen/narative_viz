const totalWidth = 500;
const totalHeight = 400;
const margin = { left: 50, right: 50, top: 80, bottom: 50 };
const lineGraphWidth = totalWidth - margin.left - margin.right;
const lineGraphHeight = totalHeight - margin.top - margin.bottom;

const xAxis = d3
	.scaleTime()
	.domain([new Date(1950, 0), new Date(2018, 0)])
	.range([0, lineGraphWidth]);

let yAxis;
function drawAllLines() {
	const oneDiv = d3.select("#bars");
	const revByYear = getRevenueDataByYear();
	yAxis = d3
		.scaleLinear()
		.domain([0, d3.max(revByYear, (revByGenre) => d3.max(revByGenre, (d) => d.revenue))])
		.range([lineGraphHeight, 0]);

	for (const g of GENRES_CONST) {
		drawLine(oneDiv, revByYear[GENRES_CONST.indexOf(g)], GENRES_CONST.indexOf(g));
	}
}

function drawLine(parent, data, genreID) {
	const svgArea = parent
		.append("svg")
		.attr("width", totalWidth)
		.attr("height", totalHeight);

	svgArea
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top / 2 + ")")
		.append("text")
		.text(GENRES_CONST[genreID])
		.attr("fill", gColors(genreID))
		.attr("font-family", "sans-serif")
		.attr("font-size", "1.4em")
		.attr("font-weight", "bold");

	const graphArea = svgArea.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	graphArea
		.append("g")
		.attr("transform", "translate(0," + lineGraphHeight + ")")
		.call(d3.axisBottom(xAxis).ticks(d3.timeYear.every(10)));

	graphArea.append("g").call(d3.axisLeft(yAxis).ticks(5));

	graphArea
		.append("text")
		.attr("transform", `translate(${lineGraphWidth / 2},${lineGraphHeight + margin.top - 5})`)
		.style("text-anchor", "middle")
		.text("Year");

	graphArea
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left)
		.attr("x", 0 - lineGraphHeight / 2)
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Billion $");

	graphArea
		.append("rect")
		.attr("x", xAxis(new Date(gCurrentDecade, 0)))
		.attr("height", lineGraphHeight)
		.attr("width", lineGraphWidth / 7)
		.attr("stroke", "none")
		.attr("fill", "#b8f7ff")
		.attr("opacity", "0.5");

	const line = d3
		.line()
		.x((d) => xAxis(d.year))
		.y((d) => yAxis(d.revenue));

	graphArea
		.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", gColors(genreID))
		.attr("stroke-width", 1.5)
		.attr("d", line);
}

function updateLine() {
	if (gCurrentDecade) {
		d3.select("#bars")
			.selectAll("rect")
			.transition()
			.duration(500)
			.attr("x", xAxis(new Date(gCurrentDecade, 0)));
	}
}

function getRevenueDataByYear() {
	return GENRES_CONST.map((genre) => {
		const genreData = gData.filter((d) => d.genres && d.genres.indexOf(genre) > 0);
		const result = [];
		for (let year = 1950; year < 2018; year += 1) {
			const yearData = genreData.filter((d) => d.year === year);
			result.push({ year: new Date(year, 0), revenue: yearData.reduce((sum, d) => sum + d.revenue, 0) / 1000 });
		}
		return result;
	});
}
