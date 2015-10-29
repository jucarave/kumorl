var Vector2 = require('./kt_Vector2.js');

module.exports = {
    items: {
        sword: {name: 'Sword', code: 'sword', imageIndex: new Vector2(1, 0), type: 'weapon'},
        
        torch: {name: 'Torch', code: 'torch', imageIndex: new Vector2(3, 0), imageNum: 3, type: 'misc'}
    },
    
    getItem: function(itemCode, amount, status){
        var item = this.items[itemCode];
        if (!item) throw "Invalid item code: " + itemCode;
        
        var ret = {};
        for (var i in item){
            ret[i] = item[i];
        }
        
        if (item.type != 'misc') ret.amount = amount;
        if (item.type == 'weapon') ret.status = status;
        
        return ret;
    }
};