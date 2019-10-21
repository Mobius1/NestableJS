const instance = new Nestable("#myList", {
    data: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/86186/nestable-initdata.json"
});

instance.on("loaded", () => {
    instance.parent.classList.add("loaded");
});

function loadInitData() {
    instance.parent.classList.remove("loaded");
    fetch("https://s3-us-west-2.amazonaws.com/s.cdpn.io/86186/nestable-initdata.json").then(r => r.json())
    .then(data => {
        setTimeout(() => {
            instance.load(data);
        }, 500);
    });
}
function loadNewData() {
    instance.parent.classList.remove("loaded");
    fetch("https://s3-us-west-2.amazonaws.com/s.cdpn.io/86186/nestable-data.json").then(r => r.json())
    .then(data => {
        setTimeout(() => {
            instance.load(data);
        }, 500);
    });
}