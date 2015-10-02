var Utils = require('./kt_Utils');

module.exports = {
    _keys: [],
    _vKeys: {
        SHIFT: 16,
		TAB: 9,
		CTRL: 17,
		ALT: 18,
		SPACE: 32,
		ENTER: 13,
		BACKSPACE: 8,
		ESC: 27,
		INSERT: 45,
		DEL: 46,
		END: 35,
		START: 36,
		PAGEUP: 33,
		PAGEDOWN: 34
    },
    
    listenTo: function(elCanvas){
        var thus = this;
        
        Utils.addEvent(document, 'keydown', function(eEvent){ thus.onKeyDown(eEvent); } );
        Utils.addEvent(document, 'keyup', function(eEvent){ thus.onKeyUp(eEvent); } );
        
        for (var i=0;i<=9;i++){
			this._vKeys['N' + i] = 48 + i;
			this._vKeys['NK' + i] = 96 + i;
		}
		
		for (var i=65;i<=90;i++){
			this._vKeys[String.fromCharCode(i)] = i;
		}
		
		for (var i=1;i<=12;i++){
			this._vKeys['F' + i] = 111 + i;
		}
    },
    
    onKeyDown: function(eEvent){
        if (this._keys[eEvent.keyCode] == 2) return;
        
        this._keys[eEvent.keyCode] = 1;
    },
    
    onKeyUp: function(eEvent){
        this._keys[eEvent.keyCode] = 0;
    }
};