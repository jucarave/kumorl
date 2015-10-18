var Utils = require('./kt_Utils')
var Vector2 = require('./kt_Vector2')

module.exports = {
    loadSprite: function(sFilename, iSprWidth, iSprHeight, oParams){
        if (!oParams) oParams = window.empt;
        var img = new Image();
        
        img.src = sFilename;
        img.sprWidth = iSprWidth;
        img.sprHeight = iSprHeight;
        img.ready = false;
        
        img.origin = (oParams.origin)? oParams.origin : new Vector2(0, 0);
        
        Utils.addEvent(img, "load", function(){
           img.hNum = img.width / img.sprWidth; 
           img.vNum = img.height / img.sprHeight;
           img.ready = true;
           
           if (oParams.callback){
               oParams.callback(img);
           }
        });
        
        return img;
    },
    
    parseFont: function(oImg){
        var canvas = document.createElement("canvas");
        canvas.width = oImg.width;
        canvas.height = oImg.height;
        
        var ctx = canvas.getContext("2d");
        
        ctx.drawImage(oImg, 0, 0);
        
        var imgData = ctx.getImageData(0, 0, oImg.width, oImg.height);
        var data = imgData.data;
        
        oImg.charasWidth = [];
        
        var width = 0;
        for (var i=0,len=oImg.width*4;i<len;i+=4){
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            
            if (r == 255 && g == 0 && b == 255){
                width += 1;
            }else if (width > 0){
                oImg.charasWidth.push(width);
                width = 0;
            }
        }
    },
    
    loadFontSprite: function(sFilename, iSprWidth, iSprHeight, sCharactersList){
        var thus = this;
        var sprite = this.loadSprite(sFilename, iSprWidth, iSprHeight, {callback: function(oImg){ thus.parseFont(oImg); }});
        sprite.charactersList = sCharactersList;
        sprite.offsetY = 1;
        
        return sprite;
    },
    
    getTextSpriteWidth: function(oFont, sText){
        var width = 0;
        for (var i=0,len=sText.length;i<len;i++){
            var chara = sText[i];
            var ind = oFont.charactersList.indexOf(chara);
            
            if (ind == -1) ind = 0;
            
            width += oFont.charasWidth[ind] + 1;
        }
        
        return width - 1;
    }
};