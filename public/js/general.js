Object.defineProperty(Object.prototype, 'renameProperty',{
  value : function(oldName, newName) {
		// Do nothing if the names are the same
		if (oldName == newName) {
			 return this;
		}

		// Check for the old property name to avoid a ReferenceError in strict mode.
		if (this.hasOwnProperty(oldName)) {
			this[newName] = this[oldName];
			delete this[oldName];
		}
		return this;
  },
  enumerable : false
});

function GOM(obj)
{
	var res = [];
	for(var m in obj) {
		if(typeof obj[m] == "function") {
			res.push(m)
		}
	}
	return res;
}

function mongoIdToStr(id){

	if(typeof id.$id !== 'undefined'){ 
		id = id.$id
	}

	return id;
}

Number.prototype.toFixed = function(digits) {
	return Math.round(this * Math.pow(10, digits))/Math.pow(10, digits);
}

String.prototype.toFixed = function(digits) {

	var value = parseFloat(this);

	if(isNaN(value)){

		console.log("Trying to convert a 'NAN' value");
		return 0;

	}

	return Math.round(value * Math.pow(10, digits))/Math.pow(10, digits);
}

