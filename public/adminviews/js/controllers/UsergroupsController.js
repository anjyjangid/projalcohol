'use strict';

MetronicApp.controller('UsergroupsController',['$rootScope', '$scope', '$timeout','$http','$state', function($rootScope, $scope, $timeout,$http,$state) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu         
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageSidebarClosed = false;
		$rootScope.settings.layout.pageBodySolid = false;	
	});		

}]);

MetronicApp.controller('UsergroupsFormController',['$rootScope', '$scope', '$timeout','$http','$state', '$stateParams', function($rootScope, $scope, $timeout,$http,$state,$stateParams) {
	
	$scope.errors = [];

    $scope.usergroups = {};	

    $http.get('/adminapi/usergroup/pageslist').success(function(response){
        $scope.pagelistOptions = response;
    });

    if($stateParams.id){
        $http.get("/adminapi/usergroup/usergroupid/"+$stateParams.id).success(function(response){           
            $scope.usergroups = response;
        });
    }   

	$scope.store = function(){

        var url = '/adminapi/usergroup/usergroup';

        if($stateParams.id){
            url += '/'+$stateParams.id;
        }

		$http.post(url, $scope.usergroups, {
                
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
            $state.go('userLayout.usergroups.list');
        })

	};

    $scope.addPages = function(){

        var url = '/adminapi/usergroup/addpagelist';

        $http.post(url, $scope.pagelist, {
                
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
            $scope.pagelist = '';
            Metronic.alert({
                type: 'success',
                icon: 'success',
                message: 'Page Added in the List.',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });
            //$state.go('userLayout.usergroups.pagelist');
        })

    };
}]);