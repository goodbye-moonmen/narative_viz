let gCurrentDecade = 1950;
let previousDecade = 1950;
const height = 500;
const width = 500;
let gData;
let globalPathHandle;
let globalPieHandle;
let globalArcHandle;

function changeDecade(decade) {
	document.getElementById(`decade${gCurrentDecade}`).classList.remove("selectedDecade");
	gCurrentDecade = decade;
	document.getElementById(`decade${gCurrentDecade}`).classList.add("selectedDecade");
	updatePie();
}

async function init() {
	d3.selectAll(".decadeButton").attr("disabled", true);
	gData = await fetchDataFromWeb();
	d3.selectAll(".decadeButton").attr("disabled", false);
	const radius = Math.min(height, width) / 2;
	const gCurrentDecade = 1950;
	const colors = d3.scaleOrdinal(d3.schemePaired);
	globalPieHandle = d3
		.pie()
		.value((d) => d.revenue)
		.sort(null);
	// .padAngle(0.01);
	const svg = d3
		.select("#donut")
		.append("svg")
		.attr("width", width + 250)
		.attr("height", height)
		.append("g")
		.attr("transform", `translate(${width / 2}, ${height / 2})`);
	globalArcHandle = d3
		.arc()
		.innerRadius(radius - 100)
		.outerRadius(radius - 20);
	globalPathHandle = svg
		.selectAll("path")
		.data(globalPieHandle(getRevenueData()))
		.enter()
		.append("path")
		.attr("class", "piePath")
		.attr("fill", (_d, i) => colors(i))
		.attr("d", globalArcHandle)
		.attr("stroke-width", "2px")
		.on("mouseover", (d, i) => handlePiePieceHover(d, i, svg))
		.on("mouseout", () => handlePiePieceLeave());
}

function updatePie() {
	d3.select("#donut")
		.selectAll("path")
		.data(globalPieHandle(getRevenueData()))
		.transition()
		.duration(500)
		.attr("d", globalArcHandle);
}

async function fetchDataFromWeb() {
	const isLocal = true;
	const url = (isLocal ? "https://goodbye-moonmen.github.io/narative_viz/" : "") + "movieSimple.tsv";
	const data = await d3.tsv(url, transformData);
	return data;
}

function handlePiePieceLeave() {
	d3.select("#genreLabel").remove();
	d3.select("#revenueLabel").remove();
	d3.select("#countLabel").remove();
}

function handlePiePieceHover(_d, i, svg) {
	const decadeData = gData.filter((d) => d.decade === gCurrentDecade && !!d.genres);
	const computedRevenuData = getRevenueData(decadeData);
	handlePiePieceLeave();
	currentHighlightGenre = GENRES_CONST[i];
	svg.append("text")
		.attr("id", "genreLabel")
		.attr("text-anchor", "middle")
		.attr("dy", "-18")
		.text(`Genre: ${currentHighlightGenre}`);
	svg.append("text")
		.attr("id", "revenueLabel")
		.attr("text-anchor", "middle")
		.attr("dy", "0")
		.text(`Movie count: ${computedRevenuData[i].count}`);
	svg.append("text")
		.attr("id", "countLabel")
		.attr("text-anchor", "middle")
		.attr("dy", "18")
		.text(`Total revenue: $${computedRevenuData[i].revenue.toFixed(2)}M`);
}

function getRevenueData() {
	const decadeData = gData.filter((d) => d.decade === gCurrentDecade && !!d.genres);
	const result = GENRES_CONST.map((g) => ({ name: g, revenue: 0, count: 0 }));
	decadeData.forEach((d) => {
		const limitedGenres = d.genres.filter((g) => GENRES_CONST.includes(g));
		const splitRevenue = d.revenue / limitedGenres.length;
		limitedGenres.forEach((g) => {
			const index = GENRES_CONST.indexOf(g);
			result[index]["revenue"] = result[index]["revenue"] + splitRevenue;
			result[index]["count"] = result[index]["count"] + 1;
		});
	});
	return result;
}

// Data keys:
// Decade
// Year of Release Date
// Title
// Genres
// Poster Path
// Number of Records
// Revenue
function transformData(entry) {
	const processedGenres = processGenres(entry["Genres"]);
	if (!processGenres) {
		console.warn("Invalid entry:" + entry["Genres"]);
		return null;
	} else {
		return {
			title: entry["Title"],
			decade: Number(entry["Decade"]),
			year: Number(entry["Year of Release Date"]),
			genres: processedGenres,
			revenue: Number(entry["Revenue"].replace(/,/g, "")) / 1000000,
		};
	}
}

const GENRES_CONST = [
	"Action",
	"Adventure",
	// "Animation",
	"Comedy",
	"Crime",
	// "Documentary",
	"Drama",
	"Family",
	"Fantasy",
	// "Foreign".
	// "History",
	"Horror",
	// "Music",
	"Mystery",
	"Romance",
	"Science Fiction",
	// "TV Movies",
	"Thriller",
	// "War",
	// "Western",
];
// All possible genres
// Action: 1716
// Adventure: 1099
// Animation: 376 <- This is ignored
// Comedy: 2572
// Crime: 1071
// Documentary: 220 <- This is ignored
// Drama: 3583
// Family: 665
// Fantasy: 622
// Foreign: 84 <- This is ignored
// History: 283 <- This is ignored
// Horror: 729
// Music: 253 <- This is ignored
// Mystery: 536
// Romance: 1389
// Science Fiction: 738
// TV Movie: 1 <- This is ignored
// Thriller: 1854
// War: 229 <- This is ignored
// Western: 109 <- This is ignored

// Genre keys:
// id
// name
function processGenres(rawGenres) {
	try {
		const entryGenres = JSON.parse(rawGenres.replace(/\'/g, '"'));
		const genresArray = entryGenres.map((genreObj) => genreObj.name);
		if (genresArray.includes("TV Movies")) {
			return undefined;
		}
		return genresArray;
	} catch (e) {
		return undefined;
	}
}
