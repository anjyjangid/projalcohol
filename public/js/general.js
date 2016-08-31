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

/*$( document ).ajaxComplete(function(e,res) {
  if(res.status==401){    
    window.location.hash = '#/logout'    
  }  
});*/