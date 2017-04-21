MetronicApp.factory('promotionalBannersModel',
['$http', '$cookies', '$location', 'sweetAlert',
function($http, $cookies, $location, sweetAlert){

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
	        }).success(function(response){
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
	        }).success(function(response){
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
        },

        removePromotionalBanner: function(promotionalbannerId){
	    	sweetAlert.swal({
				title: "Are you sure?",
				text: "You will not be able to recover them!",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, remove!",
				closeOnConfirm: false,
				closeOnCancel: false
			}).then(
				function(isConfirm){
					if(isConfirm){
						$http.delete("/adminapi/promotionalbanners/"+promotionalbannerId)
						.success(function(response){
							if(response.success){
								sweetAlert.swal("Deleted!", response.message, "success");
								grid.getDataTable().ajax.reload();//var grid = new Datatable(); Datatable should be init like this with global scope
							}else{
								sweetAlert.swal("Cancelled!", response.message, "error");
							}
						}).error(function(data, status, headers){
							sweetAlert.swal("Cancelled", data.message, "error");
						})
					}else{
						sweetAlert.swal("Cancelled", "Record(s) safe :)", "error");
					}
				}
			);
	    },

	    updateDisplayOrder: function(formData){

	    	sweetAlert.swal({
				title: "Are you sure?",
				text: "You will not be able to recover them!",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Yes, update!",
				closeOnConfirm: false,
				closeOnCancel: false
			}).then(
				function(isConfirm){
					if(isConfirm){
						// Posting data to php file
						$http({
							url: "/adminapi/promotionalbanners/updatedisplayorder",
							method: "POST",
							data: formData
						})
						.success(function(response){
							if(response.success){
								sweetAlert.swal("Display Order Updated!", response.message, "success");
								grid.getDataTable().ajax.reload();//var grid = new Datatable(); Datatable should be init like this with global scope
							}else{
								sweetAlert.swal("Cancelled!", response.message, "error");
							}
						}).error(function(data, status, headers){
							sweetAlert.swal("Cancelled", data.message, "error");
						});
					}else{
						sweetAlert.swal("Cancelled", "Record(s) safe :)", "error");
					}
				}
			);
	    },

    };
}]);