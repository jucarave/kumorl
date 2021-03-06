var Actor = require('./g_Actor');
var EnemyFactory = require('./d_EnemyFactory');
var KT = require('./kt_Kramtech');
var Enum = require('./d_Enum');
var ActorState = Enum.ACTOR;
var MapTurn = Enum.MAP;

function Enemy(oMapManager, oSprite, oPosition, enemyStats){
    Actor.call(this, oMapManager, oSprite, oPosition);
    
    this._enemy = true;
    this.enemyStats = enemyStats;
}

Enemy.prototype = Object.create(Actor.prototype);

module.exports = Enemy;

Enemy.memLoc = [];
Enemy.preAllocate = function(iAmount){
    Enemy.memLoc = [];
    
    for (var i=0;i<iAmount;i++){
        Enemy.memLoc.push(new Enemy());
    }
};

Enemy.allocate = function(oMapManager, oSprite, x, y, enemyStats){
    if (Enemy.memLoc.length == 0) throw "Out of Enemy instances.";
    
    var enemy = Enemy.memLoc.pop();
    enemy.init(oMapManager, oSprite, x, y);
    enemy.enemyStats = enemyStats;
    
    return enemy;
};

Enemy.free = function(oEnemy){
    EnemyFactory.free(oEnemy.enemyStats);
    Enemy.memLoc.push(oEnemy);
};

Enemy.prototype.endTurn = function(){
    this.state = ActorState.STANDING;
    this.mapManager.endTurn();
};

Enemy.prototype.receiveDamage = function(iDmg){
    var dfs = this.enemyStats.ref.dfs;
    var dmg = iDmg - dfs;
    
    if (dmg <= 0){
        this.mapManager.createFloatText('Blocked', this.position.x, this.position.y);
        this.game.console.addToLast(", Blocked");
        return false;
    }
    
    this.game.console.addToLast(', ' + dmg + ' damage points received');
    this.mapManager.createFloatText(dmg + '', this.position.x, this.position.y, 'red');
    this.enemyStats.hp -= dmg;
    this.blink = 12;
    this.state = ActorState.DAMAGE;
    
    if (this.enemyStats.hp <= 0){
        this.enemyStats.hp = 0;
    }
    
    return true;
};

Enemy.prototype.randomMovement = function(){
    if (this.destroyed) return;
    
    var m = Math;
    var xTo = 0, yTo = 0;
    
    xTo = m.floor(m.random() * 3) - 1;
    if (xTo == 0){ yTo = m.floor(m.random() * 3) - 1; }
    
    if (xTo != 0 || yTo != 0){
        this.moveTo(xTo, yTo);
    }else{
        this.state = ActorState.END_TURN;
    }
};

Enemy.prototype.update = function(){
    if (this.destroyed) return;
    
    if (this.mapManager.turn == MapTurn.WORLD_TURN){
        if (this.enemyStats.hp <= 0){
            this.game.console.addMessage(this.enemyStats.ref.name + " died");
            this.destroy();
            return;
        }
        
        switch (this.state){
            case ActorState.STANDING:
                this.randomMovement();
                break;
            
            case ActorState.END_TURN:
                this.endTurn();
                break;
        }
    }
    
    Actor.prototype.update.call(this);
};