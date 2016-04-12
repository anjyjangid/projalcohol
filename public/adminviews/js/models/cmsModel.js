MetronicApp.factory('cmsModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getPage: function(pageId){
            return $http.get("/admin/cms/getpage/"+pageId);
        },       

        storePage: function(fields){
	       	
	        return $http.post("/admin/cms", fields, {
	            
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
	            $location.path("cms/list");

	        })
	        /*.error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: data,
	                container: '.portlet-body',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	        });*/

        },     

        updatePage: function(fields,pageId){
	       	
	       	//put is used to updated data, Laravel router automatically redirect to update function 

	        return $http.put("/admin/cms/"+pageId, fields, {
	            
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
	            $location.path("cms/list");

	        })
	        /*.error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: data,
	                container: '.portlet-body',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	        });*/

        }       

    };
}])