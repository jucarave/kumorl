var Vector2 = require('./kt_Vector2.js');

module.exports = {
    items: {
        sword: {name: 'Sword', code: 'sword', imageIndex: new Vector2(1, 0)}
    },
    
    getItem: function(itemCode, amount, status){
        var item = this.items[itemCode];
        if (!item) throw "Invalid item code: " + itemCode;
        
        var ret = {};
        for (var i in item){
            ret[i] = item[i];
        }
        
        ret.amount = amount;
        ret.status = status;
        
        return ret;
    }
};