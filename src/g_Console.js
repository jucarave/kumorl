var KT = require('./kt_Kramtech');

function Console(oGame, oFont, iWidth, iHeight, iMaxMessages){
    this.game = oGame;
    this.messages = [];
    this.font = oFont;
    this.maxMessages = iMaxMessages;
    
    this.canvas = document.createElement("canvas");
    this.canvas.width = iWidth;
    this.canvas.height = iHeight;
    
    this.ctx = this.canvas.getContext("2d");
    this.ctx.width = iWidth;
    this.ctx.height = iHeight;
}

module.exports = Console;

Console.prototype.addMessage = function(sText){
    this.messages.push(sText);
    
    if (this.messages.length > this.maxMessages){
        this.messages.splice(0, 1);
    }
    
    this.preRender();
};

Console.prototype.preRender = function(){
    var Canvas = KT.Canvas;
    Canvas.clearCanvas(this.ctx);
    
    for (var i=0,len=this.messages.length;i<len;i++){
        var m = this.messages[i];
        
        Canvas.drawSpriteText(this.ctx, m, this.font, 0, i * this.font.height);
    }
};

Console.prototype.render = function(oCtx, x, y){
    oCtx.drawImage(this.canvas, x, y);
};