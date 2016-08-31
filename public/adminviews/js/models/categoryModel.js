MetronicApp.factory('categoryModel', ['$http', '$cookies', function($http, $cookies) {

	var categoryModel = {};

	/**
	 * Check if the credentials are correct from server
	 * and return the promise back to the controller
	 * 
	 * @param  {array} loginData
	 * @return {promise}
	 */
	categoryModel.getCategory = function(categoryId){
			return $http.get("/adminapi/category/detail/"+categoryId);
		},

	categoryModel.submitAccount = function(postedData) {

		return $http({
			headers: {
				'Content-Type': 'application/json'
			},
			url: 'admin/profile/update',
			method: "POST",
			data: {
				first_name: postedData.first_name,
				last_name: postedData.last_name,
				email: postedData.email,
			}
		}).success(function(response){            
			
		}).error(function(data, status, headers) {            
			Metronic.alert({
				type: 'danger',
				icon: 'warning',
				message: data,
				container: '#tab_1_1',
				place: 'prepend',
				closeInSeconds: 3
			});            
		});
	};

	categoryModel.getPricingSettings = function(data){
			return $http.get("/adminapi/setting/settings/pricing");
		},

		
	categoryModel.getParentCategories = function($level){

		if(typeof $level === 'undefined'){
			$level = 'parents';
		}

		return $http({

			headers: {
				'Content-Type': 'application/json'
			},
			url: 'adminapi/category/allparent/'+$level,
			method: "GET",
			data: {
				level: $level,                
			}

		}).success(function(response){
			
		}).error(function(data, status, headers) {            
					  
		});

	};
		

	return categoryModel;
}])
