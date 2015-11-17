module.exports = {
    healCharacter: function(oGame, oTarget, iAmount){
        oTarget.hp = Math.min(oTarget.mHp, oTarget.hp + iAmount);
        oGame.console.addMessage('Recovered ' + iAmount + ' hp');
    },
    
    execute: function(oGame, sEffect, oTarget){
        if (sEffect.name == 'heal'){
            this.healCharacter(oGame, oTarget, sEffect.value);
        }
    }
};