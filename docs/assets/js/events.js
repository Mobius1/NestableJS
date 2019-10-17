const instance = new Nestable("#myList", {
});

const events = [
	"init", "update", "start", "move", "stop", "nest", "unnest", "reorder", "error.maxdepth", "error.disabled", "error.collapsed", "error.confined"
];

const evNodes = {};

instance.on("init", () => {
	const evParent = document.getElementById("events");
	const frag = document.createDocumentFragment();
	for ( const event of events ) {
		const div = document.createElement("div");
		div.classList.add("event");
		div.textContent = event;
		
		evNodes[event] = div;
		
		frag.appendChild(div);
	}
	
	evParent.appendChild(frag);
	
	fireEvent("init");
});

instance.on("error.maxdepth", (el, max) => {
	fireEvent("error.maxdepth");
});

instance.on("error.disabled", () => {
	fireEvent("error.disabled");
});

instance.on("error.collapsed", () => {
	fireEvent("error.collapsed");
});

instance.on("error.confined", (item, parent, newParent) => {
	fireEvent("error.confined");
});

instance.on("update", () => {
	fireEvent("update");
});

instance.on("start", () => {
	fireEvent("start");
});

instance.on("move", () => {
	fireEvent("move");
});

instance.on("reorder", () => {
	fireEvent("reorder");
});

instance.on("nest", (newParent, oldParent) => {
	fireEvent("nest");
});

instance.on("unnest", (newParent, oldParent) => {
	fireEvent("unnest");
});

instance.on("stop", (data) => {
	fireEvent("stop");
});

function fireEvent(event) {
	evNodes[event].classList.add("active");
	
	if ( event.includes("error") ) {
		evNodes[event].classList.add("event-error");
	}
	
	setTimeout(() => {
		evNodes[event].classList.remove("event-error");
		evNodes[event].classList.remove("active");
	}, 300);
}