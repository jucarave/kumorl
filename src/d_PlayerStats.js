var ItemFactory = require('./d_ItemFactory');

function PlayerStats(oGame){
    this.game = oGame;
    
    this.name = 'Kram';
    this.level = 1;
    this.exp = 0;
    this.hp = 8;
    this.mHp = 10;
    this.mp = 3;
    this.mMp = 5;
    
    this.atk = '2D3';
    this.dfs = '2D3';
    this.spd = '2D3';
    this.luk = '2D3';
    this.int = '2D3';
    
    this.items = new Array(10);
}

module.exports = PlayerStats;

PlayerStats.prototype.addItem = function(oItem){
    for (var i=0;i<10;i++){
        if (this.items[i]){
            var name = oItem.ref.name;
            oItem = this.addItemToSlot(oItem, i);
            if (!oItem){
                this.game.console.addMessage(name + " picked!", 'yellow');
                return true;
            }else{
                continue;
            }
        }
        
        this.items[i] = oItem;
        this.game.console.addMessage(oItem.ref.name + " picked!", 'yellow');
        
        return true;
    }
    
    return false;
};

PlayerStats.prototype.addItemToSlot = function(oItem, iSlot){
    if (!this.items[iSlot]){
        this.items[iSlot] = oItem;
        return null;
    }
    
    if (oItem.ref.stack && this.items[iSlot].ref.code == oItem.ref.code && this.items[iSlot].amount < 5){
        if (this.items[iSlot].amount + oItem.amount <= 5){
            this.items[iSlot].amount += oItem.amount;
            
            return null;
        }else{
            oItem.amount -= (5 - this.items[iSlot].amount);
            this.items[iSlot].amount = 5;
            
            return oItem;
        }
    }
    
    return oItem;
};

PlayerStats.prototype.useItem = function(iSlot){
    var item = this.items[iSlot];
    var effect = item.ref.onUse;
    
    if (item.ref.stack && item.amount){
        this.game.console.addMessage(item.ref.name + ' used', 'yellow');
        if (--item.amount == 0){ 
            ItemFactory.free(item);
            this.items[iSlot] = null; 
        }
        
        if (!effect) return true;
    }
    
    if (effect){
        ItemFactory.activateEffect(this.game.map, effect, this);
        return true;
    }
    
    return false;
};