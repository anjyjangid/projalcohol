MetronicApp.factory('productgroupModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

	return {		
		store: function(fields){		

			return $http.post("/adminapi/productgroup", fields).error(function(data, status, headers) {            
				Metronic.alert({
					type: 'danger',
					icon: 'warning',
					message: 'Please validate all fields.',
					container: '.portlet-body',
					place: 'prepend',
					closeInSeconds: 3
				});
			});
		},

		update: function(fields,id){
			return $http.put("/adminapi/productgroup/"+id, fields).error(function(data, status, headers) {            
				Metronic.alert({
					type: 'danger',
					icon: 'warning',
					message: 'Please validate all fields.',
					container: '.portlet-body',
					place: 'prepend',
					closeInSeconds: 3
				});
			});
		},

		getProductgroup: function(productid){
			return $http.get("/adminapi/productgroup/detail/"+productid);
		},

	};
}]);