var KT = require('./kt_Kramtech');

function FloatText(){
    this.mapManager = null;
    this.position = KT.Vector2.allocate(0, 0);
    this.text = '';
    this.lifetime = 0;
    this.floatUp = false;
    this.font = null;
    
    this.destroyed = false;
    this._floattext = true;
}

module.exports = FloatText;

FloatText.memLoc = [];
FloatText.preAllocate = function(iAmount){
    FloatText.memLoc = [];
    
    for (var i=0;i<iAmount;i++){
        FloatText.memLoc.push(new FloatText());
    }
};

FloatText.allocate = function(oMapManager, x, y, sText, oFont, iLifetime, bFloatUp){
    if (FloatText.memLoc.length == 0) throw "Out of FloatText instances.";
    
    var text = FloatText.memLoc.pop();
    text.init(oMapManager, x, y, sText, oFont, iLifetime, bFloatUp);
    
    return text;
};

FloatText.free = function(oFloatText){
    FloatText.memLoc.push(oFloatText);
};

FloatText.prototype.init = function(oMapManager, x, y, sText, oFont, iLifetime, bFloatUp){
    this.mapManager = oMapManager;
    this.position.set(x, y);
    this.text = sText;
    this.lifetime = iLifetime;
    this.floatUp = bFloatUp;
    this.font = oFont;
    
    this.fixPosition();
    
    this.destroyed = false;
};

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

