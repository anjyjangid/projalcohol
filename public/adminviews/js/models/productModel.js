MetronicApp.factory('productModel', ['$http', '$cookies', function($http, $cookies) {

    return {
        getCategories: function(){
            return $http.get("/admin/category/getparentcategories/all");
        },

        saveProduct: function(data){
            return $http.post("/admin/product/store", {data:data});
        }
    };
}])
