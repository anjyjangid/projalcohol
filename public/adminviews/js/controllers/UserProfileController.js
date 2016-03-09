'use strict';

MetronicApp.controller('UserProfileController',['$rootScope', '$scope', '$timeout','userModel', function($rootScope, $scope, $timeout,userModel) {
    

    $scope.$on('$viewContentLoaded', function() {
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', null);  
        userModel.getUserDetails().success(function(response) {
            $scope.user = response;
        });        
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = true;
    $rootScope.settings.layout.pageSidebarClosed = false;  

	/*$scope.user = {
        old_password :'',
        password :'',
        password_confirm :'',
	};*/
    
    angular.extend($scope, {
        
        submitAccount: function(accountForm) {
        	        	
            var data = {
                first_name: $scope.user.first_name,
                last_name: $scope.user.last_name,
                email: $scope.user.email
            };

            userModel.submitAccount(data).then(function() {
                Metronic.alert({
                    type: 'success',
                    icon: 'success',
                    message: 'Profile updated successfully',
                    container: '#tab_1_1',
                    place: 'prepend'
                });
                //alert("update successfully");
            });
        },

        changePassword: function(accountForm) {
                        
            var data = {
                old_password: $scope.user.old_password,
                password: $scope.user.password,
                password_confirm: $scope.user.password_confirm
            };

            userModel.changePassword(data).then(function() {
                Metronic.alert({
                    type: 'success',
                    icon: 'success',
                    message: 'Password updated successfully',
                    container: '#tab_1_3',
                    place: 'prepend'
                });
                $scope.user.old_password = '';
                $scope.user.password = '';
                $scope.user.password_confirm = '';
                //alert("update successfully");
            });
        },

    });
        
    

}]); 
