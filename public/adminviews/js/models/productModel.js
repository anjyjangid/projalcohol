MetronicApp.factory('productModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        getCategories: function(){
            return $http.get("/admin/category/getparentcategories/all");
        },

        saveProduct: function(data){
            return $http.post("/admin/product/store", {data:data});
        },

        storeProduct: function(fields){

	       	var fd = objectToFormData(fields);	       	  

	        return $http.post("/admin/product/store", fd, {
	            transformRequest: angular.identity,	            	            
	            headers: {'Content-Type': undefined}
	        }).error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please validate all required fields.',
	                container: '.portlet-body',
	                place: 'prepend',
	                closeInSeconds: 5
	            });
	        });
	        /*.success(function(response) {	            
	            $location.path("product/list");
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 10000
	            });

	        }).error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: data,
	                container: '.portlet-body',
	                place: 'prepend'
	            });
	        });*/

        }       
    };
}])

var objectToFormData = function(obj, form, namespace) {
    
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