var KT = require('./kt_Kramtech');

function Actor(oMapManager, oSprite, oPosition){
    this.mapManager = oMapManager;
    this.sprite = oSprite;
    this.position = oPosition;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 8;
    
}

module.exports = Actor;

Actor.prototype.moveTo = function(xTo, yTo){
    this.position.sum(xTo, yTo);
};

Actor.prototype.draw = function(oCtx){
    KT.Canvas.drawSprite(oCtx, this.sprite, this.position.x * 32, this.position.y * 32, this.imageIndex, 0);
};

Actor.prototype.update = function(){
    this.imageIndex += this.imageSpeed;
    if (this.imageIndex >= this.sprite.hNum){
        this.imageIndex = 0;
    }
};