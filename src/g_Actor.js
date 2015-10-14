var KT = require('./kt_Kramtech');

function Actor(oMapManager, oSprite, oPosition){
    this.mapManager = oMapManager;
    this.game = oMapManager.game;
    this.sprite = oSprite;
    
    this.position = oPosition;
    this.position.z = 0;
    this.scale = new KT.Vector2(1, 1);
    
    this.target = new KT.Vector2(-1, 0);
    this.moving = false;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 8;
    
    this.destroyed = false;
    this.solid = true;
    
    this.drawParams = {
        scale: this.scale
    };
}

module.exports = Actor;

Actor.prototype.moveTo = function(xTo, yTo){
    if (this.moving) return false;
    if (this.mapManager.isSolid(this.position.x + xTo, this.position.y + yTo)) return true;
    if (this.mapManager.isSolidCollision(this.position.x + xTo, this.position.y + yTo)) return true;
    if (this.mapManager.isPlayerCollision(this.position.x + xTo, this.position.y + yTo)) return true;
    
    if (xTo != 0) this.scale.x = xTo;
    
    this.target.set(this.position.x + xTo, this.position.y + yTo);
    this.moving = true;
    
    return true;
};

Actor.prototype.draw = function(oCtx, view){
    if (this.destroyed) return;
    
    var vx = this.position.x - view.x;
    var vy = this.position.y - view.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > view.width || vy > view.height) return;
    
    KT.Canvas.drawSprite(oCtx, this.sprite, vx * 32, (vy * 32) - this.position.z, this.imageIndex, 0, this.drawParams);
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

Actor.prototype.destroy = function(){
    this.destroyed = true;
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