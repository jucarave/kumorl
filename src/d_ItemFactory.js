var Magic = require('./d_Magic');
var VM = require('./g_VM');

function Position(x, y){
    this.x = x;
    this.y = y;
}

module.exports = {
    memLoc: [],
    
    items: {
        noChest: { code: 'noChest', uiPosition: new Position(0, 0), type: 'chest' },
        leatherArmor: { name: 'Leather armor', code: 'leatherAmor', imageIndex: new Position(1, 0), uiPosition: new Position(1, 0), type: 'chest' },
        
        sword: { name: 'Sword', code: 'sword', imageIndex: new Position(1, 0), uiPosition: new Position(0, 0), type: 'weapon' },
        
        potion: { name: 'Red potion', code: 'potion', imageIndex: new Position(2, 0), type: 'item', stack: true, onUse: Magic.heal },
        
        torch: { name: 'Torch', code: 'torch', imageIndex: new Position(3, 0), imageNum: 3, type: 'misc', solid: true }
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
    
    activateEffect: function(oGame, oEffect, oTarget){
        VM.execute(oGame, oEffect, oTarget);
    }
};