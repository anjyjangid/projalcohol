MetronicApp.factory('promotionModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getPromotion: function(id){
            return $http.get("/adminapi/promotion/detail/"+id);
        },       

        storePromotion: function(fields){
        	   	      
	        return $http.post("/adminapi/promotion", fields, {	        
	            
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
	            $location.path("promotion/list");

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

	       	//put is used to updated data, Laravel router automatically redirect to update function 
	        return $http.put("/adminapi/promotion/"+id, fields, {

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
		            $location.path("promotion/list");

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