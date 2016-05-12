'use strict';

MetronicApp.controller('TimeslotController',['$rootScope', '$scope', '$timeout','$http','$state', function($rootScope, $scope, $timeout,$http,$state) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_timeslots')); // set profile link active in sidebar menu         
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageSidebarClosed = false;  		
		$rootScope.settings.layout.pageBodySolid = false;	
	});

	$scope.timerange = [
		{opVal:0,opTag:'12:00 am'},
	    {opVal:30,opTag:'12:30 am'},
	    {opVal:60,opTag:'01:00 am'},
	    {opVal:90,opTag:'01:30 am'},
	    {opVal:120,opTag:'02:00 am'},
	    {opVal:150,opTag:'02:30 am'},
	    {opVal:180,opTag:'03:00 am'},
	    {opVal:210,opTag:'03:30 am'},
	    {opVal:240,opTag:'04:00 am'},
	    {opVal:270,opTag:'04:30 am'},
	    {opVal:300,opTag:'05:00 am'},
	    {opVal:330,opTag:'05:30 am'},
	    {opVal:360,opTag:'06:00 am'},
	    {opVal:390,opTag:'06:30 am'},
	    {opVal:420,opTag:'07:00 am'},
	    {opVal:450,opTag:'07:30 am'},
	    {opVal:480,opTag:'08:00 am'},
	    {opVal:510,opTag:'08:30 am'},
	    {opVal:540,opTag:'09:00 am'},
	    {opVal:570,opTag:'09:30 am'},
	    {opVal:600,opTag:'10:00 am'},
	    {opVal:630,opTag:'10:30 am'},
	    {opVal:660,opTag:'11:00 am'},
	    {opVal:690,opTag:'11:30 am'},
	    {opVal:720,opTag:'12:00 pm'},
	    {opVal:750,opTag:'12:30 pm'},
	    {opVal:780,opTag:'01:00 pm'},
	    {opVal:810,opTag:'01:30 pm'},
	    {opVal:840,opTag:'02:00 pm'},
	    {opVal:870,opTag:'02:30 pm'},
	    {opVal:900,opTag:'03:00 pm'},
	    {opVal:930,opTag:'03:30 pm'},
	    {opVal:960,opTag:'04:00 pm'},
	    {opVal:990,opTag:'04:30 pm'},
	    {opVal:1020,opTag:'05:00 pm'},
	    {opVal:1050,opTag:'05:30 pm'},
	    {opVal:1080,opTag:'06:00 pm'},
	    {opVal:1120,opTag:'06:30 pm'},
	    {opVal:1150,opTag:'07:00 pm'},
	    {opVal:1180,opTag:'07:30 pm'},
	    {opVal:1210,opTag:'08:00 pm'},
	    {opVal:1240,opTag:'08:30 pm'},
	    {opVal:1270,opTag:'09:00 pm'},
	    {opVal:1300,opTag:'09:30 pm'},
	    {opVal:1330,opTag:'10:00 pm'},
	    {opVal:1370,opTag:'10:30 pm'},
	    {opVal:1400,opTag:'11:00 pm'},
	    {opVal:1430,opTag:'11:30 pm'},
	];

	$scope.getTimeOptions = function(forVal){
		var idnot = (forVal == 1)?1430:0;
		return $scope.timerange.filter(function(topt){
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