var Utils = require('./kt_Utils');
var Vector2 = require('./kt_Vector2');

module.exports = {
    keys: new Uint8ClampedArray(255),
    mouse: {
        position: new Vector2(-1, -1),
        status: 0
    },
    
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
    
    _listener: null,
    EV_MOUSE_DOWN: 0,
    EV_MOUSE_UP: 1,
    EV_KEY_DOWN: 2,
    EV_KEY_UP: 3,
    
    listenTo: function(elCanvas){
        var thus = this;
        
        Utils.addEvent(document, 'keydown', function(oEvent){ thus.onKeyDown(oEvent); } );
        Utils.addEvent(document, 'keyup', function(oEvent){ thus.onKeyUp(oEvent); } );
        
        Utils.addEvent(document, 'mousedown', function(oEvent){ thus.onMouseDown(oEvent, elCanvas); } );
        Utils.addEvent(document, 'mouseup', function(oEvent){ thus.onMouseUp(oEvent, elCanvas); } );
        Utils.addEvent(document, 'mousemove', function(oEvent){ thus.onMouseMove(oEvent, elCanvas); } );
        
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
    
    registerListener: function(oCallback){
        this._listener = oCallback;
    },
    
    onMouseDown: function(oEvent, elCanvas){
        if (this.mouse.status == 2) return;
        
        this.mouse.status = 1;
        this.onMouseMove(oEvent, elCanvas);
        
        if (this._listener) this._listener(this.EV_MOUSE_DOWN);
    },
    
    onMouseUp: function(oEvent, elCanvas){
        this.mouse.status = 0;
        this.onMouseMove(oEvent, elCanvas);
        
        if (this._listener) this._listener(this.EV_MOUSE_UP);
    },
    
    onMouseMove: function(oEvent, elCanvas){
        var xx = oEvent.clientX - elCanvas.offsetLeft;
        var yy = oEvent.clientY - elCanvas.offsetTop;
        
        var m = Math;
        xx = m.min(elCanvas.width, m.max(xx, 0));
        yy = m.min(elCanvas.height, m.max(yy, 0));
        
        this.mouse.position.set(xx, yy);
    },
    
    onKeyDown: function(oEvent){
        if (this.keys[oEvent.keyCode] == 2) return;
        
        this.keys[oEvent.keyCode] = 1;
        
        if (this._listener) this._listener(this.EV_KEY_DOWN, oEvent.keyCode);
    },
    
    onKeyUp: function(oEvent){
    	var keyCode = oEvent.keyCode;
        this.keys[keyCode] = 0;
        
        if (this._listener) this._listener(this.EV_KEY_UP, oEvent.keyCode);
    },
    
    isMouseDown: function(){
        return (this.mouse.status == 1);
    },
    
    isMousePressed: function(){
        if (this.mouse.status == 1){
            this.mouse.status = 2;
            return true;
        }
        
        return false;
    },
    
    isMouseUp: function(){
        if (this.mouse.status == 3){
            this.mouse.status = 0;
            return true;
        }
        
        return false;
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