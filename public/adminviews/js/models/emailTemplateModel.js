MetronicApp.factory('emailTemplateModel', ['$http', '$cookies','$location', function($http, $cookies, $location) {

    return {
        
        getTemplate: function(templateId){
            return $http.get("/admin/emailtemplate/gettemplate/"+templateId);
        },       

        storePage: function(fields){
	       	
	        return $http.post("/admin/emailtemplate", fields, {
	            
	        }).error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '.portlet-body',
	                place: 'prepend',
	                //closeInSeconds: 5
	            });
	        })
	        .success(function(response) {	            
	            
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: "Dealer successfully added",//response.message,
	                container: '#info-message',
	                place: 'prepend',
	                closeInSeconds: 5
	            });
	            $location.path("cms/list");

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

        updateTemplate: function(fields,templateId){
	       	
	       	//put is used to updated data, Laravel router automatically redirect to update function 

	        return $http.put("/admin/emailtemplate/"+templateId, fields, {
	            
	        }).error(function(data, status, headers) {            
	            Metronic.alert({
	                type: 'danger',
	                icon: 'warning',
	                message: 'Please enter all required fields.',
	                container: '.portlet-body',
	                place: 'prepend',
	                //closeInSeconds: 5
	            });
	        })
	        .success(function(response) {	            
	            
	            Metronic.alert({
	                type: 'success',
	                icon: 'check',
	                message: response.message,
	                container: '#info-message',
	                reset: false,
	                place: 'prepend',	                
	                closeInSeconds: 5
	            });
	            $location.path("emailtemplates/list");

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

        }       

    };
}])