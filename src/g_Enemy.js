var Actor = require('./g_Actor');
var KT = require('./kt_Kramtech');

function Enemy(oMapManager, oSprite, oPosition){
    Actor.call(this, oMapManager, oSprite, oPosition);
}

Enemy.prototype = Object.create(Actor.prototype);

module.exports = Enemy;

Enemy.prototype.update = function(){
    if (!this.mapManager.playerAction){
        Actor.prototype.update.call(this);
        return;
    }
    
    this.moveTo(-1, 0);
    
    Actor.prototype.update.call(this);
};