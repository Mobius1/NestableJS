const instance = new Nestable("#myList");

instance.on("error.confined", (item, parent, newParent) => {
    parent.classList.add("nst-error");
});

instance.on("stop", (data) => {
    instance.parent.querySelectorAll(".nst-error").forEach(el => el.classList.remove("nst-error"));
});