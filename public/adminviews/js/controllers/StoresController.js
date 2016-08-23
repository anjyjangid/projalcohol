'use strict';

MetronicApp.controller('StoresController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_settings')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  


}]); 

MetronicApp.controller('StoreFormController',[
	'$rootScope','$scope','$http','$stateParams','storeModel', 
	function($rootScope,$scope,$http,$stateParams,storeModel) {
	
	$scope.errors = {};	

	if($stateParams.storeId){

		$scope.isupdate = true;

		storeModel.getStore($stateParams.storeId).success(function(response){									
			
			$scope.storeInfo = response;

		}).error(function(data, status, headers){
						
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Store not found',
                container: '.portlet-body',
                place: 'prepend',                
            });

		});
	}

	$scope.store = function(){
		
		var data = $scope.storeInfo;
		
		if($stateParams.storeId){

			storeModel.update(data,$stateParams.storeId).success(function(response){

			}).error(function(data, status, headers){
				$scope.errors = data;
			});

		}else{
			storeModel.store(data).success(function(response){

			}).error(function(data, status, headers){

				$scope.errors = data;

			});	
		}		
	}
}]);

