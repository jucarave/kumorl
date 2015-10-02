var Utils = require('./kt_Utils')

module.exports = {
    loadSprite: function(sFilename, iSprWidth, iSprHeight){
        var img = new Image();
        
        img.src = sFilename;
        img.sprWidth = iSprWidth;
        img.sprHeight = iSprHeight;
        img.ready = false;
        
        Utils.addEvent(img, "load", function(){
           img.hNum = img.width / img.sprWidth; 
           img.vNum = img.height / img.sprHeight;
           img.ready = true;
        });
        
        return img;
    }
};