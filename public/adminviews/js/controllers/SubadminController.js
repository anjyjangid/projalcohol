'use strict';

MetronicApp.controller('SubadminController',['$rootScope', '$scope', '$timeout','$http','$state', function($rootScope, $scope, $timeout,$http,$state) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu         
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageSidebarClosed = false;  		
		$rootScope.settings.layout.pageBodySolid = false;	
	});		

}]);

MetronicApp.controller('SubadminFormController',['$rootScope', '$scope', '$timeout','$http','$state', '$stateParams', function($rootScope, $scope, $timeout,$http,$state,$stateParams) {
	
	$scope.errors = [];

    $scope.subadmin = {};	

    $http.get('/adminapi/stores/storelist').success(function(response){
        $scope.storeList = response;
    });

    $http.get('/adminapi/usergroup/usergroup').success(function(response){
        $scope.usergroup = response;
    });

    if($stateParams.id){
        $http.get("/adminapi/admin/subadminuser/"+$stateParams.id).success(function(response){           
            $scope.subadmin = response;
        });
    }   

	$scope.store = function(){

        var url = '/adminapi/admin/subadmin';

        if($stateParams.id){
            url += '/'+$stateParams.id;
        }

		$http.post(url, $scope.subadmin, {
                
        }).error(function(data, status, headers) {            
            $scope.errors = data;
            Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Please enter all required fields.',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });
        })
        .success(function(response) {                           
            $scope.error = []; 
            $state.go('userLayout.subadmin.list');            
        })

	};
}]);