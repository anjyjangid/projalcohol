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

        },

        getGiftcard : function(){
            return $http.get('/adminapi/giftcategory/giftcard');
        },

        getCategorylist : function(){
            return $http.get('/adminapi/giftcategory/categorylist');
        }             

    };
}]);

MetronicApp.factory('giftcategoryModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        get: function(Id){
            //get is used to get data, Laravel router automatically redirect to get function 
            return $http.get("/adminapi/giftcategory/"+Id+"/edit");
        },       

        store: function(fields,id){
            //put is used to store data, Laravel router automatically redirect to store function 
            if(id!=null){
                var fields = objectToFormData(fields);
                return $http.post('/adminapi/giftcategory/update/'+id, fields, {
                    transformRequest: angular.identity,                             
                    headers: {'Content-Type': undefined}
                });        
            }else{
                var fields = objectToFormData(fields);
                return $http.post('/adminapi/giftcategory', fields, {
                    transformRequest: angular.identity,                             
                    headers: {'Content-Type': undefined}
                });            
            }
            
        },

        getParentlist: function(){
            return $http.get('/adminapi/giftcategory/allparent');
        }
    };
}])