let gCurrentHighlightGenre;
function changeDecade(decade) {
	document.getElementById(`decade${gCurrentDecade}`).classList.remove("selectedDecade");
	gCurrentDecade = decade;
	document.getElementById(`decade${gCurrentDecade}`).classList.add("selectedDecade");
	updatePie();
	updateLine();
}
