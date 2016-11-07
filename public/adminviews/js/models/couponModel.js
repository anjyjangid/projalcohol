MetronicApp.factory('couponModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getCoupon: function(id){
            return $http.get("/adminapi/coupon/detail/"+id);
        },       

        storeCoupon: function(fields){
        	   	      
	        return $http.post("/adminapi/coupon", fields, {	        
	            
	        }).error(function(data, status, headers) {            

	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '#main-container.portlet-body',
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
	            $location.path("coupon/list");

	        })
	        /*.error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: data,
	                container: '#main-container.portlet-body',
	                place: 'prepend'
	            });
	        });*/

        },     

        update: function(fields,id){

	       	//put is used to updated data, Laravel router automatically redirect to update function 
	        return $http.put("/adminapi/coupon/"+id, fields, {

	        }).error(function(data, status, headers) {
	        
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '#main-container.portlet-body',
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
		            $location.path("coupon/list");

	        	}else{

	        		Metronic.alert({
		                type: 'danger',
		                icon: 'warning',
		                message: response.message,
		                container: '#main-container.portlet-body',
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
	                container: '#main-container.portlet-body',
	                place: 'prepend'
	            });
	        });*/

        }       

    };
}])