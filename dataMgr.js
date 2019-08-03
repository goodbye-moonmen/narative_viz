let gData;

async function fetchDataFromWeb() {
	const isLocal = true;
	const url = (isLocal ? "https://goodbye-moonmen.github.io/narative_viz/" : "") + "movieSimple.tsv";
	const data = await d3.tsv(url, transformData);
	return data;
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
			link: entry["Poster Path"],
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
