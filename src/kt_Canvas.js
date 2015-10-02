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
    
    clearCanvas: function(oCtx){
        oCtx.clearRect(0, 0, oCtx.width, oCtx.height);
    },
    
    drawSprite: function(oCtx, oSprite, x, y, iHSubImg, iVSubImg){
        if (!oSprite.ready) return;
        
        iHSubImg = iHSubImg << 0;
        iVSubImg = iVSubImg << 0;
        
        var iw = oSprite.sprWidth;
        var ih = oSprite.sprHeight;
        
        oCtx.drawImage(oSprite, 
                iHSubImg * iw, iVSubImg * ih, iw, ih,
                x, y, iw, ih);
    }
};