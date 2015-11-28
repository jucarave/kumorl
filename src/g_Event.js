var Enum = require('./d_Enum');
var EventType = Enum.EVENT;
var ActorState = Enum.ACTOR;

function Event(){
    this.mapManager = null;
    this.type = null;
    this.target = null;
    this.params = null;
    this.destroyed = false;
    
    this._event = true;
}

module.exports = Event;

Event.memLoc = [];
Event.preAllocate = function(iAmount){
    Event.memLoc = [];
    
    for (var i=0;i<iAmount;i++){
        Event.memLoc.push(new Event());
    }
};

Event.allocate = function(oMapManager, iType, oTarget, oParams){
    if (Event.memLoc.length == 0) throw "Out of Event instances.";
    
    var event = Event.memLoc.pop();
    event.init(oMapManager, iType, oTarget, oParams);
    
    return event;
};

Event.free = function(oEvent){
    Event.memLoc.push(oEvent);
};

Event.prototype.init = function(oMapManager, iType, oTarget, oParams){
    this.mapManager = oMapManager;
    this.type = iType;
    this.target = oTarget;
    this.params = oParams;
    this.destroyed = false;
};

Event.prototype.update = function(oCtx, oView){
    switch (this.type){
        case EventType.PLAY_ANIMATION:
            this.target.update();
            this.target.draw(oCtx, oView);
            
            if (this.target.destroyed){
                this.mapManager.destroyInstance(this.target);
                this.target = null;
                this.destroyed = true;
            }
            break;
        
        case EventType.CAST_DAMAGE:
            if (this.target.receiveDamage(this.params[0])){
                this.type = EventType.WAIT_ACTOR;
            }else{
                this.destroyed = true;
            }
            break;
        
        case EventType.WAIT_ACTOR:
            if (this.target.state == ActorState.STANDING){
                this.destroyed = true;
            }
            break;
            
        case EventType.HEAL_ACTOR:
            this.target.hp = Math.min(this.target.mHp, this.target.hp + this.params[0]);
            this.mapManager.game.console.addToLast(', recovered ' + this.params[0] + ' hp');
            this.destroyed = true;
            break;
    }
};