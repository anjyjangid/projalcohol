'use strict';

MetronicApp.controller('UserProfileController',['$rootScope', '$scope', '$timeout','userModel', function($rootScope, $scope, $timeout,userModel) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_profile')); // set profile link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = true;
    $rootScope.settings.layout.pageSidebarClosed = false;  

	$scope.user = {

	};

    angular.extend($scope, {
        
        submitAccount: function(accountForm) {
        	        	
            var data = {
                first_name: $scope.user.first_name,
                last_name: $scope.user.last_name,
                email: $scope.user.email
            };

            userModel.submitAccount(data).then(function() {
                alert("update successfully");
            });
        },
        

        

    });
        
    

}]); 
