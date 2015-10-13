var Actor = require('./g_Actor');
var KT = require('./kt_Kramtech');

function Player(oMapManager, oSprite, oPosition){
    Actor.call(this, oMapManager, oSprite, oPosition);
    
    this._player = true;
}

Player.prototype = Object.create(Actor.prototype);

module.exports = Player;

Player.prototype.doAct = function(){
    this.mapManager.playerAction = true;
};

Player.prototype.checkMovement = function(){
    if (this.mapManager.playerAction) return;
    var Input = KT.Input;
    
    var xTo = 0, yTo = 0;
    if (Input.isKeyDown(Input.vKeys.W)){ yTo = -1; }else
    if (Input.isKeyDown(Input.vKeys.S)){ yTo =  1; }else
    if (Input.isKeyDown(Input.vKeys.A)){ xTo = -1; }else
    if (Input.isKeyDown(Input.vKeys.D)){ xTo =  1; }
    
    if (xTo != 0 || yTo != 0){
        if (this.moveTo(xTo, yTo))
            this.doAct();
    }
};

Player.prototype.attackTo = function(oEnemy){
    var m = Math;
    var dx = m.abs(oEnemy.position.x - this.position.x);
    var dy = m.abs(oEnemy.position.y - this.position.y);
    
    if (dx > 1 || dy > 1){
        this.mapManager.game.console.addMessage("Out of range");
        return;
    }
    
    oEnemy.receiveDamage();
};

Player.prototype.checkAction = function(){
    if (this.mapManager.playerAction) return;
    var Input = KT.Input;
    
    if (Input.isMousePressed()){
        var mp = Input.mouse.position;
        
        var m = Math;
        var mx = m.floor(mp.x / 32);
        var my = m.floor(mp.y / 32);
        
        var instance = this.mapManager.getInstanceAt(mx, my);
        if (instance){
            if (instance._enemy) this.attackTo(instance);
        }
        
        this.doAct();
    }
};

Player.prototype.checkInput = function(){
    var Input = KT.Input;
    
    if (Input.isKeyDown(Input.vKeys.SPACE)){ return this.doAct(); }
    
    this.checkMovement();
    this.checkAction();
};

Player.prototype.update = function(){
    this.checkInput();
    
    Actor.prototype.update.call(this);
};