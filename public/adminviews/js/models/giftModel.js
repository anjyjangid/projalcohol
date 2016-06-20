MetronicApp.factory('giftModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        get: function(Id){
            //get is used to get data, Laravel router automatically redirect to get function 
            return $http.get("/adminapi/gift/"+Id);
        },       

        store: function(url,fields){
	       	//put is used to store data, Laravel router automatically redirect to store function 
	        var fields = objectToFormData(fields);
            return $http.post(url, fields, {
                transformRequest: angular.identity,                             
                headers: {'Content-Type': undefined}
            });        

        }             

    };
}])