'use strict';

MetronicApp.controller('TimeslotController',['$rootScope', '$scope', '$timeout','$http','$state', function($rootScope, $scope, $timeout,$http,$state) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_timeslots')); // set profile link active in sidebar menu         
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageSidebarClosed = false;  		
		$rootScope.settings.layout.pageBodySolid = false;	
	});	

	$scope.getTimeOptions = function(forVal){
		var idnot = (forVal == 1)?1430:0;
		return $rootScope.timerange.filter(function(topt){
			return (topt.opVal!=idnot);
		});
	};

	$scope.weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

}]);

MetronicApp.controller('TimeslotFormController',['$rootScope', '$scope', '$timeout','$http','$state', function($rootScope, $scope, $timeout,$http,$state) {
	
	$scope.error = [];

	$http.get("/admin/setting/settings/timeslot").success(function(response){			
		$scope.settings = response.settings;
	});	

	$scope.update = function(){

		$http.put("/admin/setting/timeslot", $scope.settings, {
                
        }).error(function(data, status, headers) {            
            $scope.error = data;
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
            Metronic.alert({
                type: 'success',
                icon: 'check',
                message: response.message,
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });
        })

	};
}]);