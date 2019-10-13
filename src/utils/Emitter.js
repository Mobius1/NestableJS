export default class Emitter {
	
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
}