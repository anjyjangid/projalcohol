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


Date.prototype.amPmFormat = function() {
	var hours = this.getHours();
	var minutes = this.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

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

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}