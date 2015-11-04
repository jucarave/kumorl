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
            var name = oItem.name;
            oItem = this.addItemToSlot(oItem, i);
            if (!oItem){
                this.game.console.addMessage(name + " picked!");
                return true;
            }else{
                continue;
            }
        }
        
        this.items[i] = oItem;
        this.game.console.addMessage(oItem.name + " picked!");
        
        return true;
    }
    
    return false;
};

PlayerStats.prototype.addItemToSlot = function(oItem, iSlot){
    if (!this.items[iSlot]){
        this.items[iSlot] = oItem;
        return null;
    }
    
    if (oItem.stack && this.items[iSlot].code == oItem.code && this.items[iSlot].amount < 5){
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