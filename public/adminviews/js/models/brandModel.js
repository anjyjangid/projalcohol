MetronicApp.factory('brandModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getBrand: function(id){
            return $http.get("/adminapi/brand/"+id);
        },       

        storeBrand: function(fields){
        	   	      
	        return $http.post("/adminapi/brand", fields, {

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
	       		       	
	       	fields = objectToFormData(fields);
	       	
	       	//put is used to updated data, Laravel router automatically redirect to update function 
	        return $http.post("/adminapi/brand/update/"+id, fields, {

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

	            if(response.success){

		            Metronic.alert({
		                type: 'success',
		                icon: 'check',
		                message: response.message,
		                container: '#info-message',
		                place: 'prepend',
		                closeInSeconds: 3
		            });
		            $location.path("brand/list");

	        	}else{

	        		Metronic.alert({
		                type: 'danger',
		                icon: 'warning',
		                message: response.message,
		                container: '.portlet-body',
		                place: 'prepend',
		                closeInSeconds: 10
		            });

	        	}
	            

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