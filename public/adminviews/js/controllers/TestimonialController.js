'use strict';

MetronicApp.controller('TestimonialController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_testimonial')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 

MetronicApp.controller('TestimonialAddController',['$rootScope','$scope','$http','fileUpload','testimonialModel', function($rootScope,$scope,$http,fileUpload,testimonialModel) {
	
	$scope.errors = {};

	$scope.testimonial = {		
		status:"1"
	};

	$scope.store = function(){
		
		var data = objectToFormData($scope.testimonial);
		
		//POST DATA WITH FILES
		testimonialModel.storeTestimonial(data).success(function(response){

		}).error(function(data, status, headers){

			$scope.errors = data;

		});
	}

}]);


MetronicApp.controller('TestimonialUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','testimonialModel', function($rootScope, $scope, $timeout,$http,$stateParams,testimonialModel) {
    
    $scope.errors = {};
	
	testimonialModel.getTestimonial($stateParams.testimonialid).success(function(response){

		$scope.testimonial = response;

	});

	$scope.editorOptions = {
                language: 'en',
                uiColor: '#cfcfcf'
            };
	
	$scope.store = function(){
			
		//POST DATA WITH FILES
		testimonialModel.update($scope.testimonial,$stateParams.testimonialid).success(function(response){
			

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}
   
}]);


MetronicApp.controller('TestimonialPageShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','$sce','testimonialModel', function($rootScope, $scope, $timeout,$http,$stateParams,$sce,testimonialModel) {
   
    $scope.page = [];
    
    testimonialModel.getPage($stateParams.pageid).success(function(response){

		$scope.page = response;		
		$scope.page.content = $sce.trustAsHtml($scope.page.content);

	});
    
	  
}]);


