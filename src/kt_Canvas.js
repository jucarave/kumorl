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
        
        oCtx.drawImage(oSprite, 
                iHSubImg * iw, iVSubImg * ih, iw, ih,
                -ox, -oy, iw, ih);
                
        oCtx.restore();
    }
};