let gCurrentDecade = 1950;
const pieHeight = 500;
const pieWidth = 500;
const pieRadius = 250;
const widthPadding = 0;
const heighPadding = 0;
const legendDotRadius = 10;
let gSVGarea = d3
	.select("#donutChart")
	.append("svg")
	.attr("width", pieWidth + widthPadding)
	.attr("height", pieHeight + heighPadding);
let gPieArea = gSVGarea.append("g").attr("transform", `translate(${pieWidth / 2}, ${(pieHeight + heighPadding) / 2})`);
let gInfoArea = gSVGarea.append("g").attr("transform", `translate(500, 0)`);

const gArc = d3
	.arc()
	.innerRadius(pieRadius - 100)
	.outerRadius(pieRadius - 20);

const gOuterArc = d3
	.arc()
	.innerRadius(pieRadius + 10)
	.outerRadius(pieRadius + 10);

const gPie = d3
	.pie()
	.value((d) => d.revenue)
	.sort(null);

function gColors(i) {
	switch (i) {
		case 0:
			return "#092b3b";
		case 2:
			return "#042e07";
		case 6:
			return "#ed5311";
		case 10:
			return "#0b4744";
		case 11:
			return "#c7c400";
		default:
			return d3.schemePaired[i];
	}
}

async function init() {
	d3.selectAll(".decadeButton").attr("disabled", true);
	gData = await fetchDataFromWeb();
	d3.selectAll(".decadeButton").attr("disabled", false);
	gCurrentDecade = 1950;
	gPieArea
		.selectAll("path")
		.data(gPie(getRevenueDataByDecade()))
		.enter()
		.append("path")
		.attr("class", "piePath")
		.attr("id", (d) => `${d.data.name}_path`)
		.attr("fill", (_d, i) => gColors(i))
		.attr("opacity", "0.8")
		.attr("d", gArc)
		.each((d) => (this._current = d))
		.attr("stroke-width", "2px")
		.on("mouseover", handlePiePieceHover)
		.on("mouseout", () => handlePiePieceLeave(false));
	const legendArea = gPieArea
		.selectAll(".legend")
		.data(GENRES_CONST)
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", (d, i) => {
			var height = legendDotRadius * 2 + 4;
			var offset = (height * GENRES_CONST.length) / 4;
			var horz = -2 * legendDotRadius * 3;
			var vert = (i % 6) * height - offset;
			return "translate(" + ((i / 6 < 1 ? horz : -1 * horz) - 40) + "," + vert + ")";
		});
	legendArea
		.append("circle")
		.attr("id", (d) => `${d}_legend`)
		.attr("r", legendDotRadius)
		.style("fill", (_d, i) => gColors(i))
		.attr("opacity", "0.8")
		.style("stroke", (_d, i) => gColors(i))
		.on("mouseover", handlePiePieceHover)
		.on("mouseout", () => handlePiePieceLeave(false));
	legendArea
		.append("text") // NEW
		.attr("x", legendDotRadius + 2) // NEW
		.attr("y", legendDotRadius - 2) // NEW
		.text((d) => d);

	drawAllLines();
	changeDecade(1950);
}

function updatePie() {
	d3.select("#donutChart")
		.selectAll("path")
		.data(gPie(getRevenueDataByDecade()))
		.transition()
		.duration(500)
		.attrTween("d", arcTween)
		.attr("id", (d) => `${d.data.name}_path`);
}

function arcTween(a) {
	var i = d3.interpolate(this._current, a);
	this._current = i(0);
	return function(t) {
		return gArc(i(t));
	};
}

function handlePiePieceLeave(toAnother) {
	if (gCurrentHighlightGenre) {
		d3.select(`[id='${gCurrentHighlightGenre}_legend']`).attr("opacity", "0.8");
		d3.select(`[id='${gCurrentHighlightGenre}_path']`).attr("opacity", "0.8");
	}
	d3.select("#posterCard").html("");
	if (toAnother) {
		d3.select("#donutInfoGeneral").html("");
		d3.select("#donutInfoMovie").html("");
	} else {
		d3.select("#donutInfoGeneral").html("Please hover over a section to see more details.");
		d3.select("#donutInfoMovie").html("Please hover over a section to see more details.");
	}
}

function handlePiePieceHover(_d, i) {
	handlePiePieceLeave(true);
	gCurrentHighlightGenre = GENRES_CONST[i];
	const revData = getRevenueDataByDecade()[i];
	d3.select(`[id='${gCurrentHighlightGenre}_legend']`).attr("opacity", "1");
	d3.select(`[id='${gCurrentHighlightGenre}_path']`).attr("opacity", "1");
	d3.select("#donutInfoGeneral")
		.append("ul")
		.style("list-style-type", "none")
		.selectAll("li")
		.data([{ name: "name", displayName: "Genre" }, { name: "count", displayName: "Total number of movies" }, { name: "revenueString", displayName: "Total revenue" }])
		.enter()
		.append("li")
		.html((d) => {
			return d.displayName + ": " + revData[d.name];
		});

	const topMovie = revData["topMovie"];
	const ulEl = d3
		.select("#donutInfoMovie")
		.append("ul")
		.style("list-style-type", "none");
	ulEl.append("li").html(`${topMovie.title}(${topMovie.year})`);
	ulEl.append("li").html(`Revenue: ${formatMoney(topMovie.revenue)}`);
	ulEl.append("li")
		.html("Official genres:")
		.append("ul")
		.selectAll("li")
		.data(topMovie.genres)
		.enter()
		.append("li")
		.html((d) => d);
	d3.select("#posterCard")
		.append("img")
		.attr("src", "https://image.tmdb.org/t/p/w500" + topMovie.link)
		.style("max-height", "320px");
}

function getRevenueDataByDecade() {
	const decadeData = gData.filter((d) => d.decade === gCurrentDecade && !!d.genres);
	const result = GENRES_CONST.map((g) => ({ name: g, revenue: 0, revenueString: "0", count: 0, topRevenue: 0, topMovie: undefined }));
	decadeData.forEach((d) => {
		const limitedGenres = d.genres.filter((g) => GENRES_CONST.includes(g));
		limitedGenres.forEach((g) => {
			const index = GENRES_CONST.indexOf(g);
			result[index]["revenue"] = result[index]["revenue"] + d.revenue;
			result[index]["revenueString"] = formatMoney(result[index]["revenue"]);
			result[index]["count"] = result[index]["count"] + 1;
			if (d.revenue > result[index]["topRevenue"]) {
				result[index]["topRevenue"] = d.revenue;
				result[index]["topMovie"] = d;
			}
		});
	});
	return result;
}

function formatMoney(value) {
	if (value > 1000) {
		return `$${(value / 1000).toFixed(2)}B`;
	}
	return `$${value.toFixed(2)}M`;
}
