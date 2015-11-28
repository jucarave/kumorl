var Animation = require('./g_Animation');
var AnimationFactory = require('./d_Animation');
var Enum = require('./d_Enum');
var Event = require('./g_Event');
var EventType = Enum.EVENT;

module.exports = {
    healCharacter: function(oMapManager, oTarget, iAmount){
        var spr = oMapManager.game.sprites.animations;
        var imgInd = AnimationFactory['heal'];
        var animation = Animation.allocate(oMapManager, spr, oTarget.position.x, oTarget.position.y, imgInd);
        
        var events = [];
        events.push(Event.allocate(oMapManager, EventType.PLAY_ANIMATION, animation));
        events.push(Event.allocate(oMapManager, EventType.HEAL_ACTOR, oTarget, [iAmount]));
        
        oMapManager.setEvents(events);
    },
    
    execute: function(oMapManager, sEffect, oTarget){
        if (sEffect.name == 'heal'){
            this.healCharacter(oMapManager, oTarget, sEffect.value);
        }
    }
};