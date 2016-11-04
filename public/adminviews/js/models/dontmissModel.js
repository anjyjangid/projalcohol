MetronicApp.factory('dontmissModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        get: function(id){
			return $http.get("adminapi/dontmiss");
        },

        store: function(fields){

			return $http.post("/adminapi/dontmiss", fields, {

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
	                message: "successfully updated",
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });	            

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

        searchItem: function(qry){
			return $http.get("/adminapi/package/searchproduct",{params:{length:10,qry:qry}});
		},

    };
}])