var Actor = require('./g_Actor');
var Animation = require('./g_Animation');
var KT = require('./kt_Kramtech');
var ItemFactory = require('./d_ItemFactory');

function Player(oMapManager, oSprite, oPosition, oPartyMember){
    Actor.call(this, oMapManager, oSprite, oPosition);
    
    this._player = true;
    this.partyMember = oPartyMember;
}

Player.prototype = Object.create(Actor.prototype);

module.exports = Player;

Player.prototype.doAct = function(){
    this.mapManager.playerAction = true;
    
    var position = this.position;
    if (this.target.x != -1) position = this.target;
    
    this.mapManager.clearVisibleMap();
    this.mapManager.castLight(position, 5);
};

Player.prototype.afterMovement = function(){
    var position = this.position;
    if (this.target.x != -1) position = this.target;
    
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
        if (this.moveTo(xTo, yTo))
            this.doAct();
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
    
    this.game.console.addMessage("Attacking " + oEnemy.enemyStats.name);
    
    var thus = this;
    this.mapManager.createAttack(new Animation(this.mapManager, this.game.sprites.at_slice, oEnemy.position.clone(), function(){
        var dmg = thus.game.rollDice(thus.partyMember.atk);
        oEnemy.receiveDamage(dmg);
    }), oEnemy );
};

Player.prototype.pickItem = function(oItem){
    if (oItem.item.ref._static) return;
    
    var m = Math;
    var dx = m.abs(oItem.position.x - this.position.x);
    var dy = m.abs(oItem.position.y - this.position.y);
    
    if (dx > 0 || dy > 0){
        var name = oItem.item.ref.name.toLowerCase();
        if (oItem.item.status !== undefined){
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
        }
        
        Input.mouse.status = 2;
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
    if (!this.mapManager.playerAction && !this.mapManager.attack){
        this.checkInput();
    }
    
    Actor.prototype.update.call(this);
};