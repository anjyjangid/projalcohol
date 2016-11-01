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
	            // $location.path("business/list");

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
			
			fields = angular.copy(fields);

			for(var i in fields.products){
				if(fields.products[i].disc)
					fields.products[i] = {
						_id: fields.products[i]._id,
						disc: fields.products[i].disc,
						type: fields.products[i].type
					};
				else
					fields.products[i] = null;
			}

			fields.products = fields.products.filter(function(p){ return p; });

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