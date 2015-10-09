var Actor = require('./g_Actor');
var KT = require('./kt_Kramtech');

function Enemy(oMapManager, oSprite, oPosition){
    Actor.call(this, oMapManager, oSprite, oPosition);
}

Enemy.prototype = Object.create(Actor.prototype);

module.exports = Enemy;

Enemy.prototype.randomMovement = function(){
    var m = Math;
    var xTo = 0, yTo = 0;
    
    xTo = m.floor(m.random() * 3) - 1;
    if (xTo == 0){ yTo = m.floor(m.random() * 3) - 1; }
    
    if (xTo != 0 || yTo != 0){
        this.moveTo(xTo, yTo);
    }
};

Enemy.prototype.update = function(){
    if (!this.mapManager.playerAction){
        Actor.prototype.update.call(this);
        return;
    }
    
    this.randomMovement();
    
    Actor.prototype.update.call(this);
};