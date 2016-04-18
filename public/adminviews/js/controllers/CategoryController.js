'use strict';

MetronicApp.controller('CategoryController',['$rootScope', '$scope', '$timeout','$http','fileUpload','categoryModel','settingsModel','Slug', function($rootScope, $scope, $timeout,$http,fileUpload,categoryModel,settingsModel,Slug) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_categories')); // set profile link active in sidebar menu         

        // set sidebar closed and body solid layout mode
	    $rootScope.settings.layout.pageBodySolid = false;
	    $rootScope.settings.layout.pageSidebarClosed = false;

    });       

    
    
	angular.extend($scope, {

		categoryFormInit : function(){

			$scope.category = {
				advance_order:{},
				regular_express_delivery:{},
				advance_order_bulk:{},
				express_delivery_bulk:{},
			};
			$scope.categories = [];
			$scope.lthumb = true;

			categoryModel.getPricingSettings().success(function(data){
				$scope.pricing = data;	
			});

			categoryModel.getParentCategories().success(function(response) {

				$scope.categories.push({categoryList: response});

			});
		},

		edittier : function(val,price,t){		
			if(t == 1){
				$scope.category[val] = angular.copy(price);
			}else{
				$scope.category[val] = {};
			}
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
				slug: $scope.category.slug,
				ptitle:'',
				
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


		        }).error(function(data, status, headers) {            
		            Metronic.alert({
		                type: 'danger',
		                icon: 'warning',
		                message: data,
		                container: '.portlet-body',
		                place: 'prepend',
		                closeInSeconds:3
		            });
		        });

		},

	})

   
}]);



MetronicApp.controller('CategoryShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','categoryModel', function($rootScope, $scope, $timeout,$http,$stateParams,categoryModel) {
   

    $scope.categoryData = [];
    

    categoryModel.getCategory($stateParams.categoryid).success(function(data){

		$scope.categoryData = data;

	});

    handleChildCatRecords($stateParams.categoryid);

	angular.extend($scope, {})

   
}]);


MetronicApp.controller('CategoryUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','fileUpload','categoryModel', function($rootScope, $scope, $timeout,$http,$stateParams,fileUpload,categoryModel) {
    
    angular.extend($scope, {

    	categoryFormInit: function(){

			$scope.category = {};
			$scope.categories = [];
			$scope.lthumb = true;
			
			
			categoryModel.getCategory($stateParams.categoryid).success(function(response) {

				$scope.category.title = response.cat_title;
				$scope.category.thumb = response.cat_thumb;
				$scope.category.lthumb = response.cat_lthumb;

			});
			
		},

		submitCategory : function() {
			

			var data = {
				title: $scope.category.title,
				slug: $scope.category.slug,
				ptitle:''
			};
			
			var files = {
				"thumb":$scope.category.thumb,
				"lthumb":$scope.category.lthumb
			};

			var uploadUrl = "admin/category/update/"+$stateParams.categoryid;

			fileUpload.uploadFileToUrl(files, data, uploadUrl)
		        .success(function(response) {
		            
		            //$location.path("categories/list");

		        }).error(function(data, status, headers) {            
		            Metronic.alert({
		                type: 'danger',
		                icon: 'warning',
		                message: data,
		                container: '.portlet-body',
		                place: 'prepend',
		                closeInSeconds: 3
		            });
		        });

		},
    	
    })

   
}]);


