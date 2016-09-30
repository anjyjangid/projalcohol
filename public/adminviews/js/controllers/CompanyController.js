'use strict';

MetronicApp.controller('CompanyController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_settings')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 

MetronicApp.controller('CompanyFormController',[
	'$rootScope', '$scope', '$timeout','$http','$stateParams', '$location',
	function($rootScope, $scope, $timeout,$http,$stateParams,$location) {

	//SET DEFAULTS
	$scope.company = {
		status:1		
	};


	$http.get("/adminapi/global/getcountries").success(function(response){
		$scope.countries = response;
	});

	if($stateParams.companyId){
		$http.get('/adminapi/company/'+$stateParams.companyId).success(function(response){
			$scope.company = response;
		}).error(function(){
			$location.path('company/list');
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Invalid company.',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });
		});
	}

	$scope.store = function(){

		var fd = objectToFormData($scope.company);	       	  

		$http.post('/adminapi/company/update/'+$stateParams.companyId, fd, {			
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		}).success(function(){
			$location.path('company/list');
		}).error(function(data, status, headers) {            
			$scope.errors = data;
			Metronic.alert({
				type: 'danger',
				icon: 'warning',
				message: 'Please validate all fields.',
				container: '.portlet-body',
				place: 'prepend',
				closeInSeconds: 3
			});
		});

	};

}]); 