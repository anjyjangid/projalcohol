'use strict';

MetronicApp.controller('SettingsController',['$rootScope', '$scope', '$timeout','$http','$state','settingsModel', function($rootScope, $scope, $timeout,$http,$state,settingsModel) {
	
    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_settings')); // set profile link active in sidebar menu         
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  

		settingsModel.getSettings($state.$current.data.key).success(function(response){			
			$scope.settings = response.settings;
		});

    });    

    $scope.errors = {};
    $scope.currency = [
    	{name:"$",sign:"$"},
    	{name:"£",sign:"£"},
    	{name:"SGD",sign:"SGD"}
    ];
    $scope.language = [
    	{key:"eng",title:"English"}
    ];
	$scope.mode = [
		{key:"dev",title:"Development"},
		{key:"test",title:"Testing"},
		{key:"live",title:"Live"},
		{key:"maintenance",title:"Maintenance"},
	];

	/*$scope.popt = [
      {name:'Fixed Amount'},
      {name:'% Amount'}      
    ];*/

	$scope.popt = ['Fixed Amount','% Amount'];
		

	$scope.update = function(){
		
		var data = $scope.settings;
		
		$scope.errors = {};
		
		//POST DATA WITH FILES
		settingsModel.updateSetting($state.$current.data.key,data).success(function(response){

			$scope.errors = {};

		}).error(function(data, status, headers){

			$scope.errors = data;

		});
	}



}]);
