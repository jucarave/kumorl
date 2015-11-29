var Utils = require('./kt_Utils');
var Vector2 = require('./kt_Vector2');

module.exports = {
    loadSprite: function(sFilename, iSprWidth, iSprHeight, oParams){
        if (!oParams) oParams = window.empt;
        var img = new Image();
        
        img.src = sFilename;
        img.sprWidth = iSprWidth;
        img.sprHeight = iSprHeight;
        img.ready = false;
        
        img.origin = (oParams.origin)? oParams.origin : Vector2.allocate(0, 0);
        
        Utils.addEvent(img, "load", function(){
            if (!img.sprWidth) img.sprWidth = img.width;
            if (!img.sprHeight) img.sprHeight = img.height;
            
           img.hNum = img.width / img.sprWidth; 
           img.vNum = img.height / img.sprHeight;
           img.ready = true;
           
           if (oParams.callback){
               oParams.callback(img);
           }
        });
        
        return img;
    },
    
    parseFont: function(oImg, oColors){
        var canvas = document.createElement("canvas");
        canvas.width = oImg.width;
        canvas.height = oImg.height;
        
        var ctx = canvas.getContext("2d");
        
        ctx.drawImage(oImg, 0, 0);
        
        var imgData = ctx.getImageData(0, 0, oImg.width, 1);
        var data = imgData.data;
        
        oImg.charasWidth = [];
        
        var width = 0;
        var baseColor, r, g, b;
        var i, len;
        for (i=0,len=oImg.width*4;i<len;i+=4){
            r = data[i];
            g = data[i + 1];
            b = data[i + 2];
            
            if (r == 255 && g == 0 && b == 255){
                width += 1;
            }else if (width > 0){
                oImg.charasWidth.push(width);
                width = 0;
            }
        }
        
        oImg.colors = {};
        for (var j=0,jlen=oColors.length;j<jlen;j++){
            baseColor = ctx.getImageData(0, 0, oImg.width, oImg.height);
            for (i=0,len=baseColor.data.length;i<len;i+=4){
                r = baseColor.data[i];
                g = baseColor.data[i + 1];
                b = baseColor.data[i + 2];
                
                if (r == 255 && g == 255 && b == 255){
                    baseColor.data[i] = oColors[j][1];
                    baseColor.data[i + 1] = oColors[j][2];
                    baseColor.data[i + 2] = oColors[j][3];
                }
            }
            
            var texture = document.createElement("canvas");
            texture.width = oImg.width;
            texture.height = oImg.height;
            texture.sprWidth = oImg.sprWidth;
            texture.sprHeight = oImg.sprHeight;
            texture.ready = true;
            texture.origin = oImg.origin;
            texture.offsetY = oImg.offsetY;
            texture.hNum = oImg.hNum; 
            texture.vNum = oImg.vNum;
            
            var tCtx = texture.getContext("2d");
            tCtx.putImageData(baseColor, 0, 0);
            
            oImg.colors[oColors[j][0]] = texture;
        }
    },
    
    loadFontSprite: function(sFilename, iSprWidth, iSprHeight, sCharactersList, oColors){
        var thus = this;
        var sprite = this.loadSprite(sFilename, iSprWidth, iSprHeight, {callback: function(oImg){ thus.parseFont(oImg, oColors); }});
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