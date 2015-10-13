module.exports = {
    createCanvas: function(iWidth, iHeight, elContainer){
        var canvas = document.createElement("canvas");
        
        canvas.width = iWidth;
        canvas.height = iHeight;
        
        if (elContainer) elContainer.appendChild(canvas);
        
        return canvas;
    },
    
    get2DContext: function(elCanvas){
        if (!elCanvas || !elCanvas.getContext) return null;
        
        var ctx = elCanvas.getContext("2d");
        
        ctx.width = elCanvas.width;
        ctx.height = elCanvas.height;
        
        return ctx;
    },
    
    clearCanvas: function(oCtx, sColor){
        if (sColor){
            var oldC = oCtx.fillStyle;
            
            oCtx.fillStyle = sColor;
            oCtx.fillRect(0, 0, oCtx.width, oCtx.height);
            oCtx.fillStyle = oldC;
        }else{
            oCtx.clearRect(0, 0, oCtx.width, oCtx.height);
        }
    },
    
    drawSprite: function(oCtx, oSprite, x, y, iHSubImg, iVSubImg, params){
        if (!oSprite.ready) return;
        if (!params) params = window.empt;
        
        iHSubImg = iHSubImg << 0;
        iVSubImg = iVSubImg << 0;
        
        var iw = oSprite.sprWidth;
        var ih = oSprite.sprHeight;
        
        var ox = oSprite.origin.x;
        var oy = oSprite.origin.y;
        
        oCtx.save();
        
        oCtx.translate(x + ox, y + oy);
        if (params.scale){ 
            oCtx.scale(params.scale.x, params.scale.y);
        }else{
            oCtx.scale(1, 1);
        }
        
        var ofy = 0;
        if (oSprite.offsetY) ofy = oSprite.offsetY;
        
        oCtx.drawImage(oSprite, 
                iHSubImg * iw, iVSubImg * ih + ofy, iw, ih - ofy,
                -ox, -oy, iw, ih - ofy);
                
        oCtx.restore();
    },
    
    drawSpriteText: function(oCtx, sText, oFont, x, y){
        if (!oFont.ready) return;
        
        var w = oFont.sprWidth;
        var xx = x;
        
        for (var i=0,len=sText.length;i<len;i++){
            var chara = sText[i];
            var ind = oFont.charactersList.indexOf(chara);
            
            if (ind == -1) ind = 0;
            
            this.drawSprite(oCtx, oFont, xx, y, ind, 0);
            xx += oFont.charasWidth[ind] + 1;
        }
    }
};