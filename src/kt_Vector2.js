function Vector2(x, y){
	this.__ktv2 = true;
	
	this.x = x;
	this.y = y;
}

module.exports = Vector2;

Vector2.memLoc = [];
Vector2.preAllocate = function(iAmount){
	Vector2.memLoc = [];
	
	for (var i=0;i<iAmount;i++){
		Vector2.memLoc.push(new Vector2(0, 0));
	}
};

Vector2.allocate = function(x, y){
	if (Vector2.memLoc.length == 0) throw "Out of Vector2 instances.";
	
	var vector2 = Vector2.memLoc.pop();
	vector2.set(x, y);
	
	return vector2;
};

Vector2.free = function(oVector2){
	Vector2.memLoc.push(oVector2);
};

Vector2.prototype.length = function(){
	var length = Math.sqrt(this.x * this.x + this.y * this.y);
	
	return length;
};

Vector2.prototype.normalize = function(){
	var length = this.length();
	
	this.x /= length;
	this.y /= length;
	
	return this;
};

Vector2.prototype.dot = function(vector2){
	if (!vector2.__ktv2) throw "Can only perform a dot product with a vector2";
	
	return this.x * vector2.x + this.y * vector2.y;
};

Vector2.prototype.invert = function(){
	return this.multiply(-1);
};

Vector2.prototype.multiply = function(number){
	this.x *= number;
	this.y *= number;
	
	return this;
};

Vector2.prototype.sum = function(x, y){
	this.x += x;
	this.y += y;
	
	return this;
};

Vector2.prototype.add = function(vector2){
	if (!vector2.__ktv2) throw "Can only add a vector2 to this vector";
	
	this.x += vector2.x;
	this.y += vector2.y;
	
	return this;
};

Vector2.prototype.copy = function(vector2){
	if (!vector2.__ktv2) throw "Can only copy a vector2 to this vector";
	
	this.x = vector2.x;
	this.y = vector2.y;
	
	return this;
};

Vector2.prototype.set = function(x, y){
	this.x = x;
	this.y = y;
	
	return this;
};

Vector2.prototype.clone = function(){
	return Vector2.allocate(this.x, this.y);
};

Vector2.prototype.equals = function(x, y){
	return (this.x == x && this.y == y);
};

Vector2.prototype.equalsVector2 = function(vector2){
	if (!vector2.__ktv2) throw "Can only copy a vector2 to this vector";
	
	return (this.x == vector2.x && this.y == vector2.y);
};

Vector2.vectorsDifference = function(vector2_a, vector2_b){
	if (!vector2_a.__ktv2) throw "Can only create this vector using 2 vectors2";
	if (!vector2_b.__ktv2) throw "Can only create this vector using 2 vectors2";
	
	return Vector2.allocate(vector2_a.x - vector2_b.x, vector2_a.y - vector2_b.y);
};

Vector2.fromAngle = function(radian){
	var x = Math.cos(radian);
	var y = -Math.sin(radian);
	
	return Vector2.allocate(x, y);
};