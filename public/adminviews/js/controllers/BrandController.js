'use strict';

MetronicApp.controller('BrandController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_brand')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 

MetronicApp.controller('BrandAddController',['$rootScope','$scope','$http','fileUpload','brandModel', function($rootScope,$scope,$http,fileUpload,brandModel) {
	
	$scope.errors = {};

	$scope.brand = {		
		status:"1"
	};

	$scope.store = function(){
		
		var data = objectToFormData($scope.brand);
		
		//POST DATA WITH FILES
		brandModel.storeBrand(data).success(function(response){

		}).error(function(data, status, headers){

			$scope.errors = data;

		});
	}

}]);


MetronicApp.controller('BrandUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','brandModel', function($rootScope, $scope, $timeout,$http,$stateParams,brandModel) {
    
    $scope.errors = {};
	
	brandModel.getBrand($stateParams.brandid).success(function(response){

		$scope.brand = response;

	});

	$scope.editorOptions = {
                language: 'en',
                uiColor: '#cfcfcf'
            };
	
	$scope.store = function(){
			
		//POST DATA WITH FILES
		brandModel.update($scope.brand,$stateParams.brandid).success(function(response){
			

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}
   
}]);


MetronicApp.controller('BrandPageShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','$sce','brandModel', function($rootScope, $scope, $timeout,$http,$stateParams,$sce,brandModel) {
   
    $scope.page = [];
    
    brandModel.getPage($stateParams.pageid).success(function(response){

		$scope.page = response;		
		$scope.page.content = $sce.trustAsHtml($scope.page.content);

	});
    
	  
}]);


