MetronicApp.factory('dealerModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getDealer: function(dealerId){
            return $http.get("/admin/dealer/getdealer/"+dealerId);
        },

        saveProduct: function(data){
            return $http.post("/admin/product/store", {data:data});
        },

        storeDealer: function(fields){
	       	
	        return $http.post("/admin/dealer", fields, {
	            
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
	                message: "Dealer successfully added",//response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("dealers/list");

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

        updateDealer: function(fields,dealerId){
	       	
	       	//put is used to updated data, Laravel router automatically redirect to update function 

	        return $http.put("/admin/dealer/"+dealerId, fields, {
	            
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
	            $location.path("dealers/list");

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