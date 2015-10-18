var KT = require('./kt_Kramtech');

function FloatText(oMapManager, oPosition, sText, oFont, iLifetime, bFloatUp){
    this.mapManager = oMapManager;
    this.position = oPosition;
    this.text = sText;
    this.lifetime = iLifetime;
    this.floatUp = bFloatUp;
    this.font = oFont;
    
    this.fixPosition();
    
    this.destroyed = false;
}

module.exports = FloatText;

FloatText.prototype.fixPosition = function(){
    this.position.x += 0.5;
    
    var width = KT.Sprite.getTextSpriteWidth(this.font, this.text);
    this.position.x -= (width / 2) / 32;
};

FloatText.prototype.draw = function(oCtx, oView){
    var vx = this.position.x - oView.x;
    var vy = this.position.y - oView.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > oView.width || vy > oView.height) return;
    
    KT.Canvas.drawSpriteText(oCtx, this.text, this.font, vx * 32, vy * 32);
};

FloatText.prototype.update = function(){
    if (--this.lifetime <= 0){ 
        this.destroyed = true;
        return; 
    }
    
    if (this.floatUp){
        this.position.y -= 0.05;
    }
};

