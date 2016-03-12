'use strict';

MetronicApp.controller('ProductsController',['$rootScope', '$scope', '$timeout','$http','fileUpload','productModel', function($rootScope, $scope, $timeout,$http,fileUpload,productModel) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_products')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  
	});

}]);

MetronicApp.controller('ProductAddController',['$scope','fileUpload','productModel', function($scope,fileUpload,productModel) {

	$scope.categories = [];
	$scope.files = [{}];

	productModel.getCategories().success(function(data){
		$scope.categories = data;
	});

	$scope.childOf = function(categories, parent){
		if(!categories) return [];

		if(!parent || parent==0){
			return categories.filter(function(category){
				return (!category.ancestors || category.ancestors.length==0);
			});
		}

		return categories.filter(function(category){
			return (category.ancestors && category.ancestors.length > 0 && category.ancestors[0]._id == parent);
		});
	}

	$scope.uploadFiles = function(){
		var fileObj = {};

		for(var i in files)
			files["file_"+i] = files[i].thumb;

		fileUpload.uploadFileToUrl(fileObj, data, uploadUrl)
			.success(function(response) {
				console.log(response);
				$location.path("categories/list");

			}).error(function(data, status, headers) {            
				Metronic.alert({
					type: 'danger',
					icon: 'warning',
					message: data,
					container: '.portlet-body',
					place: 'prepend'
				});
			});
	}
}]);