import DOM from "./utils/DOM.js";
import Emitter from "./utils/Emitter.js";

export default class Nestable extends Emitter {
    constructor(list, options) {
		
        super();
		
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
			
            onInit: () => {},
            onChange: () => {},
        };
		
        this.config = Object.assign({}, this.defaultConfig, options);
		
        this.parent = typeof list === "string" ? DOM.select(list) : list;

        if ( !this.parent ) {
            return console.error(`Node (${list}) not found.`);
        }			

        if ( this.parent._nestable ) {
            return console.error("There is already a Nestable instance active on this node.");
        }		
		
        this.initialised = false;
        this.disabled = true;
        this.last = { x: 0, y: 0 };
		
        this.init();
    }
	
    init(options) {
        if ( !this.initialised ) {
			
            this.touch =
            "ontouchstart" in window ||
            (window.DocumentTouch && document instanceof DocumentTouch);
			
            if ( options ) {
                this.config = Object.assign({}, this.defaultConfig, options);
            }
		
            this.dragDepth = 0;			
			
            this.parent.classList.add(this.config.classes.list);
            this.parent.classList.add(this.config.classes.parent);


            const items = DOM.children(this.parent, this.config.nodes.item);
            for ( const item of items ) {
                this._nest(item);
            }

            this.placeholder = document.createElement(this.config.nodes.item);
            this.placeholder.classList.add(this.config.classes.placeholder);

            this._getData();

            this.parent._nestable = this;

            if ( !window._nestableInstances ) {
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
		
        if ( this.initialised ) {
			
            this.initialised = false;
		
            this.disable();

            this.parent.classList.remove(this.config.classes.list);
            this.parent.classList.remove(this.config.classes.parent);
			
            delete(this.parent._nestable);

            if ( window._nestableInstances ) {
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

                if ( listEl ) {
                    listEl.classList.remove(this.config.classes.list);
                    item.removeChild(buttonEl);
					
                    const items = DOM.children(listEl, this.config.nodes.item);

                    for ( const item of items ) {
                        destroyItem(item);
                    }
                }
            };
			
            const items = DOM.children(this.parent, this.config.nodes.item);
			
            for ( const item of items ) {
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
        if ( this.disabled ) {
            this.bind();
			
            this.parent.classList.remove(this.config.classes.disabled);
			
            this.disabled = false;
        }
    }
	
    disable() {
        if ( !this.disabled ) {
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
        for ( const item of items ) {
            if ( !item.classList.contains(this.config.classes.collapsed) ) {
                const btn = item.querySelector(`.${this.config.classes.button}`);
				
                if ( btn ) {
                    this._collapseList(item, btn);
                }
            }
        }
    }
	
    expandAll() {
        const items = DOM.selectAll(`.${this.config.classes.item}`, this.parent);
        for ( const item of items ) {
            if ( item.classList.contains(this.config.classes.collapsed) ) {
                const btn = item.querySelector(`.${this.config.classes.button}`);
				
                if ( btn ) {
                    this._expandList(item, btn);
                }
            }
        }
    }
	
    add(element, parent) {
		
        if ( !parent ) {
            parent = this.parent;
        }
		
        this._nest(element);
		
        if ( parent !== this.parent ) {
            const listEl = DOM.select(this.config.nodes.list, parent);
			
            if ( !listEl ) {
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
		
        if ( !removeChildElements ) {
            const childList = element.querySelector(`.${this.config.classes.list}`);

            if ( childList ) {
				
                const childElements = DOM.children(childList, this.config.nodes.item);
				
                if ( childElements.length ) {
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

        if ( !handle ) {
            content.classList.add(this.config.classes.handle);

            for (var i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                if ( node.nodeName.toLowerCase() !== this.config.nodes.list ) {
                    content.insertBefore(node, content.firstChild);
                }
            }				
        } else {
            for (var i = nodes.length - 1; i >= 0; i--) {
                const node = nodes[i];
                if ( node !== handle && node.nodeName.toLowerCase() !== this.config.nodes.list ) {
                    content.insertBefore(node, content.firstChild);
                }
            }	
        }

        el.classList.add(this.config.classes.item);

        const list = el.querySelector(this.config.nodes.list);

        if ( list ) {
            el.insertBefore(content, list);
            const parent = this._makeParent(el);
            const items = DOM.children(parent, this.config.nodes.item);

            if ( el.classList.contains(this.config.classes.collapsed) ) {
                this._collapseList(el);
            }

            for ( const i of items ) {
                this._nest(i);
            }
        } else {
            el.appendChild(content);
        }		
    }
	
    _isDisabled(item) {
        let disabled = false;
		
        if ( item.classList.contains(this.config.classes.disabled) ) {
            disabled = true;
        }
		
        const listEls = DOM.parents(item, `.${this.config.classes.disabled}`);
		
        if ( listEls.length ) {
            disabled = true;
        }
		
        return disabled;
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
		
        if ( button ) {
            return this._toggleList(item, button);
        }
		
        const handle = e.target.closest(`.${this.config.classes.handle}`);
		
        if ( !handle ) {
            return false;
        }
		
        if ( item ) {
            if ( this._isDisabled(item) ) {
                return false;
            }
			
            e.preventDefault();
			
            this.parent.classList.add(this.config.classes.moving);

            item.classList.add(this.config.classes.dragging);
			
            const rect = DOM.rect(item);
			
            this.origin = {
                x: evt.pageX, y: evt.pageY,
                original: { x: evt.pageX, y: evt.pageY, }
            };

            this.active = {
                maxDepth: false,
                collapsedParent: false,
                disabledParent: false,
                confinedParent: false,
                node: item, rect: rect,
                parent: false,
            };
			
			
            if ( "nestableParent" in item.dataset ) {
                const parent = document.getElementById(item.dataset.nestableParent);
				
                if ( parent ) {
                    this.active.parent = parent;
                }
            }		
			
            this.placeholder.style.height = `${rect.height}px`;
            // this.placeholder.style.width = `${rect.width}px`;
			
            if ( this.config.showPlaceholderOnMove ) {
                this.placeholder.style.opacity = 0;
            }
			
            if ( !this.container ) {
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
			
            // console.log(DOM.parents(item, this.config.nodes.list))
        }
    }
	
    _onMouseMove(e) {
        if ( this.active ) {
			
            if ( this.config.showPlaceholderOnMove ) {
                this.placeholder.style.opacity = 1;
            }
			
            e = this._getEvent(e);
			
            let x = e.pageX - this.origin.x;
            let y = e.pageY - this.origin.y;
			
            if ( e.pageY > this.last.y ) {
                this.last.dirY = 1;
            } else if ( e.pageY < this.last.y ) {
                this.last.dirY = -1;
            }
			
            if ( e.pageX > this.last.x ) {
                this.last.dirX = 1;
            } else if ( e.pageX < this.last.x ) {
                this.last.dirX = -1;
            }		
			
            let movement = false;
			
            if ( Math.abs(x) > Math.abs(y) ) {
                movement = "x";
            } else if ( Math.abs(x) < Math.abs(y) ) {
                movement = "y";
            }
			
            var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            const elements = document.elementsFromPoint(e.pageX, e.pageY - scrollTop);
			
            if ( movement === "x" ) {
                if ( this.last.dirX > 0 && x > this.config.threshold ) { // moving right				
					
                    const prevEl = this.placeholder.previousElementSibling;
					
                    if ( prevEl ) {
						
                        if ( prevEl.classList.contains(this.config.classes.collapsed) ) {
                            if ( !this.active.collapsedParent ) {
                                this.emit("move.collapsed", this.active.node, prevEl);

                                this.active.collapsedParent = true;
                            }
                        } else {
                            const disabled = this._isDisabled(prevEl);

                            if ( !disabled ) {
                                const depth = DOM.parents(this.placeholder, this.config.nodes.list).length;
                                let allowNesting = depth + this.dragDepth <= this.config.maxDepth;							
                                let parentEl = prevEl.querySelector(this.config.nodes.list);					

                                if ( allowNesting ) {
                                    this.active.maxDepth = false;
                                    if ( !parentEl ) {
                                        parentEl = this._makeParent(prevEl);
                                    }

                                    this._moveElement(this.placeholder, {
                                        parent: parentEl,
                                        type: "appendChild",
                                    });

                                    this.origin.x = e.pageX;
                                } else {
                                    if ( !this.active.maxDepth ) {
                                        this.emit("move.maxdepth", this.active.node, this.config.maxDepth);

                                        this.active.maxDepth = true;
                                    }
                                }
                            } else {
                                if ( !this.active.disabledParent ) {
                                    this.emit("move.disabled");

                                    this.active.disabledParent = true;
                                }
                            }
                        }
                    }
					
                } else if ( this.last.dirX < 0 && x < -this.config.threshold ) { // moving left
					
                    this.active.maxDepth = false;
                    this.active.disabledParent = false;
                    this.active.collapsedParent = false;
                    // this.active.confinedParent = false;
					
                    const listEl = this.placeholder.closest(this.config.nodes.list);
                    const parentEl = listEl.closest(this.config.nodes.item);

                    if ( parentEl &&
                            ((listEl.childElementCount > 1 && this.placeholder !== listEl.firstElementChild) || listEl.childElementCount < 2 && this.placeholder === listEl.firstElementChild) ) {
                        const nextEl = parentEl.nextElementSibling;

                        if ( nextEl ) {
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
                    }
                }
            } else {
                // check if we're over a valid item
                for ( const element of elements ) {
                    if ( element !== this.active.node &&
                            !this.active.node.contains(element) && 
                            element.classList.contains(this.config.classes.content)  ) {
                        const item = element.closest(`.${this.config.classes.item}`);

                        if ( item ) {
                            if ( movement === "y" ) {
                                const childListEl = item.querySelector(this.config.nodes.list);
                                if ( childListEl && !item.classList.contains(this.config.classes.collapsed) ) { // item is parent
                                    if ( this.last.dirY > 0 ) { // moving item down
                                        this._moveElement(this.placeholder, {
                                            parent: item.lastElementChild,
                                            type: "insertBefore",
                                            sibling: item.lastElementChild.firstElementChild,
                                            animatable: item.querySelector(`.${this.config.classes.content}`)
                                        });			
                                    } else if ( this.last.dirY < 0 ) { // moving item up
                                        this._moveElement(this.placeholder, {
                                            parent: item.parentNode,
                                            type: "insertBefore",
                                            sibling: item,
                                            animatable: item.querySelector(`.${this.config.classes.content}`)
                                        });						
                                    }									
                                } else { // item is not a parent
                                    if ( this.last.dirY > 0 ) { // moving item down
                                        const nextEl = item.nextElementSibling;

                                        if ( nextEl ) { // item has an item below it
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
                                    } else if ( this.last.dirY < 0 ) { // moving item up
                                        this._moveElement(this.placeholder, {
                                            parent: item.parentNode,
                                            type: "insertBefore",
                                            sibling: item,
                                            animatable: item.querySelector(`.${this.config.classes.content}`)
                                        });								
                                    }
                                }
                            }
                        }
						
                        const parentEl = item.closest(`.${this.config.classes.parent}`);
						
                        if ( parentEl ) {
                            if ( parentEl !== this.parent ) {
                                if ( parentEl._nestable ) {
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
			
            this.container.style.transform = `translate3d(${e.pageX - this.origin.original.x}px, ${e.pageY - this.origin.original.y}px, 0)`;
			
            this.lastParent = this.placeholder.parentNode;
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
        if ( this._isDisabled(type.parent) ) {
            return false;
        }

        // prevent moving if item is confined to parent with data-nestable-parent
        if ( this.active.parent ) {
            if ( !DOM.parents(type.parent, `#${this.active.parent.id}`).includes(this.active.parent) ) {
                if ( !this.active.confinedParent ) {
					
                    this.emit("move.confined", el, this.active.parent, type.parent);
                    this.active.confinedParent  = true;
                }
				
                return false;
            }
        }
		
        let listEl = el.closest(this.config.nodes.list);

        // if animation is enabled, we need to get the original position of the element first
        if ( this.config.animation > 0 ) {
            ppos = DOM.rect(this.placeholder);
            if ( type.animatable ) {
                ipos = DOM.rect(type.animatable)
            }
        }
		
        if ( type.type === "insertBefore" ) {
            type.parent.insertBefore(el, type.sibling);			
        } else if ( type.type === "appendChild" ) {
            type.parent.appendChild(el);
        }
		
        if ( !listEl.childElementCount ) {
            this._unmakeParent(listEl.parentNode);
        }
		
        this.emit("order.change", this.active.node, type.parent, listEl);
		
            // animate the elements
        if ( this.config.animation > 0 ) {
            this._animateElement(this.placeholder, ppos);
			
            if ( type.animatable && ipos ) {
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
        el.offsetHeight;

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
	
    _onMouseUp(e) {
        if ( this.active ) {
			
            if ( this.config.showPlaceholderOnMove ) {
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
			
            if ( this.newParent ) {
                this.newParent._nestable._getData();
            }
			
            this.emit("stop", this.data);
			
            this.update();
        }
    }
	
    _toggleList(item, btn) {
        if ( !item.classList.contains(this.config.classes.collapsed) ) {
            this._collapseList(item, btn);
        } else {
            this._expandList(item, btn);
        }
    }
	
    _collapseList(item, btn) {
        if ( !btn ) {
            btn = item.querySelector(`.${this.config.classes.button}`)
        }

        btn.textContent = this.config.expandButtonContent;
        item.classList.add(this.config.classes.collapsed);
    }
	
    _expandList(item, btn) {
        if ( !btn ) {
            btn = item.querySelector(`.${this.config.classes.button}`)
        }

        btn.textContent = this.config.collapseButtonContent;
        item.classList.remove(this.config.classes.collapsed);
    }	
	
    _makeParent(el) {
        let parentEl = el.querySelector(this.config.nodes.list);
		
        if ( !parentEl ) {
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
		
        if ( list ) {
            el.removeChild(list);
        }
		
        if ( btn ) {
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
				
                if ( type === "nodes" ) {
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
		
        if ( type === "nodes" ) {
            this.data = data;
        }
		
        return data;
    }
}