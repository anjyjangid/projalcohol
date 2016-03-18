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
            return $http.get("/admin/category/getcategory/"+categoryId);
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
                place: 'prepend'
            });            
        });
    };

        
    categoryModel.getParentCategories = function($level){

        if(typeof $level === 'undefined'){
            $level = '';
        }

        return $http({

            headers: {
                'Content-Type': 'application/json'
            },
            url: 'admin/category/getparentcategories/'+$level,
            method: "GET",
            data: {
                level: $level,                
            }

        }).success(function(response){

            


        }).error(function(data, status, headers) {            
                      
        });

    };
    
    categoryModel.update = function(postedData) {

        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: 'admin/profile/updatepassword',
            method: "POST",
            data: {
                current_password: postedData.current_password,
                new_password: postedData.new_password,
                retype_password: postedData.retype_password,
            }
        }).success(function(response) {            
            //$cookies.put('auth', JSON.stringify(response));
        }).error(function(data, status, headers) {            
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: data,
                container: '#tab_1_3',
                place: 'prepend'
            });            
        });
    };

    return categoryModel;
}])
