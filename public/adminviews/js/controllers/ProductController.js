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

	$scope.general = {categories:[],images:[]};
	$scope.meta = {};
	$scope.datePopup = [false, false];
	$scope.categories = [];
	$scope.imageFiles = [{}];
	$scope.notuploaded = true;																																																							

	productModel.getCategories().success(function(data){
		$scope.categories = data;
	});

	$scope.datePopupOpen = function($event, i){
		$event.preventDefault();
		$event.stopPropagation();

		$scope.datePopup[i] = true;
	}

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

	$scope.selectCategory = function(id){
		var i = $scope.general.categories.indexOf(id);
		if(i>-1)
			$scope.general.categories.splice(i, 1);
		else
			$scope.general.categories.push(id);
	}

	$scope.imageRemove = function(i){
		$scope.imageFiles.splice(i, 1);
	}

	$scope.uploadFiles = function(){
		var fileObj = {};

		for(var i in $scope.imageFiles){
			fileObj["file_"+i] = $scope.imageFiles[i].thumb;

		}
		console.log(fileObj); 
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

	$scope.save = function(){
		productModel.saveProduct({general:$scope.general, meta:$scope.meta}).success(function(response){
			console.log(response);
		}).error(function(response){
			console.log(response);
		});
	}
}]);