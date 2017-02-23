'use strict';

MetronicApp.controller('DashboardController', function($rootScope, $scope, $http, $timeout,$filter) {

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
        avgOrders:0,
        upcomingdays:[]        
    };

    $http.get('/adminapi/admin/stats').then(function(response){
        $scope.stats = response.data;
        $scope.stats.upcomingdays = [];    
        if($scope.stats.upcomingholidays.length){

            var today = new Date();
            today.setTime($scope.stats.start);            
            var range = $scope.stats.range;
            for(var i = 0;i < range;i++){                
                if(i != 0)
                    today.shiftDays(1);

                var checkHoliday = $filter('filter')($scope.stats.upcomingholidays, {timeStamp:today.getTime()})[0];                
                //CHECK PH
                if(typeof checkHoliday != 'undefined')
                    $scope.stats.upcomingdays.push({timeStamp:today.getTime(),title:checkHoliday.title});
                //CHECK WEEKENDS DAYS  
                var checkWeekend = $filter('filter')($scope.stats.upcomingholidays, {dow:today.getDay()})[0];
                if(typeof checkWeekend != 'undefined')
                    $scope.stats.upcomingdays.push({timeStamp:today.getTime(),title:checkWeekend.title});
            }

        }            
        
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