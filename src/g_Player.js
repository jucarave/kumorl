var Actor = require('./g_Actor');
var KT = require('./kt_Kramtech');
var ItemFactory = require('./d_ItemFactory');
var Enum = require('./d_Enum');
var ActorState = Enum.ACTOR;
var MapTurn = Enum.MAP;

function Player(){
    Actor.call(this);
    
    this._player = true;
    this.partyMember = null;
}

Player.prototype = Object.create(Actor.prototype);

module.exports = Player;

Player.memLoc = [];
Player.preAllocate = function(iAmount){
    Player.memLoc = [];
    
    for (var i=0;i<iAmount;i++){
        Player.memLoc.push(new Player(null, ''));
    }
};

Player.allocate = function(oMapManager, oSprite, x, y, oPartyMember){
    if (Player.memLoc.length == 0) throw "Out of Player instances.";
    
    var player = Player.memLoc.pop();
    player.init(oMapManager, oSprite, x, y);
    player.partyMember = oPartyMember;
    player.partyMember.position = player.position;
    
    return player;
};

Player.free = function(oPlayer){
    Player.memLoc.push(oPlayer);
};

Player.prototype.endTurn = function(){
    var position = this.position;
    if (this.target.x != -1) position = this.target;
    
    this.state = ActorState.STANDING;
    this.mapManager.endTurn();
    
    this.mapManager.clearVisibleMap();
    this.mapManager.castLight(position, 5);
};

Player.prototype.checkMovement = function(){
    var Input = KT.Input;
    
    var xTo = 0, yTo = 0;
    if (Input.isKeyDown(Input.vKeys.W)){ yTo = -1; }else
    if (Input.isKeyDown(Input.vKeys.S)){ yTo =  1; }else
    if (Input.isKeyDown(Input.vKeys.A)){ xTo = -1; }else
    if (Input.isKeyDown(Input.vKeys.D)){ xTo =  1; }
    
    if (xTo != 0 || yTo != 0){
        this.moveTo(xTo, yTo);
    }
};

Player.prototype.attackTo = function(oEnemy){
    var m = Math;
    var dx = m.abs(oEnemy.position.x - this.position.x);
    var dy = m.abs(oEnemy.position.y - this.position.y);
    
    if (dx > 1 || dy > 1){
        this.game.console.addMessage("Out of range");
        return;
    }
    
    this.game.console.addMessage("Attacking " + oEnemy.enemyStats.ref.name);
    
    var dmg = this.game.rollDice(this.partyMember.atk);
    this.mapManager.createAttack(oEnemy, dmg, 'slice');
    
    this.state = ActorState.END_TURN;
};

Player.prototype.pickItem = function(oItem){
    if (oItem.item.ref._static) return;
    
    var m = Math;
    var dx = m.abs(oItem.position.x - this.position.x);
    var dy = m.abs(oItem.position.y - this.position.y);
    
    if (dx > 0 || dy > 0){
        var name = oItem.item.ref.name.toLowerCase();
        if (oItem.item.status != -1){
            name = ItemFactory.getStatusName(oItem.item.status) + ' ' + name;
        }
        
        var msg = "You see a";
        if (name.startsOnVowel()){ msg += 'n'; }
        
        this.game.console.addMessage(msg + ' ' + name);
        return;
    }
    
    if (this.partyMember.addItem(oItem.item)){
        oItem.item = null;
        oItem.destroyed = true;
    }
    
    this.state = ActorState.END_TURN;
};

Player.prototype.checkAction = function(){
    var Input = KT.Input;
    
    if (Input.isMouseDown()){
        var mp = Input.mouse.position;
        
        var m = Math;
        var mx = m.floor(mp.x / 32 + this.mapManager.view.x);
        var my = m.floor(mp.y / 32 + this.mapManager.view.y);
        
        var instance = this.mapManager.getInstanceAt(mx, my);
        if (instance){
            if (instance._enemy) this.attackTo(instance);
            if (instance._item) this.pickItem(instance);
        }else{
            this.state = ActorState.END_TURN;
        }
        
        Input.mouse.status = 2;
    }
};

Player.prototype.checkInput = function(){
    var Input = KT.Input;
    
    if (Input.isKeyDown(Input.vKeys.SPACE)){ 
        this.state = ActorState.END_TURN; 
        return;
    }
    
    this.checkMovement();
    this.checkAction();
};

Player.prototype.update = function(){
    if (this.mapManager.turn == MapTurn.PLAYER_TURN){
        switch (this.state){
            case ActorState.STANDING:
                this.checkInput();
                break;
            
            case ActorState.END_TURN:
                this.endTurn();
                break;
        }
    }
    
    Actor.prototype.update.call(this);
};