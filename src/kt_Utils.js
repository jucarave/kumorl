module.exports = {
    addEvent: function(elObj, sType, fCallback){
        if (elObj.addEventListener){
            elObj.addEventListener(sType, fCallback, false);
        }else if (elObj.attachEvent){
            elObj.attachEvent("on" + sType, fCallback);
        }
    },
    
    get: function(sId){
        return document.getElementById(sId);
    }
};