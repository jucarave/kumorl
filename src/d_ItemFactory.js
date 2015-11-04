var Vector2 = require('./kt_Vector2.js');

module.exports = {
    items: {
        sword: {name: 'Sword', code: 'sword', imageIndex: new Vector2(1, 0), type: 'weapon' },
        
        potion: {name: 'Red potion', code: 'potion', imageIndex: new Vector2(2, 0), type: 'item', stack: true },
        
        torch: {name: 'Torch', code: 'torch', imageIndex: new Vector2(3, 0), imageNum: 3, type: 'misc', solid: true }
    },
    
    getItem: function(itemCode, amount, status){
        var item = this.items[itemCode];
        if (!item) throw "Invalid item code: " + itemCode;
        
        var ret = {};
        for (var i in item){
            ret[i] = item[i];
        }
        
        if (item.type != 'misc') ret.amount = Math.min(amount, 5);
        if (item.type == 'weapon') ret.status = status;
        
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
    }
};