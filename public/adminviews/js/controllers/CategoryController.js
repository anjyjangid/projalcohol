'use strict';

MetronicApp.controller('CategoryController',['$rootScope', '$scope', '$timeout','$http','$stateParams','fileUpload','categoryModel', function($rootScope, $scope, $timeout,$http,$stateParams,fileUpload,categoryModel) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_categories')); // set profile link active in sidebar menu         
    });
    
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  

    console.log($stateParams.categoryid);
    
    
	angular.extend($scope, {

		categoryFormInit : function(){

			$scope.category = {};
			$scope.categories = [];
			$scope.lthumb = true;
			categoryModel.getParentCategories().success(function(response) {				
				//$scope.category.ptitle = response;
				$scope.categories.push({categoryList: response});
			});
			
		},



		
		setParentSubCategory : function(i){	

			$scope.loading = true;
			while($scope.categories.length-1>i){
				$scope.categories.pop();
			}

			if(!$scope.categories[i].selectedPtitle){
				$scope.loading = false;
				return false;
			}

			categoryModel.getParentCategories($scope.categories[i].selectedPtitle._id).success(function(response) {
				$scope.loading = false;

				if(response.length){
			
					$scope.categories.push({categoryList: response});
				}

			});

		},
		

		submitCategory : function() {
			

			var data = {
				title: $scope.category.title,
				ptitle:''
			};

			if($scope.categories[0].categoryList.length>0){
				
				var catLength = $scope.categories.length;

				var lastParentSelected = $scope.categories[catLength - 1];
								
				if(typeof(lastParentSelected.selectedPtitle)=="undefined" || lastParentSelected.selectedPtitle=="null"){

					if(catLength>1){

						var lastParentSelected = $scope.categories[$scope.categories.length - 2];

					}

				}
				
				if(typeof(lastParentSelected.selectedPtitle)!=="undefined" && lastParentSelected.selectedPtitle){

					data.ptitle = lastParentSelected.selectedPtitle._id;

				}

			}

			var files = {
				"thumb":$scope.category.thumb,
				"lthumb":$scope.category.lthumb
			};


			var uploadUrl = "admin/category/store";
			fileUpload.uploadFileToUrl(files, data, uploadUrl)
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

		},

	})

   
}]);



MetronicApp.controller('CategoryShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','categoryModel', function($rootScope, $scope, $timeout,$http,$stateParams,categoryModel) {
   
    $scope.categoryData = [];

    categoryModel.getCategoryDetail($stateParams.categoryid).success(function(data){
		$scope.categoryData = data;
	});
        
	angular.extend($scope, {})

   
}]);


