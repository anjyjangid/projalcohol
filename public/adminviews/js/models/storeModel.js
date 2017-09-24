MetronicApp.factory('storeModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getStore: function(id){
            return $http.get("/adminapi/stores/"+id+"/edit");
        },       

        store: function(fields){
        	   	      
	        return $http.post("/adminapi/stores", fields, {	        
	            
	        }).error(function(data, status, headers) {            

	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '.mcontainer',
	                place: 'prepend'	                
	            });

	        })
	        .success(function(response){	            
	            
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: 'Store added successfully',
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("store/list");

	        });

        },     

        update: function(fields,id){

	       	//put is used to updated data, Laravel router automatically redirect to update function 
	        return $http.put("/adminapi/stores/"+id, fields, {

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
		                message: 'Store updated successfully',
		                container: '#info-message',
		                place: 'prepend',
		                closeInSeconds: 3
		            });
		            $location.path("store/list");
	            
	        });
	        

        },
    };
}])