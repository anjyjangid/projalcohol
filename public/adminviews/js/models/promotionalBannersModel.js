MetronicApp.factory('promotionalBannersModel', ['$http', '$cookies','$location', function($http, $cookies, $location){

    return {

        getPromotionalBanner: function(promotionalbannerId){
            return $http.get("/adminapi/promotionalbanners/promotionalbanner/"+promotionalbannerId);
        },

        storePromotionalBanner: function(postedData){

        	var formMultipartData = objectToFormData(postedData);

	        return $http.post("/adminapi/promotionalbanners", formMultipartData, {
	        	transformRequest: angular.identity,
            	headers: {'Content-Type': undefined}
	        }).error(function(data, status, headers){
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
	                message: "Banner successfully added", //response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("promotionalbanners/list");
	        });
        },

        updatePromotionalBanner: function(postedData,promotionalbannerId){

	       	var formMultipartData = objectToFormData(postedData);

	        return $http.post("/adminapi/promotionalbanners/update/"+promotionalbannerId, formMultipartData, {
	        	transformRequest: angular.identity,
            	headers: {'Content-Type': undefined}
	        }).error(function(data, status, headers){
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
	            $location.path("promotionalbanners/list");
	        })
        }
    };
}]);