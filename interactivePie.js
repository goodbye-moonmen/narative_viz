async function visualize(){
    const height = 500;
    const width = 500;
    const selectedDecate = 2010;
    const radius = Math.min(height,width) / 2;
    // const color = d3.scale.category20();
    // const genreColors = (i)=>d3.interpolateViridis(d3.scaleOrdinal().domain(GENRES_CONST)(i));
    const data = await loadData();
    const decadeData = data.filter((d)=>(d.year === selectedDecate && !!d.genres));
    const computedRevenuData = computeRevenueData(decadeData);
    const pie = d3.pie().value((d)=>{
        console.log(d);
        return d.revenue;
    }).sort(null);
    const svg = d3.select("#donut")
                .append("svg")
                .attr("width",width)
                .attr("height",height)
                .append("g")
                .attr("transform",`translate(${width / 2}, ${height / 2})`);
    const arc = d3.arc().innerRadius(radius - 100).outerRadius(radius - 20);
    svg.selectAll("path").data(pie(computedRevenuData)).enter().append("path")
    .attr("fill",(d,i)=>{return d3.interpolateSinebow(i/GENRES_CONST.length);})
    .attr("d",arc)
    .attr("stroke","grey")
    .attr("stroke-width","2");
}

async function loadData() {
    const isLocal = true;
    const url = (isLocal ? "https://goodbye-moonmen.github.io/narative_viz/" : "") + "movieSimple.tsv";
    const data = await d3.tsv(url,transformData);
    return data;
}

function computeRevenueData(decadeData){
    const result = GENRES_CONST.map((g)=>({name:g,revenue:0}));
    decadeData.forEach((d)=>{
        const splitRevenue = d.revenue/d.genres.length;
        d.genres.forEach((g)=>{
            const index = GENRES_CONST.indexOf(g);
            result[index]["revenue"] = result[index]["revenue"] + splitRevenue;
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
function transformData(entry){
    const processedGenres = processGenres(entry["Genres"]);
    if(!processGenres){
        console.warn("Invalid entry:"+entry["Genres"]);
        return null;
    }else{
        return ({
            title: entry["Title"],
            decade: Number(entry["Decade"]),
            year: Number(entry["Year of Release Date"]),
            genres: processedGenres,
            revenue: Number(entry["Revenue"].replace(/,/g,""))/1000000,
        });
    }
}

const GENRES_CONST = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Foreign",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "TV Movie",
    "Thriller",
    "War",
    "Western",
];
// All possible genres
// Action: 1716
// Adventure: 1099
// Animation: 376
// Comedy: 2572
// Crime: 1071
// Documentary: 220
// Drama: 3583
// Family: 665
// Fantasy: 622
// Foreign: 84
// History: 283
// Horror: 729
// Music: 253
// Mystery: 536
// Romance: 1389
// Science Fiction: 738
// TV Movie: 1 <- This is ignored
// Thriller: 1854
// War: 229
// Western: 109

// Genre keys:
// id 
// name
function processGenres(rawGenres){
    try{
        const entryGenres = JSON.parse(rawGenres.replace(/\'/g,"\""));
        const genresArray = entryGenres.map((genreObj)=>genreObj.name);
        if(genresArray.includes("TV Movies")){
            return undefined;
        }
        return genresArray;
    }catch(e){
        return undefined;
    }
}