function Observer(){
    this.listeners = [];
    this.params = null;
}

module.exports = Observer;

Observer.prototype.setParams = function(oParams){
    this.params = oParams;
};

Observer.prototype.register = function(oCallback){
    this.listeners.push(oCallback);
};

Observer.prototype.callListeners = function(){
    for (var i=0,len=this.listeners.length;i<len;i++){
        var stop = this.listeners[i](this.params);
        if (stop){
            i = len;
        }
    }
};