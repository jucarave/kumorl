module.exports = {
    addEvent: function(obj, type, callback){
        if (obj.addEventListener){
            obj.addEventListener(type, callback, false);
        }else if (obj.attachEvent){
            obj.attachEvent("on" + type, callback);
        }
    },
    
    get: function(id){
        return document.getElementById(id);
    }
};