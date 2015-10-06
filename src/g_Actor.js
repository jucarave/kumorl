var KT = require('./kt_Kramtech');

function Actor(oMapManager, oSprite, oPosition){
    this.mapManager = oMapManager;
    this.sprite = oSprite;
    
    this.position = oPosition;
    this.position.z = 0;
    this.scale = new KT.Vector2(1, 1);
    
    this.target = new KT.Vector2(-1, 0);
    this.moving = false;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 8;
    
    this.drawParams = {
        scale: this.scale
    };
}

module.exports = Actor;

Actor.prototype.moveTo = function(xTo, yTo){
    if (this.moving) return;
    if (this.mapManager.isSolid(this.position.x + xTo, this.position.y + yTo)) return;
    
    if (xTo != 0) this.scale.x = xTo;
    
    this.target.set(this.position.x + xTo, this.position.y + yTo);
    this.moving = true;
};

Actor.prototype.draw = function(oCtx, view){
    KT.Canvas.drawSprite(oCtx, this.sprite, (this.position.x - view.x) * 32, ((this.position.y - view.y) * 32) - this.position.z, this.imageIndex, 0, this.drawParams);
};

Actor.prototype.finishMovement = function(){
    this.moving = false;
    this.position.copy(this.target);
    this.position.z = 0;
    this.target.set(-1, 0);
};

Actor.prototype.updateMovement = function(){
    if (!this.moving) return;
    
    if ((this.target.x != this.position.x && Math.abs(this.target.x - this.position.x) <= 0.5) || 
        (this.target.y != this.position.y && Math.abs(this.target.y - this.position.y) <= 0.5))
        this.position.z -= 0.5;
    else
        this.position.z += 0.5;
    
    if (this.target.x > this.position.x){
        this.position.x += 0.2;
        if (this.target.x <= this.position.x){ this.finishMovement(); }
    }else if (this.target.x < this.position.x){
        this.position.x -= 0.2;
        if (this.target.x >= this.position.x){ this.finishMovement(); }
    }else if (this.target.y > this.position.y){
        this.position.y += 0.2;
        if (this.target.y <= this.position.y){ this.finishMovement(); }
    }else if (this.target.y < this.position.y){
        this.position.y -= 0.2;
        if (this.target.y >= this.position.y){ this.finishMovement(); }
    }
};

Actor.prototype.update = function(){
    if (!this.moving){
        this.imageIndex += this.imageSpeed;
        if (this.imageIndex >= this.sprite.hNum){
            this.imageIndex = 0;
        }
    }
    
    this.updateMovement();
};