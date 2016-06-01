'use strict';

MetronicApp.controller('EmailTemplateController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_emailtemplate')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 

MetronicApp.controller('emailTemplateAddController',['$scope','$http','emailTemplateModel', function($scope,$http,emailTemplateModel) {
	
	$scope.errors = {};

	$scope.dealer = {		
		status:"1",
		contacts : [{}]
	};	
		
	$http.get("/adminapi/global/getcountries").success(function(response){
		$scope.countries = response;
	});
	
	$scope.contactRemove = function(i){
		
		$scope.dealer.contacts.splice(i, 1);
	}

	$scope.store = function(){

		var data = $scope.dealer;	
		
		//POST DATA WITH FILES
		emailTemplateModel.storeDealer(data).success(function(response){

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

}]);

MetronicApp.controller('EmailTemplateUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','emailTemplateModel', function($rootScope, $scope, $timeout,$http,$stateParams,emailTemplateModel) {
    
    $scope.errors = {};
	
	emailTemplateModel.getTemplate($stateParams.templateid).success(function(response){
		$scope.template = response;		
	});

	$scope.editorOptions = {
                
                
            };
	
	$scope.update = function(){

		var data = $scope.template;	
		
		//POST DATA WITH FILES
		emailTemplateModel.updateTemplate(data,$stateParams.templateid).success(function(response){
			

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

   
}]);


MetronicApp.controller('EmailTemplateShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','$sce','emailTemplateModel', function($rootScope, $scope, $timeout,$http,$stateParams,$sce,emailTemplateModel) {
   
    $scope.template = [];
    
    emailTemplateModel.getTemplate($stateParams.templateid).success(function(response){

		$scope.template = response;		
		$scope.template.content = $sce.trustAsHtml($scope.template.content);

	});
    
	  
}]);


