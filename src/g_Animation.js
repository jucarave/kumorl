var KT = require('./kt_Kramtech');

function Animation(){
    this.mapManager = null;
    this.sprite = null;
    this.position = KT.Vector2.allocate(0, 0);
    
    this.onAnimationEnd = null;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 2;
    
    this.destroyed = false;
    this._animation = true;
}

module.exports = Animation;

Animation.memLoc = [];
Animation.preAllocate = function(iAmount){
    Animation.memLoc = [];
    
    for (var i=0;i<iAmount;i++){
        Animation.memLoc.push(new Animation());
    }
};

Animation.allocate = function(oMapManager, oSprite, x, y, fOnAnimationEnd){
    if (Animation.memLoc.length == 0) throw "Out of Animation instances.";
    
    var animation = Animation.memLoc.pop();
    animation.init(oMapManager, oSprite, x, y, fOnAnimationEnd);
    
    return animation;
};

Animation.free = function(oFloatText){
    Animation.memLoc.push(oFloatText);
};

Animation.prototype.init = function(oMapManager, oSprite, x, y, fOnAnimationEnd){
    this.mapManager = oMapManager;
    this.sprite = oSprite;
    this.position.set(x, y);
    
    this.onAnimationEnd = fOnAnimationEnd;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 2;
    
    this.destroyed = false;
};

Animation.prototype.draw = function(oCtx, view){
    if (this.destroyed) return;
    
    var vx = this.position.x - view.x;
    var vy = this.position.y - view.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > view.width || vy > view.height) return;
    
    KT.Canvas.drawSprite(oCtx, this.sprite, vx * 32, (vy * 32), this.imageIndex, 0);
};

Animation.prototype.update = function(){
    if (!this.moving){
        this.imageIndex += this.imageSpeed;
        if (this.imageIndex >= this.sprite.hNum){
            if (this.onAnimationEnd)
                this.onAnimationEnd();
            this.destroyed = true;
        }
    }
};