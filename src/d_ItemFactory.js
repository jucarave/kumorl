var Vector2 = require('./kt_Vector2.js');
var ActorEffect = require('./e_ActorEffects');

function Effect(iType, sName, sValue){
    this.type = iType;
    this.name = sName;
    this.value = sValue;
}

module.exports = {
    memLoc: [],
    
    items: {
        sword: { name: 'Sword', code: 'sword', imageIndex: new Vector2(1, 0), type: 'weapon' },
        
        potion: { name: 'Red potion', code: 'potion', imageIndex: new Vector2(2, 0), type: 'item', stack: true, onUse: new Effect(1, 'heal', 30) },
        
        torch: { name: 'Torch', code: 'torch', imageIndex: new Vector2(3, 0), imageNum: 3, type: 'misc', solid: true }
    },
    
    preAllocate: function(iAmount){
        this.memLoc = [];
        
        for (var i=0;i<iAmount;i++){
            this.memLoc.push({
                ref: null,
                amount: 0,
                status: 0
            });
        }
    },
    
    allocate: function(oRef, iAmount, fStatus){
        if (this.memLoc.length == 0) throw "Out of Item Factory instances.";
        
        var item = this.memLoc.pop();
        
        item.ref = oRef;
        item.amount = iAmount;
        item.status = fStatus;
        
        return item;
    },
    
    free: function(oItem){
        oItem.ref = null;
        this.memLoc.push(oItem);
    },
    
    getItem: function(itemCode, amount, status){
        var item = this.items[itemCode];
        if (!item) throw "Invalid item code: " + itemCode;
        
        if (!amount) amount = 1;
        if (!status) status = -1;
        
        amount = Math.min(amount, 5);
        
        var ret = this.allocate(item, amount, status);
        
        return ret;
    },
    
    getStatusName: function(fStatus){
        if (fStatus >= 0.8){
            return 'excelent';
        }else if (fStatus >= 0.6){
            return 'serviceable';
        }else if (fStatus >= 0.4){
            return 'worn';
        }else if (fStatus >= 0.2){
            return 'badly worn';
        }else{
            return 'ruined';
        }
    },
    
    activateEffect: function(oGame, oItem, oTarget){
        var effect = oItem.onUse;
        
        switch (effect.type){
            case 1: ActorEffect.execute(oGame, effect, oTarget); break;
        }
    }
};