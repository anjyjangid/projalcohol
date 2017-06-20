MetronicApp.factory('productModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

	return {
		getCategories: function(){
			return $http.get("/adminapi/category/allparent/all");
		},

		getDealers: function(){
			return $http.get("/adminapi/dealer/list");
		},       

		getSettings: function(data){
			return $http.get("/adminapi/setting/settings/pricing");
		},
		searchItem: function(qry){
			return $http.get("/adminapi/package/searchproduct",{params:{length:10,qry:qry}});
		},
		storeProduct: function(fields){

			var fd = objectToFormData(fields);	       	  

			return $http.post("/adminapi/product", fd, {
				
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}

			}).error(function(data, status, headers) {            
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

		updateProduct: function(fields,id){

			var fd = objectToFormData(fields);

			return $http.post("/adminapi/product/update/"+id, fd, {
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			}).error(function(data, status, headers) {            
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

		getProduct: function(productid){
			return $http.get("/adminapi/product/detail/"+productid);
		},

		getGroups: function(){
			return $http.get("/adminapi/productgroup/listgroup");
		}
	};
}]);