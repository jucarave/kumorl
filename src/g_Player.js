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

Player.prototype.checkInput = function(){
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

Player.prototype.update = function(){
    this.checkInput();
    
    Actor.prototype.update.call(this);
};