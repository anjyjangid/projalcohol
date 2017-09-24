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
	var hours = this.getUTCHours();
	var minutes = this.getUTCMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

Date.prototype.format = function(f){
	var d = this,
		month = (d.getMonth()+1),
		day = d.getDate(),
		year = d.getFullYear();
	var hours = d.getHours(),
		minutes = d.getMinutes(),
		seconds = d.getSeconds();

	if(!f) f = "yyyy-mm-ddTHH:ii:ss";
	function preleadingZeros(n, z){
		n = ''+n;
		while(n.length<z) n = '0'+n;
		return n;
	}
	return f.replace(/mm/g, preleadingZeros(month,2))
		.replace(/m/g, month)
		.replace(/dd/g, preleadingZeros(day,2))
		.replace(/d/g, day)
		.replace(/yyyy/g, preleadingZeros(year,4))
		.replace(/y/g, year)
		.replace(/hh/g, preleadingZeros(hours,2))
		.replace(/h/g, hours)
		.replace(/HH/g, preleadingZeros((hours>12)?(hours-12):hours,2))
		.replace(/H/g, (hours>12)?(hours-12):hours)
		.replace(/ii/g, preleadingZeros(minutes,2))
		.replace(/i/g, minutes)
		.replace(/ss/g, preleadingZeros(seconds,2))
		.replace(/s/g, seconds)
		.replace(/a/g, (hours>=12)?"pm":"am")
		.replace(/A/g, (hours>=12)?"PM":"AM");
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

Date.prototype.shiftDays = function(days){    
  days = parseInt(days, 10);
  this.setDate(this.getDate() + days);
  return this;
}

function cLog(param){
	console.log("%c" + param, "color: purple; font-size: 110%; font-weight: bold;");
}

function objectToFormData(obj, form, namespace) {

	var fd = form || new FormData();
	var formKey;

	for(var property in obj) {
		if(obj.hasOwnProperty(property)) {

			if(namespace) {
				formKey = namespace + '[' + property + ']';
			} else {
				formKey = property;
			}

			// if the property is an object, but not a File,
			// use recursivity.
			if(typeof obj[property] === 'object' && !(obj[property] instanceof File)) {

				objectToFormData(obj[property], fd, formKey);

			} else {

			// if it's a string or a File object
				fd.append(formKey, obj[property]);

			}

		}
	}

	return fd;

};