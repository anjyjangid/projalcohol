'use strict';

MetronicApp.controller('DashboardController', function($rootScope, $scope, $http, $timeout) {

    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_dashboard'));
		$rootScope.settings.layout.pageBodySolid = false;
    	$rootScope.settings.layout.pageSidebarClosed = false;
    });   

    $scope.stats = {
        totalProducts:0,
        totalOrder:0,
        avgOrders:0
    };

    $http.get('/adminapi/admin/stats').then(function(response){
        $scope.stats = response.data;
    });    
});

MetronicApp.controller('ProductInventoryController', function($rootScope, $scope, $http, $timeout) {
    $scope.product = {};
    $scope.errors = [];
    $scope.update = function(){
        $http.post("/admin/product/updateinventory", $scope.product, {
                
        }).error(function(data, status, headers) {            
            $scope.errors = data;            
        })
        .success(function(response) {               
            $scope.errors = []; 
            reloadGrid(); 
        });
    }
});