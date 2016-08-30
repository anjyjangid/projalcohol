MetronicApp.factory('businessModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getBusiness: function(businessid){
            return $http.get("/adminapi/business/detail/"+businessid);
        },

        /*saveProduct: function(data){
            return $http.post("/admin/product/store", {data:data});
        },*/

        storeBusiness: function(fields){
	        return $http.post("/adminapi/business/store", fields, {
	            
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
	                message: "Business successfully added",//response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("business/list");

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

        updateBusiness: function(fields,businessid){
	       	
	       	//put is used to updated data, Laravel router automatically redirect to update function 
	        return $http.post("/adminapi/business/update/"+businessid, fields, {
	            
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
	            $location.path("business/list");

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