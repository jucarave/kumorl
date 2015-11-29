var Animation = require('./g_Animation');
var AnimationFactory = require('./d_Animation');
var Event = require('./g_Event');
var Enum = require('./d_Enum');
var EventType = Enum.EVENT;

module.exports = {
    instruction: {
        LITERAL:                0X00,
        GET_HEALTH:             0X01,
        GET_POSITION:           0X02,
        SET_HEALTH:             0X03,
        SET_POSITION:           0X04,
        ADD_HEALTH:             0X05,
        ADD_POSITION:           0X06,
        SUM_VALUES:             0X07,
        PLAY_ANIMATION:         0X08,
    },
    
    animations: [
        "heal"
    ],
    
    getInstance: function(oMapManager, self, iIndex, x, y){
        if (iIndex == 0){ return self; }else
        if (iIndex == 1){ return oMapManager.player.partyMember; }
    },
    
    getAnimation: function(iIndex){
      return this.animations[iIndex];
    },
    
    execute: function(oGame, oByteCode, oTarget){
        var mapManager = oGame.map;
        var stack = [];
        var events = [];
        
        var INS = this.instruction;
        var instance, value, x, y, spr, imgInd, animation;
        
        for (var i=0,len=oByteCode.length;i<len;i++){
            switch (oByteCode[i]){
                case INS.LITERAL: 
                    stack.push(oByteCode[++i]);
                    break;
                    
                case INS.GET_HEALTH:
                    instance = this.getInstance(mapManager, oTarget, stack.pop());
                    stack.push(instance.hp);
                    break;
                    
                case INS.GET_POSITION:
                    instance = this.getInstance(mapManager, oTarget, stack.pop());
                    stack.push(instance.position.x);
                    stack.push(instance.position.y);
                    break;
                    
                case INS.SET_HEALTH:
                    value = stack.pop();
                    instance = this.getInstance(mapManager, oTarget, stack.pop());
                    events.push(Event.allocate(mapManager, EventType.SET_HEALTH, instance, [value]));
                    break;
                    
                case INS.SET_POSITION:
                    y = stack.pop();
                    x = stack.pop();
                    instance = this.getInstance(mapManager, oTarget, stack.pop());
                    events.push(Event.allocate(mapManager, EventType.SET_POSITION, instance, [x, y]));
                    break;
                    
                case INS.ADD_HEALTH:
                    value = stack.pop();
                    instance = this.getInstance(mapManager, oTarget, stack.pop());
                    events.push(Event.allocate(mapManager, EventType.ADD_HEALTH, instance, [value]));
                    break;
                    
                case INS.ADD_POSITION:
                    y = stack.pop();
                    x = stack.pop();
                    instance = this.getInstance(mapManager, oTarget, stack.pop());
                    events.push(Event.allocate(mapManager, EventType.SET_POSITION, instance, [x, y]));
                    break;
                
                case INS.SUM_VALUES:
                    value = stack.pop();
                    value += stack.pop();
                    stack.push(value);
                    break;
                    
                case INS.PLAY_ANIMATION:
                    spr = oGame.sprites.animations;
                    y = stack.pop();
                    x = stack.pop();
                    imgInd = AnimationFactory[this.getAnimation(stack.pop())];
                    animation = Animation.allocate(mapManager, spr, x, y, imgInd);
                    events.push(Event.allocate(mapManager, EventType.PLAY_ANIMATION, animation));
                    break;
            }
            
        }
        
        mapManager.setEvents(events);
    }
};