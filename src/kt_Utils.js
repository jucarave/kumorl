module.exports = {
    addEvent: function(elObj, sType, fCallback){
        if (elObj.addEventListener){
            elObj.addEventListener(sType, fCallback, false);
        }else if (elObj.attachEvent){
            elObj.attachEvent("on" + sType, fCallback);
        }
    },
    
    get: function(sId){
        return document.getElementById(sId);
    },
    
    getHttp: function(){
        if (window.XMLHttpRequest){
			return new XMLHttpRequest();
		}else if (window.ActiveXObject){
			return new window.ActiveXObject("Microsoft.XMLHTTP");
		}
		
		return null;
    },
    
    getJson: function(fileURL, callback){
		var http = this.getHttp();
		http.open('GET', fileURL, true);
		http.onreadystatechange = function() {
	  		if (http.readyState == 4) {
	  		    if (http.status == 200){
    				if (callback){
    				    var json = JSON.parse(http.responseText);
    					callback(null, json);
    				}
	  		    }else{
	  		        try{
	  		            var error = JSON.parse(http.responseText);
	  		            console.error(error.message);
	  		            if (callback) callback(error);
	  		        }catch (e){
	  		            console.error(e);
	  		            if (callback) callback(e);
	  		        }
	  		    }
			}
		};
		http.send();
    },
    
    get2DAngle: function(x1, y1, x2, y2){
		var xx = (x2 - x1);
		var yy = (y1 - y2);
		
		var PI2 = Math.PI * 2;
		var ang = (Math.atan2(yy, xx) + PI2) % PI2;
		
		return ang;
	}
};