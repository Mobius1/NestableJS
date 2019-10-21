/*!
*
* NestableJS
* Copyright (c) 2019 Karl Saunders
* Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
* and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
*
* Version: 0.0.9
*
*/
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}};$jscomp.arrayIterator=function(a){return{next:$jscomp.arrayIteratorImpl(a)}};$jscomp.makeIterator=function(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):$jscomp.arrayIterator(a)};
var DOM={select:function(a,b){b=void 0===b?document:b;return b.querySelector(a)},selectAll:function(a,b){b=void 0===b?document:b;return b.querySelectorAll(a)},children:function(a,b){for(var c=[],d=a.children,e=d.length,f=0;f<e;++f){var l=d[f];l.matches(b)&&c.push(l)}return c},parents:function(a,b){for(var c=[];a&&a!==document;a=a.parentNode)b?a.matches(b)&&c.push(a):c.push(a);return c},rect:function(a){var b=window,c=void 0!==b.pageYOffset?b.pageYOffset:(document.documentElement||document.body.parentNode||
document.body).scrollTop;a=a.getBoundingClientRect();return{left:a.left+b.pageXOffset,top:a.top+c,height:a.height,width:a.width}}},Nestable=function(a,b){this.defaultConfig={threshold:40,animation:0,collapseButtonContent:"\u2013",expandButtonContent:"+",includeContent:!1,maxDepth:3,showPlaceholderOnMove:!1,nodes:{list:"ol",item:"li"},classes:{list:"nst-list",item:"nst-item",content:"nst-content",parent:"nst-parent",dragging:"nst-dragging",handle:"nst-handle",placeholder:"nst-placeholder",container:"nst-container",
button:"nst-button",collapsed:"nst-collapsed",disabled:"nst-disabled",error:"nst-error",moving:"nst-moving"}};this.config=Object.assign({},this.defaultConfig,b);b&&(b.nodes&&(this.config.nodes=Object.assign({},this.defaultConfig.nodes,b.nodes)),b.classes&&(this.config.classes=Object.assign({},this.defaultConfig.classes,b.classes)));this.parent="string"===typeof a?DOM.select(a):a;if(!this.parent)return console.error("Node ("+a+") not found.");if(this.parent._nestable)return console.error("There is already a Nestable instance active on this node.");
this.initialised=!1;this.disabled=!0;this.last={x:0,y:0};this.init()};
Nestable.prototype.init=function(a){var b=this;if(!this.initialised){this.touch="ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch;a&&(this.config=Object.assign({},this.defaultConfig,a));this.dragDepth=0;this.parent.classList.add(this.config.classes.list);this.parent.classList.add(this.config.classes.parent);a=DOM.children(this.parent,this.config.nodes.item);a=$jscomp.makeIterator(a);for(var c=a.next();!c.done;c=a.next())this._nest(c.value);this.placeholder=document.createElement(this.config.nodes.item);
this.placeholder.classList.add(this.config.classes.placeholder);this._getData();this.parent._nestable=this;window._nestableInstances?(window._nestableInstances+=1,this.id=window._nestableInstances):this.id=window._nestableInstances=1;this.enable();this._getData();setTimeout(function(){b.emit("init")},10);this.initialised=!0;if(this.config.data){var d=new XMLHttpRequest;d.responseType="json";d.open("GET",this.config.data,!0);d.onload=function(){b.load(d)};d.send(null)}}};
Nestable.prototype.destroy=function(){var a=this;if(this.initialised){this.initialised=!1;this.disable();this.parent.classList.remove(this.config.classes.list);this.parent.classList.remove(this.config.classes.parent);delete this.parent._nestable;window._nestableInstances&&--window._nestableInstances;var b=function(c){c.classList.remove(a.config.classes.item);c.classList.remove(a.config.classes.collapsed);var d=c.querySelector(a.config.nodes.list),e=c.querySelector("."+a.config.classes.content);c.querySelector("."+
a.config.classes.handle);var h=c.querySelector("."+a.config.classes.button);e.classList.contains(a.config.classes.handle);for(var g=document.createDocumentFragment(),k=e.childNodes.length-1;0<=k;k--)g.insertBefore(e.childNodes[k],g.firstChild);c.insertBefore(g,e);c.removeChild(e);if(d)for(d.classList.remove(a.config.classes.list),c.removeChild(h),c=DOM.children(d,a.config.nodes.item),c=$jscomp.makeIterator(c),d=c.next();!d.done;d=c.next())b(d.value)},c=DOM.children(this.parent,this.config.nodes.item);
c=$jscomp.makeIterator(c);for(var d=c.next();!d.done;d=c.next())b(d.value);this.emit("destroy",this.parent)}};
Nestable.prototype.bind=function(){this.events={start:this._onMouseDown.bind(this),move:this._onMouseMove.bind(this),end:this._onMouseUp.bind(this)};this.touch?(this.parent.addEventListener("touchstart",this.events.start,!1),document.addEventListener("touchmove",this.events.move,!1),document.addEventListener("touchend",this.events.end,!1),document.addEventListener("touchcancel",this.events.end,!1)):(this.parent.addEventListener("mousedown",this.events.start,!1),document.addEventListener("mousemove",
this.events.move,!1),document.addEventListener("mouseup",this.events.end,!1))};Nestable.prototype.unbind=function(){this.parent.removeEventListener("mousedown",this.events.start);document.removeEventListener("mousemove",this.events.move);document.removeEventListener("mouseup",this.events.end)};Nestable.prototype.on=function(a,b,c){"string"===typeof a?(this.listeners=this.listeners||{},this.listeners[a]=this.listeners[a]||[],this.listeners[a].push(b)):a.addEventListener(b,c,!1)};
Nestable.prototype.off=function(a,b,c){"string"===typeof a?(this.listeners=this.listeners||{},!1!==a in this.listeners&&this.listeners[a].splice(this.listeners[a].indexOf(b),1)):a.removeEventListener(b,c)};Nestable.prototype.emit=function(a){this.listeners=this.listeners||{};if(!1!==a in this.listeners)for(var b=0;b<this.listeners[a].length;b++)this.listeners[a][b].apply(this,Array.prototype.slice.call(arguments,1))};
Nestable.prototype.enable=function(){this.disabled&&(this.bind(),this.parent.classList.remove(this.config.classes.disabled),this.disabled=!1)};Nestable.prototype.disable=function(){this.disabled||(this.unbind(),this.parent.classList.add(this.config.classes.disabled),this.disabled=!0)};Nestable.prototype.serialise=function(){this.serialize()};Nestable.prototype.serialize=function(){return this._getData("data")};
Nestable.prototype.collapseAll=function(){var a=DOM.selectAll("."+this.config.classes.item,this.parent);a=$jscomp.makeIterator(a);for(var b=a.next();!b.done;b=a.next())if(b=b.value,!b.classList.contains(this.config.classes.collapsed)){var c=b.querySelector("."+this.config.classes.button);c&&this._collapseList(b,c)}};
Nestable.prototype.expandAll=function(){var a=DOM.selectAll("."+this.config.classes.item,this.parent);a=$jscomp.makeIterator(a);for(var b=a.next();!b.done;b=a.next())if(b=b.value,b.classList.contains(this.config.classes.collapsed)){var c=b.querySelector("."+this.config.classes.button);c&&this._expandList(b,c)}};Nestable.prototype.add=function(a,b){b||(b=this.parent);this._nest(a);if(b!==this.parent){var c=DOM.select(this.config.nodes.list,b);b=c?c:this._makeParent(b)}b.appendChild(a);this.update()};
Nestable.prototype.remove=function(a,b){b=void 0===b?!0:b;var c=a.closest(this.config.nodes.list);if(b)c.removeChild(a);else{var d=a.querySelector("."+this.config.classes.list);if(d&&(d=DOM.children(d,this.config.nodes.item),d.length)){for(var e=document.createDocumentFragment(),f=d.length-1;0<=f;f--)e.insertBefore(d[f],e.firstElementChild);c.replaceChild(e,a)}}this.update()};Nestable.prototype.removeAll=function(){for(var a=this.parent.children,b=a.length-1;0<=b;b--)this.parent.removeChild(a[b])};
Nestable.prototype.update=function(){this._getData("nodes");this.emit("update")};
Nestable.prototype._nest=function(a){var b=a.querySelector("."+this.config.classes.handle),c=document.createElement("div");c.classList.add(this.config.classes.content);var d=a.childNodes;if(b)for(f=d.length-1;0<=f;f--){var e=d[f];e!==b&&e.nodeName.toLowerCase()!==this.config.nodes.list&&c.insertBefore(e,c.firstChild)}else{c.classList.add(this.config.classes.handle);for(var f=d.length-1;0<=f;f--)b=d[f],b.nodeName.toLowerCase()!==this.config.nodes.list&&c.insertBefore(b,c.firstChild)}a.classList.add(this.config.classes.item);
if(d=a.querySelector(this.config.nodes.list))for(a.insertBefore(c,d),c=this._makeParent(a),c=DOM.children(c,this.config.nodes.item),a.classList.contains(this.config.classes.collapsed)&&this._collapseList(a),a=$jscomp.makeIterator(c),c=a.next();!c.done;c=a.next())this._nest(c.value);else a.appendChild(c)};
Nestable.prototype._isDisabled=function(a){return"nestableDisabled"in a.dataset&&(!a.dataset.nestableDisabled.length||"false"!==a.dataset.nestableDisabled)||a.classList.contains(this.config.classes.disabled)||DOM.parents(a,"."+this.config.classes.disabled).length?!0:!1};Nestable.prototype._getEvent=function(a){return this.touch?"touchend"===a.type?a.changedTouches[0]:a.touches[0]:a};
Nestable.prototype._onMouseDown=function(a){var b=this._getEvent(a),c=a.target.closest("."+this.config.classes.button),d=a.target.closest("."+this.config.classes.item);if(c)return this._toggleList(d,c);if(!a.target.closest("."+this.config.classes.handle))return!1;if(d){if(this._isDisabled(d))return!1;a.preventDefault();this.parent.classList.add(this.config.classes.moving);d.classList.add(this.config.classes.dragging);a=DOM.rect(d);this.origin={x:b.pageX,y:b.pageY,original:{x:b.pageX,y:b.pageY}};this.active=
{maxDepth:!1,collapsedParent:!1,disabledParent:!1,confinedParent:!1,node:d,rect:a,parent:!1,axis:!1};"nestableParent"in d.dataset&&(b=document.getElementById(d.dataset.nestableParent))&&(this.active.parent=b);"nestableAxis"in d.dataset&&(b=d.dataset.nestableAxis,"x"===b?this.active.axis="x":"y"===b&&(this.active.axis="y"));this.placeholder.style.height=a.height+"px";this.config.showPlaceholderOnMove&&(this.placeholder.style.opacity=0);this.container||(this.container=document.createElement(this.config.nodes.list),
this.container.classList.add(this.config.classes.list),this.container.classList.add(this.config.classes.container),this.container.id="nestable_"+this.id);this.container.style.left=a.left+"px";this.container.style.top=a.top+"px";this.container.style.height=a.height+"px";this.container.style.width=a.width+"px";d.parentNode.insertBefore(this.placeholder,d);document.body.appendChild(this.container);this.container.appendChild(d);this.newParent=!1;this.dragDepth=0;d=DOM.selectAll(this.config.nodes.item,
d);for(b=0;b<d.length;b++)a=DOM.parents(d[b],this.config.nodes.list).length-1,a>this.dragDepth&&(this.dragDepth=a);this.emit("start",this.active)}};
Nestable.prototype._onMouseMove=function(a){if(this.active){this.config.showPlaceholderOnMove&&(this.placeholder.style.opacity=1);a=this._getEvent(a);var b=a.pageX-this.origin.x,c=a.pageY-this.origin.y;a.pageY>this.last.y?this.last.dirY=1:a.pageY<this.last.y&&(this.last.dirY=-1);a.pageX>this.last.x?this.last.dirX=1:a.pageX<this.last.x&&(this.last.dirX=-1);var d=!1;Math.abs(b)>Math.abs(c)?d="x":Math.abs(b)<Math.abs(c)&&(d="y");c=document.elementsFromPoint(a.pageX,a.pageY-(void 0!==window.pageYOffset?
window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop));if("x"===d&&"y"!==this.active.axis)if(0<this.last.dirX&&b>this.config.threshold){if(d=this.placeholder.previousElementSibling)d.classList.contains(this.config.classes.collapsed)?this.active.collapsedParent||(this.emit("error.collapsed",this.active.node,d),this.active.collapsedParent=!0):this._isDisabled(d)?this.active.disabledParent||(this.emit("error.disabled"),this.active.disabledParent=!0):(c=DOM.parents(this.placeholder,
this.config.nodes.list).length+this.dragDepth<=this.config.maxDepth,b=d.querySelector(this.config.nodes.list),c?(this.active.maxDepth=!1,c=this.placeholder.closest("."+this.config.classes.list),b||(b=this._makeParent(d)),this._moveElement(this.placeholder,{parent:b,type:"appendChild"}),this.emit("nest",b,c),this.origin.x=a.pageX):this.active.maxDepth||(this.emit("error.maxdepth",this.active.node,this.config.maxDepth),this.active.maxDepth=!0))}else{if(0>this.last.dirX&&b<-this.config.threshold&&(this.active.maxDepth=
!1,this.active.disabledParent=!1,this.active.collapsedParent=!1,b=this.placeholder.closest(this.config.nodes.list),(d=b.closest(this.config.nodes.item))&&(1<b.childElementCount&&this.placeholder!==b.firstElementChild||2>b.childElementCount&&this.placeholder===b.firstElementChild))){b=d.nextElementSibling;c=this.placeholder.closest("."+this.config.classes.list);if(b){var e=b.closest(this.config.nodes.list);this._moveElement(this.placeholder,{parent:e,type:"insertBefore",sibling:b})}else this._moveElement(this.placeholder,
{parent:d.closest(this.config.nodes.list),type:"appendChild"});this.origin.x=a.pageX;this.emit("unnest",d,c)}}else for(b=$jscomp.makeIterator(c),c=b.next();!c.done;c=b.next())c=c.value,c!==this.active.node&&!this.active.node.contains(c)&&c.classList.contains(this.config.classes.content)&&"x"!==this.active.axis&&((c=c.closest("."+this.config.classes.item))&&"y"===d&&(c.querySelector(this.config.nodes.list)&&!c.classList.contains(this.config.classes.collapsed)?0<this.last.dirY?this._moveElement(this.placeholder,
{parent:c.lastElementChild,type:"insertBefore",sibling:c.lastElementChild.firstElementChild,animatable:c.querySelector("."+this.config.classes.content)}):0>this.last.dirY&&this._moveElement(this.placeholder,{parent:c.parentNode,type:"insertBefore",sibling:c,animatable:c.querySelector("."+this.config.classes.content)}):0<this.last.dirY?(e=c.nextElementSibling)?this._moveElement(this.placeholder,{parent:c.parentNode,type:"insertBefore",sibling:e,animatable:c.querySelector("."+this.config.classes.content)}):
this._moveElement(this.placeholder,{parent:c.closest(this.config.nodes.list),type:"appendChild",animatable:c.querySelector("."+this.config.classes.content)}):0>this.last.dirY&&this._moveElement(this.placeholder,{parent:c.parentNode,type:"insertBefore",sibling:c,animatable:c.querySelector("."+this.config.classes.content)}),this.emit("reorder")),(c=c.closest("."+this.config.classes.parent))&&c!==this.parent&&c._nestable&&(this.newParent=c));this.placeholder.classList.toggle(this.config.classes.error,
this.active.disabledParent||this.active.maxDepth||this.active.collapsedParent||this.active.confinedParent);d=a.pageX-this.origin.original.x;b=a.pageY-this.origin.original.y;this.active.axis&&("x"===this.active.axis?b=0:"y"===this.active.axis&&(d=0));this.container.style.transform="translate3d("+d+"px, "+b+"px, 0)";this.lastParent=this.placeholder.parentNode;this.emit("move",this.active)}this.last={x:a.pageX,y:a.pageY}};
Nestable.prototype._moveElement=function(a,b){var c=!1,d=!1;if(this._isDisabled(b.parent))return!1;if(this.active.parent&&!DOM.parents(b.parent,"#"+this.active.parent.id).includes(this.active.parent))return this.active.confinedParent||(this.emit("error.confined",a,this.active.parent,b.parent),this.active.confinedParent=!0),!1;var e=a.closest(this.config.nodes.list);0<this.config.animation&&(c=DOM.rect(this.placeholder),b.animatable&&(d=DOM.rect(b.animatable)));"insertBefore"===b.type?b.parent.insertBefore(a,
b.sibling):"appendChild"===b.type&&b.parent.appendChild(a);e.childElementCount||this._unmakeParent(e.parentNode);this.emit("order.change",this.active.node,b.parent,e);0<this.config.animation&&(this._animateElement(this.placeholder,c),b.animatable&&d&&this._animateElement(b.animatable,d))};
Nestable.prototype._animateElement=function(a,b){var c=a.style,d=DOM.rect(a);c.transform="translate3d("+(b.left-d.left)+"px, "+(b.top-d.top)+"px, 0px)";this._repaint(a);c.transform="translate3d(0px, 0px, 0px)";c.transition="transform "+this.config.animation+"ms";setTimeout(function(){c.transform="";c.transition=""},this.config.animation)};Nestable.prototype._repaint=function(a){return a.offsetHeight};
Nestable.prototype._onMouseUp=function(a){this.active&&(this.config.showPlaceholderOnMove&&(this.placeholder.style.opacity=0),this._getEvent(a),a=DOM.rect(this.active.node),this.container.removeAttribute("style"),this.parent.classList.remove(this.config.classes.moving),this.placeholder.parentNode.replaceChild(this.active.node,this.placeholder),this._animateElement(this.active.node,a),this.placeholder.classList.remove(this.config.classes.error),this.active.node.classList.remove(this.config.classes.dragging),
this.active=!1,document.body.removeChild(this.container),this._getData(),this.newParent&&this.newParent._nestable._getData(),this.emit("stop",this.data),this.update())};Nestable.prototype._toggleList=function(a,b){a.classList.contains(this.config.classes.collapsed)?this._expandList(a,b):this._collapseList(a,b)};Nestable.prototype._collapseList=function(a,b){b||(b=a.querySelector("."+this.config.classes.button));b.textContent=this.config.expandButtonContent;a.classList.add(this.config.classes.collapsed)};
Nestable.prototype._expandList=function(a,b){b||(b=a.querySelector("."+this.config.classes.button));b.textContent=this.config.collapseButtonContent;a.classList.remove(this.config.classes.collapsed)};
Nestable.prototype._makeParent=function(a){var b=a.querySelector(this.config.nodes.list);b?b.classList.add(this.config.classes.list):(b=document.createElement(this.config.nodes.list),b.classList.add(this.config.classes.list),a.appendChild(b));var c=document.createElement("button");c.classList.add(this.config.classes.button);c.type="button";c.textContent=this.config.collapseButtonContent;a.insertBefore(c,a.firstElementChild);return b};
Nestable.prototype._unmakeParent=function(a){var b=a.querySelector(this.config.nodes.list),c=a.querySelector("button");b&&a.removeChild(b);c&&a.removeChild(c)};
Nestable.prototype._getData=function(a){var b=this;a=void 0===a?"nodes":a;var c=[],d=function(c){var e=[];DOM.children(c,b.config.nodes.item).forEach(function(c){var f={};if("nodes"===a)f.node=c;else if(f.data=Object.assign({},c.dataset),b.config.includeContent){var g=c.querySelector("."+b.config.classes.content);g&&(f.content=g.innerHTML)}if(c=c.querySelector(b.config.nodes.list))f.children=d(c);e.push(f)});return e};c=d(this.parent);"nodes"===a&&(this.data=c);return c};
Nestable.prototype.load=function(a){var b=this;this.removeAll();"response"in a&&(a=a.response);var c=function(a){var d=document.createElement(b.config.nodes.item);d.textContent=a.content;if(a.children){var e=document.createElement(b.config.nodes.list);d.appendChild(e);a=$jscomp.makeIterator(a.children);for(var h=a.next();!h.done;h=a.next())e.appendChild(c(h.value))}return d};a=$jscomp.makeIterator(a);for(var d=a.next();!d.done;d=a.next())this._nest(this.parent.appendChild(c(d.value)));this.emit("loaded")};