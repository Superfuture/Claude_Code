Array.prototype.last = function() {
	if (this.length > 0) return this[this.length - 1];
	else throw 'Array is empty';
};

Array.prototype.find = function(test) {
	for (var i = 0; i < this.length; ++i)	
		if (test.call(this[i], i)) return this[i];
	return undefined;
};

Array.prototype.contains = function(test) {
	for (var i = 0; i < this.length; ++i)
		if (test.call(this[i], i)) return true;
	return false;
};

Array.prototype.each = function(action) {
	for (var i = 0; i < this.length; ++i)
		if (action.call(this[i], i) === false)
			break;
};

Array.prototype.trueForAll = function(test) {
	for (var i = 0; i < this.length; ++i)
		if (test.call(this[i], i) === false)
			return false;
			
	return true;
};

Array.prototype.compare = function(other, comparer) {
	if (this.length != other.length) return false;
	
	for (var i = 0; i < this.length; ++i)
		if (!comparer(this[i], other[i]))
			return false;
			
	return true;
};

function forEachIn(obj, action) {
	for (var key in obj) {
		if (obj.hasOwnProperty(key))
			if (action.call(obj[key], key) === false)
				break;
	}
};

Array.prototype.reverseEach = function(action) {
	for (var i = this.length - 1; i >= 0; --i)
		if (action(this[i], i) === false)
			break;
};

Array.prototype.recursiveEach = function(childSelector, action, depth) {
	if (depth === undefined) depth = 0;

	for (var i = 0; i < this.length; ++i) {
		if (action.call(this[i], depth, i) === false) break;

		var children = childSelector.call(this[i]);
		if (children instanceof Array) children.recursiveEach(childSelector, action, depth + 1);
	}
};

function recursiveEach(current, childSelector, action) {
	action.call(current, 0);
	
	var children = childSelector.call(current);
	if (children instanceof Array) children.recursiveEach(childSelector, action, 1);
};

Array.prototype.map = function(mapper) {
	var result = [ ];

	for (var i = 0; i < this.length; ++i) {
		var mapResult = mapper.call(this[i], i);
		for (var j = 0; j < mapResult.length; ++j)
			result.push(mapResult[j]);
	}

	return result;
};

Array.prototype.group = function(grouper) {
	var result = { };
	
	for (var i = 0; i < this.length; ++i) {
		var key = grouper.call(this[i], i);
		if (!result[key]) result[key] = [ this[i] ];
		else result[key].push(this[i]);
	}
	
	return result;
};

Array.prototype.filter = function(condition) {
	var result = [ ];
	
	for (var i = 0; i < this.length; ++i)
		if (condition.call(this[i], i)) result.push(this[i]);
		
	return result;
};

Array.prototype.distinct = function() {
	var result = [ ];
	
	for (var i = 0; i < this.length; ++i)
		if (result.indexOf(this[i]) == -1)
			result.push(this[i]);
			
	return result;
};

String.prototype.toAbsoluteUri = function(baseUri) {
	var host = /^\w+:\/\/(\w|\.)+(\/|$)/.exec(baseUri)[0];
	var base = baseUri.substr(host.length);
	base = base.substr(0, base.lastIndexOf('/'));
	var rel = this;

	//Already absolute
	if (/^\w+:\/\//.test(rel)) return rel;

	//Leading slash
	if (/^\//.test(rel)) return host + rel.substr(1);

	//Leading dots
	if (/^\.\./.test(rel)) {
		while (/^\.\./.test(rel) && base.length > 0) {
			base = base.substr(0, base.lastIndexOf('/'));
			rel = rel.substr(3);
		}
		return host + base + '/' + rel;
	}

	return host + base + (base != '' ? '/' : '') + rel;
};

function copy(obj) {
	if (typeof obj !== 'object' ) {
		return obj;  // non-object have value sematics, so obj is already a copy.
	} else {
		var value = obj.valueOf();
		if (obj != value) { 
			// the object is a standard object wrapper for a native type, say String.
			// we can make a copy by instantiating a new object around the value.
			return new obj.constructor(value);
		} else {
			// ok, we have a normal object. If possible, we'll clone the original's prototype 
			// (not the original) to get an empty object with the same prototype chain as
			// the original.  If just copy the instance properties.  Otherwise, we have to 
			// copy the whole thing, property-by-property.
			if ( obj instanceof obj.constructor && obj.constructor !== Object ) { 
				var c = clone(obj.constructor.prototype);
			
				// give the copy all the instance properties of obj.  It has the same
				// prototype as obj, so inherited properties are already there.
				for ( var property in obj) { 
					if (obj.hasOwnProperty(property)) {
						c[property] = obj[property];
					} 
				}
			} else {
				var c = {};
				for ( var property in obj ) c[property] = obj[property];
			}
			
			return c;
		}
	}
}

function clone(obj) {
	// A clone of an object is an empty object with a prototype reference to the original.
	// As such, you can access the current properties of the original through the clone.
	// If you set a clone's property, it will override the orignal's property, and
	// not affect the orignal. You can use the delete operator on the clone's overridden 
	// property to return to the earlier lookup behavior.

	function Clone() { } // a private constructor, used only by this one clone.
	Clone.prototype = obj;
	var c = new Clone();
	c.constructor = Clone;
	return c;
}