/*!
*
* NestableJS
* Copyright (c) 2019 Karl Saunders
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*
* Version: 0.0.7
*
*/
const DOM = {
    select: (selector, parent = document) => {
        return parent.querySelector(selector);
    },
    selectAll: (selector, parent = document) => {
        return parent.querySelectorAll(selector);
    },
    /**
    * Get an elements children that match the selector
    * @param  {Node} elem The base element
    * @param  {String} selector CSS3 selector string
    * @return {Array}
    */
    children: (elem, selector) => {
        const arr = [];
        const children = elem.children;
        const l = children.length;
        for (let i = 0; i < l; ++i) {
            const child = children[i];
            if (child.matches(selector)) {
                arr.push(child);
            }
        }
        return arr;
    },
    /**
    * Get all DOM element up the tree that match the selector
    * @param  {Node} elem The base element
    * @param  {String} selector CSS3 selector string
    * @return {Array}
    */
    parents: (elem, selector) => {
        // Set up a parent array
        var parents = [];

        // Push each parent element to the array
        for (; elem && elem !== document; elem = elem.parentNode) {
            if (selector) {
                if (elem.matches(selector)) {
                    parents.push(elem);
                }
                continue;
            }
            parents.push(elem);
        }

        // Return our parent array
        return parents;
    },
    /**
    * Get an element's DOMRect relative to the document instead of the viewport.
    * @param  {Object} el  HTMLElement
    * @return {Object}     Formatted DOMRect copy
    */
    rect(el) {
        var w = window,
            st = (w.pageYOffset !== undefined) ? w.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop,
            o = el.getBoundingClientRect(),
            x = w.pageXOffset,
            y = st;
        return {
            left: o.left + x,
            top: o.top + y,
            height: o.height,
            width: o.width
        };
    }
}

class Nestable {
    constructor(list, options) {

        this.defaultConfig = {
            threshold: 40,
            animation: 0,
            collapseButtonContent: "–",
            expandButtonContent: "+",
            includeContent: false,
            maxDepth: 3,
            showPlaceholderOnMove: false,
            nodes: {
                list: "ol",
                item: "li"
            },
            classes: {
                list: "nst-list",
                item: "nst-item",
                content: "nst-content",
                parent: "nst-parent",
                dragging: "nst-dragging",
                handle: "nst-handle",
                placeholder: "nst-placeholder",
                container: "nst-container",
                button: "nst-button",
                collapsed: "nst-collapsed",
                disabled: "nst-disabled",
                error: "nst-error",
                moving: "nst-moving",
            },
        };

        this.config = Object.assign({}, this.defaultConfig, options);

        if (options) {
            if (options.nodes) {
                this.config.nodes = Object.assign({}, this.defaultConfig.nodes, options.nodes);
            }

            if (options.classes) {
                this.config.classes = Object.assign({}, this.defaultConfig.classes, options.classes);
            }
        }

        this.parent = typeof list === "string" ? DOM.select(list) : list;

        if (!this.parent) {
            return console.error(`Node (${list}) not found.`);
        }

        if (this.parent._nestable) {
            return console.error("There is already a Nestable instance active on this node.");
        }

        this.initialised = false;
        this.disabled = true;
        this.last = {
            x: 0,
            y: 0
        };

        this.init();
    }

    /**
    * Add custom event listener
    * @param  {String} event
    * @param  {Function} callback
    * @return {Void}
    */
    on(listener, fn, capture) {
        if (typeof listener === "string") {
            this.listeners = this.listeners || {};
            this.listeners[listener] = this.listeners[listener] || [];
            this.listeners[listener].push(fn);
        } else {
            arguments[0].addEventListener(arguments[1], arguments[2], false);
        }
    }

    /**
    * Remove custom listener listener
    * @param  {String} listener
    * @param  {Function} callback
    * @return {Void}
    */
    off(listener, fn) {
        if (typeof listener === "string") {
            this.listeners = this.listeners || {};
            if (listener in this.listeners === false) return;
            this.listeners[listener].splice(this.listeners[listener].indexOf(fn), 1);
        } else {
            arguments[0].removeEventListener(arguments[1], arguments[2]);
        }
    }

    /**
    * Fire custom listener
    * @param  {String} listener
    * @return {Void}
    */
    emit(listener) {
        this.listeners = this.listeners || {};
        if (listener in this.listeners === false) return;
        for (var i = 0; i < this.listeners[listener].length; i++) {
            this.listeners[listener][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }

    init(options) {
        if (!this.initialised) {

            this.touch =
                "ontouchstart" in window ||
                (window.DocumentTouch && document instanceof DocumentTouch);

            if (options) {
                this.config = Object.assign({}, this.defaultConfig, options);
            }

            this.dragDepth = 0;

            this.parent.classList.add(this.config.classes.list);
            this.parent.classList.add(this.config.classes.parent);


            const items = DOM.children(this.parent, this.config.nodes.item);
            for (const item of items) {
                this._nest(item);
            }

            this.placeholder = document.createElement(this.config.nodes.item);
            this.placeholder.classList.add(this.config.classes.placeholder);

            this._getData();

            this.parent._nestable = this;

            if (!window._nestableInstances) {
                window._nestableInstances = 1;

                this.id = 1;
            } else {
                window._nestableInstances += 1;

                this.id = window._nestableInstances
            }

            this.enable();

            this._getData();

            setTimeout(() => {
                this.emit("init");
            }, 10);

            this.initialised = true;
        }
    }

    destroy() {

        if (this.initialised) {

            this.initialised = false;

            this.disable();

            this.parent.classList.remove(this.config.classes.list);
            this.parent.classList.remove(this.config.classes.parent);

            delete(this.parent._nestable);

            if (window._nestableInstances) {
                window._nestableInstances -= 1;
            }

            const destroyItem = (item) => {
                item.classList.remove(this.config.classes.item);
                item.classList.remove(this.config.classes.collapsed);

                const listEl = item.querySelector(this.config.nodes.list);
                const contentEl = item.querySelector(`.${this.config.classes.content}`);
                const handleEl = item.querySelector(`.${this.config.classes.handle}`);
                const buttonEl = item.querySelector(`.${this.config.classes.button}`);

                // default handle is also the content container
                const defaultHandle = contentEl.classList.contains(this.config.classes.handle);

                const div = document.createDocumentFragment();

                for (var i = contentEl.childNodes.length - 1; i >= 0; i--) {
                    div.insertBefore(contentEl.childNodes[i], div.firstChild);
                }

                item.insertBefore(div, contentEl)
                item.removeChild(contentEl);

                if (listEl) {
                    listEl.classList.remove(this.config.classes.list);
                    item.removeChild(buttonEl);

                    const items = DOM.children(listEl, this.config.nodes.item);

                    for (const item of items) {
                        destroyItem(item);
                    }
                }
            };

            const items = DOM.children(this.parent, this.config.nodes.item);

            for (const item of items) {
                destroyItem(item);
            }

            this.emit("destroy", this.parent);
        }
    }

    bind() {
        this.events = {
            start: this._onMouseDown.bind(this),
            move: this._onMouseMove.bind(this),
            end: this._onMouseUp.bind(this),
        };

        if (this.touch) {
            this.parent.addEventListener("touchstart", this.events.start, false);
            document.addEventListener("touchmove", this.events.move, false);
            document.addEventListener("touchend", this.events.end, false);
            document.addEventListener("touchcancel", this.events.end, false);
        } else {
            this.parent.addEventListener("mousedown", this.events.start, false);
            document.addEventListener("mousemove", this.events.move, false);
            document.addEventListener("mouseup", this.events.end, false);
        }
    }

    unbind() {
        this.parent.removeEventListener("mousedown", this.events.start);
        document.removeEventListener("mousemove", this.events.move);
        document.removeEventListener("mouseup", this.events.end);
    }

    enable() {
        if (this.disabled) {
            this.bind();

            this.parent.classList.remove(this.config.classes.disabled);

            this.disabled = false;
        }
    }

    disable() {
        if (!this.disabled) {
            this.unbind();

            this.parent.classList.add(this.config.classes.disabled);

            this.disabled = true;
        }
    }

    serialise() {
        this.serialize();
    }

    serialize() {
        return this._getData("data");
    }

    collapseAll() {
        const items = DOM.selectAll(`.${this.config.classes.item}`, this.parent);
        for (const item of items) {
            if (!item.classList.contains(this.config.classes.collapsed)) {
                const btn = item.querySelector(`.${this.config.classes.button}`);

                if (btn) {
                    this._collapseList(item, btn);
                }
            }
        }
    }

    expandAll() {
        const items = DOM.selectAll(`.${this.config.classes.item}`, this.parent);
        for (const item of items) {
            if (item.classList.contains(this.config.classes.collapsed)) {
                const btn = item.querySelector(`.${this.config.classes.button}`);

                if (btn) {
                    this._expandList(item, btn);
                }
            }
        }
    }

    add(element, parent) {

        if (!parent) {
            parent = this.parent;
        }

        this._nest(element);

        if (parent !== this.parent) {
            const listEl = DOM.select(this.config.nodes.list, parent);

            if (!listEl) {
                parent = this._makeParent(parent);
            } else {
                parent = listEl;
            }
        }

        parent.appendChild(element);

        this.update();
    }

    remove(element, removeChildElements = true) {

        const parentEl = element.closest(this.config.nodes.list);

        if (!removeChildElements) {
            const childList = element.querySelector(`.${this.config.classes.list}`);

            if (childList) {

                const childElements = DOM.children(childList, this.config.nodes.item);

                if (childElements.length) {
                    const frag = document.createDocumentFragment();

                    for (var i = childElements.length - 1; i >= 0; i--) {
                        const childElement = childElements[i];
                        frag.insertBefore(childElement, frag.firstElementChild);
                    }
                    parentEl.replaceChild(frag, element);
                }
            }
        } else {
            parentEl.removeChild(element);
        }

        this.update();
    }

    update() {
        this._getData("nodes");

        this.emit("update");
    }

    _nest(el) {
        const handle = el.querySelector(`.${this.config.classes.handle}`);

        const content = document.createElement("div");
        content.classList.add(this.config.classes.content);

        const nodes = el.childNodes;

        if (!handle) {
            content.classList.add(this.config.classes.handle);

            for (var i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                if (node.nodeName.toLowerCase() !== this.config.nodes.list) {
                    content.insertBefore(node, content.firstChild);
                }
            }
        } else {
            for (var i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                if (node !== handle && node.nodeName.toLowerCase() !== this.config.nodes.list) {
                    content.insertBefore(node, content.firstChild);
                }
            }
        }

        el.classList.add(this.config.classes.item);

        const list = el.querySelector(this.config.nodes.list);

        if (list) {
            el.insertBefore(content, list);
            const parent = this._makeParent(el);
            const items = DOM.children(parent, this.config.nodes.item);

            if (el.classList.contains(this.config.classes.collapsed)) {
                this._collapseList(el);
            }

            for (const i of items) {
                this._nest(i);
            }
        } else {
            el.appendChild(content);
        }
    }

    _isDisabled(item) {
        // item has the [data-nestable-disabled] attribute
        if ("nestableDisabled" in item.dataset) {
            if (!item.dataset.nestableDisabled.length || item.dataset.nestableDisabled !== "false") {
                return true;
            }
        }

        if (item.classList.contains(this.config.classes.disabled)) {
            return true;
        }

        const listEls = DOM.parents(item, `.${this.config.classes.disabled}`);

        if (listEls.length) {
            return true;
        }

        return false;
    }

    /**
    * Get event
    * @return {Object}
    */
    _getEvent(e) {
        if (this.touch) {
            if (e.type === "touchend") {
                return e.changedTouches[0];
            }
            return e.touches[0];
        }
        return e;
    }

    _onMouseDown(e) {

        const evt = this._getEvent(e);

        const button = e.target.closest(`.${this.config.classes.button}`);
        const item = e.target.closest(`.${this.config.classes.item}`);

        if (button) {
            return this._toggleList(item, button);
        }

        const handle = e.target.closest(`.${this.config.classes.handle}`);

        if (!handle) {
            return false;
        }

        if (item) {
            if (this._isDisabled(item)) {
                return false;
            }

            e.preventDefault();

            this.parent.classList.add(this.config.classes.moving);

            item.classList.add(this.config.classes.dragging);

            const rect = DOM.rect(item);

            this.origin = {
                x: evt.pageX,
                y: evt.pageY,
                original: {
                    x: evt.pageX,
                    y: evt.pageY,
                }
            };

            this.active = {
                maxDepth: false,
                collapsedParent: false,
                disabledParent: false,
                confinedParent: false,
                node: item,
                rect: rect,
                parent: false,
                axis: false,
            };

            // item has the [data-nestable-parent] attribute
            if ("nestableParent" in item.dataset) {
                const parent = document.getElementById(item.dataset.nestableParent);

                if (parent) {
                    this.active.parent = parent;
                }
            }

            // item has the [data-nestable-axis] attribute
            if ("nestableAxis" in item.dataset) {
                const axis = item.dataset.nestableAxis;
                if (axis === "x") {
                    this.active.axis = "x";
                } else if (axis === "y") {
                    this.active.axis = "y";
                }
            }

            this.placeholder.style.height = `${rect.height}px`;
            // this.placeholder.style.width = `${rect.width}px`;

            if (this.config.showPlaceholderOnMove) {
                this.placeholder.style.opacity = 0;
            }

            if (!this.container) {
                this.container = document.createElement(this.config.nodes.list);
                this.container.classList.add(this.config.classes.list);
                this.container.classList.add(this.config.classes.container);
                this.container.id = `nestable_${this.id}`;
            }

            this.container.style.left = `${rect.left}px`;
            this.container.style.top = `${rect.top}px`;
            this.container.style.height = `${rect.height}px`;
            this.container.style.width = `${rect.width}px`;

            item.parentNode.insertBefore(this.placeholder, item);

            document.body.appendChild(this.container);
            this.container.appendChild(item);

            this.newParent = false;

            this.dragDepth = 0;

            // total depth of dragging item
            const items = DOM.selectAll(this.config.nodes.item, item);
            for (let i = 0; i < items.length; i++) {
                const depth = DOM.parents(items[i], this.config.nodes.list).length - 1;
                if (depth > this.dragDepth) {
                    this.dragDepth = depth;
                }
            }

            this.emit("start", this.active);
        }
    }

    _onMouseMove(e) {
        if (this.active) {

            if (this.config.showPlaceholderOnMove) {
                this.placeholder.style.opacity = 1;
            }

            e = this._getEvent(e);

            let x = e.pageX - this.origin.x;
            let y = e.pageY - this.origin.y;

            if (e.pageY > this.last.y) {
                this.last.dirY = 1;
            } else if (e.pageY < this.last.y) {
                this.last.dirY = -1;
            }

            if (e.pageX > this.last.x) {
                this.last.dirX = 1;
            } else if (e.pageX < this.last.x) {
                this.last.dirX = -1;
            }

            let movement = false;

            if (Math.abs(x) > Math.abs(y)) {
                movement = "x";
            } else if (Math.abs(x) < Math.abs(y)) {
                movement = "y";
            }

            var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            const elements = document.elementsFromPoint(e.pageX, e.pageY - scrollTop);

            if (movement === "x" && this.active.axis !== "y") {
                if (this.last.dirX > 0 && x > this.config.threshold) { // moving right				

                    const prevEl = this.placeholder.previousElementSibling;

                    if (prevEl) {

                        if (prevEl.classList.contains(this.config.classes.collapsed)) {
                            if (!this.active.collapsedParent) {
                                this.emit("error.collapsed", this.active.node, prevEl);

                                this.active.collapsedParent = true;
                            }
                        } else {
                            const disabled = this._isDisabled(prevEl);

                            if (!disabled) {
                                const depth = DOM.parents(this.placeholder, this.config.nodes.list).length;
                                let allowNesting = depth + this.dragDepth <= this.config.maxDepth;
                                let parentEl = prevEl.querySelector(this.config.nodes.list);

                                if (allowNesting) {
                                    this.active.maxDepth = false;
                                    const oldParent = this.placeholder.closest(`.${this.config.classes.list}`);

                                    if (!parentEl) {
                                        parentEl = this._makeParent(prevEl);
                                    }

                                    this._moveElement(this.placeholder, {
                                        parent: parentEl,
                                        type: "appendChild",
                                    });

                                    this.emit("nest", parentEl, oldParent);

                                    this.origin.x = e.pageX;
                                } else {
                                    if (!this.active.maxDepth) {
                                        this.emit("error.maxdepth", this.active.node, this.config.maxDepth);

                                        this.active.maxDepth = true;
                                    }
                                }
                            } else {
                                if (!this.active.disabledParent) {
                                    this.emit("error.disabled");

                                    this.active.disabledParent = true;
                                }
                            }
                        }
                    }

                } else if (this.last.dirX < 0 && x < -this.config.threshold) { // moving left

                    this.active.maxDepth = false;
                    this.active.disabledParent = false;
                    this.active.collapsedParent = false;
                    // this.active.confinedParent = false;

                    const listEl = this.placeholder.closest(this.config.nodes.list);
                    const parentEl = listEl.closest(this.config.nodes.item);

                    if (parentEl &&
                        ((listEl.childElementCount > 1 && this.placeholder !== listEl.firstElementChild) || listEl.childElementCount < 2 && this.placeholder === listEl.firstElementChild)) {
                        const nextEl = parentEl.nextElementSibling;
                        const oldParent = this.placeholder.closest(`.${this.config.classes.list}`);

                        if (nextEl) {
                            const list = nextEl.closest(this.config.nodes.list);
                            this._moveElement(this.placeholder, {
                                parent: list,
                                type: "insertBefore",
                                sibling: nextEl
                            });

                            this.origin.x = e.pageX;
                        } else {
                            this._moveElement(this.placeholder, {
                                parent: parentEl.closest(this.config.nodes.list),
                                type: "appendChild",
                            });

                            this.origin.x = e.pageX;
                        }

                        this.emit("unnest", parentEl, oldParent);
                    }
                }
            } else {
                // check if we're over a valid item
                for (const element of elements) {
                    const moveY = element !== this.active.node &&
                        !this.active.node.contains(element) &&
                        element.classList.contains(this.config.classes.content) &&
                        this.active.axis !== "x";

                    if (moveY) {
                        const item = element.closest(`.${this.config.classes.item}`);

                        if (item) {
                            if (movement === "y") {
                                const childListEl = item.querySelector(this.config.nodes.list);
                                if (childListEl && !item.classList.contains(this.config.classes.collapsed)) { // item is parent
                                    if (this.last.dirY > 0) { // moving item down
                                        this._moveElement(this.placeholder, {
                                            parent: item.lastElementChild,
                                            type: "insertBefore",
                                            sibling: item.lastElementChild.firstElementChild,
                                            animatable: item.querySelector(`.${this.config.classes.content}`)
                                        });
                                    } else if (this.last.dirY < 0) { // moving item up
                                        this._moveElement(this.placeholder, {
                                            parent: item.parentNode,
                                            type: "insertBefore",
                                            sibling: item,
                                            animatable: item.querySelector(`.${this.config.classes.content}`)
                                        });
                                    }

                                    this.emit("reorder");
                                } else { // item is not a parent
                                    if (this.last.dirY > 0) { // moving item down
                                        const nextEl = item.nextElementSibling;

                                        if (nextEl) { // item has an item below it
                                            this._moveElement(this.placeholder, {
                                                parent: item.parentNode,
                                                type: "insertBefore",
                                                sibling: nextEl,
                                                animatable: item.querySelector(`.${this.config.classes.content}`)
                                            });
                                        } else { // item is last in list				
                                            this._moveElement(this.placeholder, {
                                                parent: item.closest(this.config.nodes.list),
                                                type: "appendChild",
                                                animatable: item.querySelector(`.${this.config.classes.content}`)
                                            });
                                        }
                                    } else if (this.last.dirY < 0) { // moving item up
                                        this._moveElement(this.placeholder, {
                                            parent: item.parentNode,
                                            type: "insertBefore",
                                            sibling: item,
                                            animatable: item.querySelector(`.${this.config.classes.content}`)
                                        });
                                    }

                                    this.emit("reorder");
                                }
                            }
                        }

                        const parentEl = item.closest(`.${this.config.classes.parent}`);

                        if (parentEl) {
                            if (parentEl !== this.parent) {
                                if (parentEl._nestable) {
                                    this.newParent = parentEl;
                                }
                            }
                        }
                    }
                }
            }

            this.placeholder.classList.toggle(this.config.classes.error,
                this.active.disabledParent ||
                this.active.maxDepth ||
                this.active.collapsedParent ||
                this.active.confinedParent);

            let mx = e.pageX - this.origin.original.x;
            let my = e.pageY - this.origin.original.y;

            // item movement is confined
            if (this.active.axis) {
                if (this.active.axis === "x") {
                    my = 0;
                } else if (this.active.axis === "y") {
                    mx = 0;
                }
            }

            this.container.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

            this.lastParent = this.placeholder.parentNode;

            this.emit("move", this.active);
        }

        this.last = {
            x: e.pageX,
            y: e.pageY
        };
    }

    _moveElement(el, type) {
        let ppos = false;
        let ipos = false;

        // prevent moving if item has disabled parents
        if (this._isDisabled(type.parent)) {
            return false;
        }

        // prevent moving if item is confined to parent with data-nestable-parent
        if (this.active.parent) {
            if (!DOM.parents(type.parent, `#${this.active.parent.id}`).includes(this.active.parent)) {
                if (!this.active.confinedParent) {

                    this.emit("error.confined", el, this.active.parent, type.parent);
                    this.active.confinedParent = true;
                }

                return false;
            }
        }

        let listEl = el.closest(this.config.nodes.list);

        // if animation is enabled, we need to get the original position of the element first
        if (this.config.animation > 0) {
            ppos = DOM.rect(this.placeholder);
            if (type.animatable) {
                ipos = DOM.rect(type.animatable)
            }
        }

        if (type.type === "insertBefore") {
            type.parent.insertBefore(el, type.sibling);
        } else if (type.type === "appendChild") {
            type.parent.appendChild(el);
        }

        if (!listEl.childElementCount) {
            this._unmakeParent(listEl.parentNode);
        }

        this.emit("order.change", this.active.node, type.parent, listEl);

        // animate the elements
        if (this.config.animation > 0) {
            this._animateElement(this.placeholder, ppos);

            if (type.animatable && ipos) {
                this._animateElement(type.animatable, ipos);
            }
        }
    }

    _animateElement(el, obj) {
        // Animate an element's change in position
        // caused by a change in the DOM order
        let css = el.style;

        // Get the node's positon AFTER the change
        let r = DOM.rect(el);

        // Calculate the difference in position
        let x = obj.left - r.left;
        let y = obj.top - r.top;

        // Move the node to it's original position before the DOM change
        css.transform = `translate3d(${x}px, ${y}px, 0px)`;
        // css.zIndex = 10000;

        // Trigger a repaint so the next bit works
        this._repaint(el);

        // Reset the transform, but add a transition so it's smooth
        css.transform = `translate3d(0px, 0px, 0px)`;
        css.transition = `transform ${this.config.animation}ms`;

        // Reset the style
        setTimeout(function() {
            // console.log("foo")
            // css.zIndex = "";
            css.transform = "";
            css.transition = "";
        }, this.config.animation);
    }

    _repaint(el) {
        return el.offsetHeight;
    }

    _onMouseUp(e) {
        if (this.active) {

            if (this.config.showPlaceholderOnMove) {
                this.placeholder.style.opacity = 0;
            }

            e = this._getEvent(e);

            const prect = DOM.rect(this.active.node);

            // this.active.node.removeAttribute("style");
            this.container.removeAttribute("style");

            this.parent.classList.remove(this.config.classes.moving);

            this.placeholder.parentNode.replaceChild(this.active.node, this.placeholder);

            this._animateElement(this.active.node, prect);

            this.placeholder.classList.remove(this.config.classes.error);
            this.active.node.classList.remove(this.config.classes.dragging);

            this.active = false;

            document.body.removeChild(this.container);

            this._getData();

            if (this.newParent) {
                this.newParent._nestable._getData();
            }

            this.emit("stop", this.data);

            this.update();
        }
    }

    _toggleList(item, btn) {
        if (!item.classList.contains(this.config.classes.collapsed)) {
            this._collapseList(item, btn);
        } else {
            this._expandList(item, btn);
        }
    }

    _collapseList(item, btn) {
        if (!btn) {
            btn = item.querySelector(`.${this.config.classes.button}`)
        }

        btn.textContent = this.config.expandButtonContent;
        item.classList.add(this.config.classes.collapsed);
    }

    _expandList(item, btn) {
        if (!btn) {
            btn = item.querySelector(`.${this.config.classes.button}`)
        }

        btn.textContent = this.config.collapseButtonContent;
        item.classList.remove(this.config.classes.collapsed);
    }

    _makeParent(el) {
        let parentEl = el.querySelector(this.config.nodes.list);

        if (!parentEl) {
            parentEl = document.createElement(this.config.nodes.list);
            parentEl.classList.add(this.config.classes.list);
            el.appendChild(parentEl);
        } else {
            parentEl.classList.add(this.config.classes.list);
        }

        const button = document.createElement("button");
        button.classList.add(this.config.classes.button);
        button.type = "button";
        button.textContent = this.config.collapseButtonContent;
        el.insertBefore(button, el.firstElementChild);

        return parentEl;
    }

    _unmakeParent(el) {
        const list = el.querySelector(this.config.nodes.list);
        const btn = el.querySelector("button");

        if (list) {
            el.removeChild(list);
        }

        if (btn) {
            el.removeChild(btn);
        }

        return
    }

    _getData(type = "nodes") {
        let data = [];

        const step = (level) => {
            const array = [];
            const items = DOM.children(level, this.config.nodes.item);

            items.forEach((li) => {
                const item = {};

                if (type === "nodes") {
                    item.node = li;
                } else {
                    item.data = Object.assign({}, li.dataset);

                    if (this.config.includeContent) {
                        const content = li.querySelector(`.${this.config.classes.content}`);

                        if (content) {
                            item.content = content.innerHTML;
                        }
                    }
                }

                const sub = li.querySelector(this.config.nodes.list);

                if (sub) {
                    item.children = step(sub);
                }

                array.push(item);
            });

            return array;
        };

        data = step(this.parent);

        if (type === "nodes") {
            this.data = data;
        }

        return data;
    }
}