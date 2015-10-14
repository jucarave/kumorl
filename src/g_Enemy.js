var Actor = require('./g_Actor');
var Animation = require('./g_Animation');
var KT = require('./kt_Kramtech');

function Enemy(oMapManager, oSprite, oPosition, enemyStats){
    Actor.call(this, oMapManager, oSprite, oPosition);
    
    this._enemy = true;
    this.enemyStats = enemyStats;
}

Enemy.prototype = Object.create(Actor.prototype);

module.exports = Enemy;

Enemy.prototype.receiveDamage = function(iDmg){
    var dfs = this.game.rollDice(this.enemyStats.dfs);
    var dmg = iDmg - dfs;
    
    if (dmg <= 0){
        this.game.console.addToLast(", Blocked");
        return;
    }
    
    this.game.console.addToLast(', ' + dmg + ' damage points received');
    this.mapManager.instances.push(new Animation(this.mapManager, this.mapManager.game.sprites.at_slice, this.position.clone()));
    this.enemyStats.hp -= dmg;
    
    if (this.enemyStats.hp <= 0){
        this.game.console.addMessage(this.enemyStats.name + " died");
        this.destroy();
    }
};

Enemy.prototype.randomMovement = function(){
    if (this.destroyed) return;
    
    var m = Math;
    var xTo = 0, yTo = 0;
    
    xTo = m.floor(m.random() * 3) - 1;
    if (xTo == 0){ yTo = m.floor(m.random() * 3) - 1; }
    
    if (xTo != 0 || yTo != 0){
        this.moveTo(xTo, yTo);
    }
};

Enemy.prototype.update = function(){
    if (this.destroyed) return;
    if (!this.mapManager.playerAction){
        Actor.prototype.update.call(this);
        return;
    }
    
    this.randomMovement();
    
    Actor.prototype.update.call(this);
};