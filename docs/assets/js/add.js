const instance = new Nestable("#myList", {
	animation: 250
});

DOM.select("#add_item").addEventListener("click", addItem, false);

function addItem(e) {
	
	let max = 0;
	
	const items = DOM.selectAll(".item");
	
	for ( const item of items ) {
		const num = parseInt(item.dataset.id, 10);
		
		if ( num > max ) {
			max = num;
		}
	}
	
	const li = document.createElement("li");
	li.dataset.id = max + 1;
	li.className = "item";
	li.innerHTML = `Item ${max + 1}`;
	
	instance.add(li);
}

function getItemById(id) {
	const items = DOM.selectAll(".item");
	
	for ( const item of items ) {
		if ( parseInt(item.dataset.id, 10) === parseInt(id, 10) ) {
			return item;
		}
	}
}