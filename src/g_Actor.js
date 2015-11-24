var KT = require('./kt_Kramtech');

function Actor(){
    this.mapManager = null;
    this.game = null;
    this.sprite = null;
    
    this.position = KT.Vector2.allocate(0, 0);
    this.position.z = 0;
    this.scale = KT.Vector2.allocate(1, 1);
    
    this.target = KT.Vector2.allocate(-1, 0);
    this.moving = false;
    
    this.collision = new KT.BoxCollision(0, 0, 1, 1);
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 8;
    
    this.destroyed = false;
    this.solid = true;
    
    this.blink = -1;
    
    this.drawParams = {
        scale: this.scale
    };
}

module.exports = Actor;

Actor.prototype.init = function(oMapManager, oSprite, x, y){
    this.mapManager = oMapManager;
    this.game = oMapManager.game;
    this.sprite = oSprite;
    
    this.position.set(x, y);
    this.position.z = 0;
    this.scale.set(1, 1);
    
    this.target.set(-1, 0);
    this.moving = false;
    
    this.collision.update(x, y);
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 8;
    
    this.destroyed = false;
    this.solid = true;
    
    this.blink = -1;
};

Actor.prototype.moveTo = function(xTo, yTo){
    if (this.moving) return false;
    if (this.mapManager.isSolid(this, this.position.x + xTo, this.position.y + yTo)) return true;
    
    if (xTo != 0) this.scale.x = xTo;
    
    this.target.set(this.position.x + xTo, this.position.y + yTo);
    this.moving = true;
    
    return true;
};

Actor.prototype.draw = function(oCtx, oView){
    if (this.destroyed) return;
    if (!this.mapManager.isVisible(this.position.x, this.position.y)) return;
    if (this.blink >= 10) return;
    if (this.blink >= 4 && this.blink < 7) return;
    
    var vx = this.position.x - oView.x;
    var vy = this.position.y - oView.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > oView.width || vy > oView.height) return;
    
    KT.Canvas.drawSprite(oCtx, this.sprite, vx * 32, (vy * 32) - this.position.z, this.imageIndex, 0, this.drawParams);
};

Actor.prototype.finishMovement = function(){
    this.moving = false;
    this.position.copy(this.target);
    this.position.z = 0;
    this.target.set(-1, 0);
    
    this.collision.update(this.position.x, this.position.y);
    if (this.afterMovement) this.afterMovement();
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
    
    this.collision.update(this.position.x, this.position.y);
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
    
    if (this.blink >= 0) this.blink -= 1;
    
    this.updateMovement();
};