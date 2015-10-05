var Utils = require('./kt_Utils');

module.exports = {
    keys: new Uint8ClampedArray(255),
    vKeys: {
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
		PAGEDOWN: 34,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40
    },
    
    listenTo: function(elCanvas){
        var thus = this;
        
        Utils.addEvent(document, 'keydown', function(eEvent){ thus.onKeyDown(eEvent); } );
        Utils.addEvent(document, 'keyup', function(eEvent){ thus.onKeyUp(eEvent); } );
        
        for (var i=0;i<=9;i++){
			this.vKeys['N' + i] = 48 + i;
			this.vKeys['NK' + i] = 96 + i;
		}
		
		for (var i=65;i<=90;i++){
			this.vKeys[String.fromCharCode(i)] = i;
		}
		
		for (var i=1;i<=12;i++){
			this.vKeys['F' + i] = 111 + i;
		}
    },
    
    onKeyDown: function(eEvent){
        if (this.keys[eEvent.keyCode] == 2) return;
        
        this.keys[eEvent.keyCode] = 1;
    },
    
    onKeyUp: function(eEvent){
    	var keyCode = eEvent.keyCode;
        this.keys[keyCode] = 3;
        
        var thus = this;
        setTimeout(function(){ thus.keys[keyCode] = 0; }, 40);
    },
    
    isKeyDown: function(iKeyCode){
    	return (this.keys[iKeyCode] == 1);
    },
    
    isKeyPressed: function(iKeyCode){
    	if (this.keys[iKeyCode] == 1){
    		this.keys[iKeyCode] = 2;
    		return true;
    	}
    	
    	return false;
    },
    
    isKeyUp: function(iKeyCode){
    	if (this.keys[iKeyCode] == 3){
    		this.keys[iKeyCode] = 0;
    		return true;
    	}
    	
    	return false;
    }
};