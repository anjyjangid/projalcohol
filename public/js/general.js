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

$( document ).ajaxComplete(function(e,res) {
  if(res.status==401){
    window.location.href = '/';
  }  
});

$(function() {
	if(!$('.social_block').is(':hidden')){
			alert("do something");
	}
  
});

// Object.prototype.count = function () {
//     var count = 0;
//     for(var prop in this) {
//         if(this.hasOwnProperty(prop))
//             count = count + 1;
//     }
//     return count;
// }