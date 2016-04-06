MetronicApp.factory('brandModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getBrand: function(id){
            return $http.get("/admin/brand/"+id);
        },       

        storeBrand: function(fields){
        	   	      
	        return $http.post("/admin/brand", fields, {

	        	transformRequest: angular.identity,
	            headers: {'Content-Type': undefined}
	            
	        }).error(function(data, status, headers) {            

	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '.portlet-body',
	                place: 'prepend',
	                closeInSeconds: 3
	            });

	        })
	        .success(function(response){	            
	            
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("brand/list");

	        })
	        /*.error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: data,
	                container: '.portlet-body',
	                place: 'prepend'
	            });
	        });*/

        },     

        update: function(fields,id){
	       	
	       	console.log(fields);
	       	fields = objectToFormData(fields);
	       	console.log(fields);

	       	//put is used to updated data, Laravel router automatically redirect to update function 
	        return $http.put("/admin/brand/"+id, fields, {

	            transformRequest: angular.identity,	            	            
	            headers: {'Content-Type': undefined}

	        }).error(function(data, status, headers) {

	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '.portlet-body',
	                place: 'prepend',
	                closeInSeconds: 3
	            });

	        })
	        .success(function(response) {	            
	            
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("brand/list");

	        })
	        /*.error(function(data, status, headers) {            
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