MetronicApp.factory('packageModel', ['$http', '$cookies', '$rootScope', function($http, $cookies, $rootScope) {
    
    return {
    	storePackage: function(fields,url){
	       	var fd = objectToFormData(fields);	       	  
	        return $http.post("/adminapi/"+url, fd, {
	            transformRequest: angular.identity,	            	            
	            headers: {'Content-Type': undefined}
	        });
	    },   
	    searchItem: function(qry){	       	
	        return $http.get("/adminapi/package/searchproduct",{params:{length:10,qry:qry}});
	    },
	    getPackage: function(packageid,type){
            return $http.get("/adminapi/package/detail/"+packageid+"/"+type);
        }
    };

}]);
