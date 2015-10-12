var KT = require('./kt_Kramtech');

function Animation(oMapManager, oSprite, oPosition, fOnAnimationEnd){
    this.mapManager = oMapManager;
    this.sprite = oSprite;
    this.position = oPosition;
    
    this.onAnimationEnd = fOnAnimationEnd;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 2;
    
    this.destroyed = false;
}

module.exports = Animation;

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