MetronicApp.factory('saleModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getSale: function(id){
            return $http.get("/adminapi/sale/"+id);
        },       

        store: function(fields){
        	   	      
	        return $http.post("/adminapi/sale", fields, {	        
	            
	        }).error(function(data, status, headers) {            

	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '.mcontainer',
	                place: 'prepend'	                
	            });

	        })
	        .success(function(response){	            
	            
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: 'Sale added successfully',
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("sale/list");

	        });

        },     

        update: function(fields,id){

	       	//put is used to updated data, Laravel router automatically redirect to update function 
	        return $http.put("/adminapi/sale/"+id, fields, {

	        }).error(function(data, status, headers) {
	        
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '.mcontainer',
	                place: 'prepend'	                
	            });

	        })
	        .success(function(response) {	            

	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: 'Sale updated successfully',
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 3
	            });
	            $location.path("sale/list");	            

	        });
	        

        },

        searchItem: function(qry,searchType){
        	if(searchType == 'product' || searchType == 'offerproduct')	       	
	        	return $http.get("/adminapi/package/searchproduct",{params:{length:10,qry:qry}});
	        else
	        	return $http.get("/adminapi/category/searchcategory",{params:{length:10,qry:qry}});
	    },

    };
}])