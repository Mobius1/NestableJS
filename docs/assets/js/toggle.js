const expand = document.getElementById("expand");
const collapse = document.getElementById("collapse");

const instance = new Nestable();

expand.addEventListener("click", e => {
	instance.expandAll();
});

collpase.addEventListener("click", e => {
	instance.collpaseAll();
});