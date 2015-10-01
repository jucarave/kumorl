module.exports = {
    createCanvas: function(width, height, container){
        var canvas = document.createElement("canvas");
        
        canvas.width = width;
        canvas.height = height;
        
        if (container) container.appendChild(canvas);
        
        return canvas;
    },
    
    get2DContext: function(canvas){
        if (!canvas || !canvas.getContext) return null;
        
        return canvas.getContext("2d");
    }
};