'use strict';

MetronicApp.controller('CategoryController',['$rootScope', '$scope', '$timeout','$http','fileUpload','categoryModel', function($rootScope, $scope, $timeout,$http,fileUpload,categoryModel) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_categories')); // set profile link active in sidebar menu         
    });
    
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  

    $scope.category = {};
    
	angular.extend($scope, {

		categoryFormInit : function(){

			$scope.categories = [];
			$scope.lthumb = true;
			categoryModel.getParentCategories().success(function(response) {				
				//$scope.category.ptitle = response;
				$scope.categories.push({categoryList: response});
			});
			
		},

		
		setParentSubCategory : function(i){

			if(!$scope.categories[i].selectedPtitle){
				return false;
			}

			$scope.loading = true;
			while($scope.categories.length-1>i){
				$scope.categories.pop();
			}

			categoryModel.getParentCategories($scope.categories[i].selectedPtitle._id).success(function(response) {
				$scope.loading = false;
				if(response.length){
			
					$scope.categories.push({categoryList: response});
				}

			});

		},
		

		submitCategory : function() {
						
			var lastParentSelected = $scope.categories[$scope.categories.length - 1];
						
			var data = {
				title: $scope.category.title,
				ptitle:''
			};

			if(lastParentSelected.categoryList.length && typeof(lastParentSelected.selectedPtitle)!="undefined"){

				data.ptitle = lastParentSelected.selectedPtitle._id

			}

			var files = {
				"thumb":$scope.category.thumb,
				"lthumb":$scope.category.lthumb
			};

			var uploadUrl = "admin/category/store";
			fileUpload.uploadFileToUrl(files, data, uploadUrl);

		},

	})

   
}]); 
