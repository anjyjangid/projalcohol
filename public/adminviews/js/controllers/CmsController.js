'use strict';

MetronicApp.controller('CmsController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_cms')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  

    $scope.pagesection = [
    	{name:'Customer Service',value:'services'},
    	{name:'About AlcoholDelivery',value:'about'},
    	/*{name:'Corporate',value:'corporate'}    	*/
    ];
    
}]); 

MetronicApp.controller('CmsAddController',['$scope','$http','cmsModel', function($scope,$http,cmsModel) {
	
	$scope.errors = {};

	$scope.dealer = {		
		status:"1",
		contacts : [{}]
	};	
		
	$http.get("/admin/global/getcountries").success(function(response){
		$scope.countries = response;
	});
	
	$scope.contactRemove = function(i){
		
		$scope.dealer.contacts.splice(i, 1);
	}

	$scope.store = function(){

		var data = $scope.dealer;	
		
		//POST DATA WITH FILES
		cmsModel.storeDealer(data).success(function(response){

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

}]);


MetronicApp.controller('CmsUpdateController',['$rootScope', '$scope','$http','$timeout','$stateParams','cmsModel', function($rootScope, $scope, $http, $timeout, $stateParams, cmsModel) {
    
    $scope.errors = {};
	
	cmsModel.getPage($stateParams.pageid).success(function(response){

		$scope.page = response;

		$scope.editorOptions = {
			language: 'en',
			uiColor: '#cfcfcf'
		};

	});

	
	
	$scope.update = function(){

		var data = $scope.page;	
		
		//POST DATA WITH FILES
		cmsModel.updatePage(data,$stateParams.pageid).success(function(response){
			

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

	$scope.hasFile = function(){

		if($scope.page.coverImage != '' && typeof $scope.page.coverImage === 'string'){
			return true;
		}
		return false;
	}
   
}]);


MetronicApp.controller('CmsPageShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','$sce','cmsModel', function($rootScope, $scope, $timeout,$http,$stateParams,$sce,cmsModel) {
   
    $scope.page = [];
    
    cmsModel.getPage($stateParams.pageid).success(function(response){

		$scope.page = response;		
		$scope.page.content = $sce.trustAsHtml($scope.page.content);

	});
    
	  
}]);


