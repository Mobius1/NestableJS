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
        for (let i = 0; i < l; ++i){
            const child = children[i];
            if (child.matches(selector)){
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
        for ( ; elem && elem !== document; elem = elem.parentNode ) {
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
};

export default DOM;