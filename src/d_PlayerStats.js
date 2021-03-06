var ItemFactory = require('./d_ItemFactory');

function PlayerStats(oGame){
    this.game = oGame;
    
    this.name = 'Kram';
    this.level = 1;
    this.exp = 0;
    this.next = 100;
    this.hp = 100;
    this.mHp = 100;
    this.mp = 300;
    this.mMp = 500;
    this.stm = 100;
    this.mStm = 100;
    
    this.atk = 4;
    this.dfs = 3;
    this.spd = 3;
    this.luk = 2;
    this.wis = 2;
    
    this.arch = 2;
    this.oneH = 2;
    this.twoH = 2;
    this.hvyA = 2;
    this.lgtA = 2;
    this.alch = 2;
    this.fdPv = 2;
    this.crft = 2;
    
    this.items = new Array(10);
    this.equipment = {
        chest: null
    };
}

module.exports = PlayerStats;

PlayerStats.prototype.addItem = function(oItem){
    var amount = '';
    if (oItem.amount > 1){
        amount = ' (x' + oItem.amount + ')';
    }
    
    for (var i=0;i<10;i++){
        if (this.items[i]){
            var name = oItem.ref.name;
            oItem = this.addItemToSlot(oItem, i);
            if (!oItem){
                this.game.console.addMessage(name + amount + " picked!", 'yellow');
                return true;
            }else{
                continue;
            }
        }
        
        this.items[i] = oItem;
        this.game.console.addMessage(oItem.ref.name + amount + " picked!", 'yellow');
        
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
        this.game.console.addMessage(this.name + ' used ' + item.ref.name, 'yellow');
        if (--item.amount == 0){ 
            ItemFactory.free(item);
            this.items[iSlot] = null; 
        }
        
        if (!effect) return true;
    }
    
    if (effect){
        ItemFactory.activateEffect(this.game, effect, this);
        return true;
    }
    
    return false;
};