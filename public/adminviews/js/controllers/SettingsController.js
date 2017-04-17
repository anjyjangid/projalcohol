'use strict';

MetronicApp.controller('SettingsController',[
	'$rootScope', '$scope', '$timeout','$http','$state','settingsModel', 
	function($rootScope, $scope, $timeout,$http,$state,settingsModel) {
	
    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_settings')); // set profile link active in sidebar menu         
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  		

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
	
	

}]);

MetronicApp.controller('SettingFormController',['$rootScope', '$scope', '$timeout','$http','$state','settingsModel', function($rootScope, $scope, $timeout,$http,$state,settingsModel) {
	$scope.update = function(checkPostal){
		var data = $scope.settings;
		$scope.errors = {};
		if(checkPostal){
			$scope.invalidPostalCode = false;
			for(var i in data.express_delivery.applicablePostalCodes){
				if(data.express_delivery.applicablePostalCodes[i].length!=2 || Number.isNaN(parseInt(data.express_delivery.applicablePostalCodes[i]))){
					$scope.invalidPostalCode = true;
				}
			}
			if($scope.invalidPostalCode){
				Metronic.alert({type: 'danger',icon: 'warning',message: 'Please fill proper postal codes.',container: '.portlet-body',place: 'prepend',closeInSeconds: 3});
				return false;
			}
		}

		//POST DATA WITH FILES
		if($state.$current.data.key=='announcementBar'){
			//Different action to post announcement
			settingsModel.updateAnnouncement($state.$current.data.key,data).success(function(response){
				$scope.errors = {};
			}).error(function(data, status, headers){
				$scope.errors = data;
			});
		}else{
			settingsModel.updateSetting($state.$current.data.key,data).success(function(response){
				$scope.errors = {};
			}).error(function(data, status, headers){
				$scope.errors = data;
			});
		}
		
	}

	settingsModel.getSettings($state.$current.data.key).success(function(response){
		$scope.settings = response.settings;
		
		if($state.$current.data.key == 'pricing'){
			if(typeof $scope.settings.surcharge_taxes == 'undefined')
				$scope.settings.surcharge_taxes = {label:'Services & taxes',types:[],category:'surcharge_taxes'};

			if(typeof $scope.settings.tempsurcharge == 'undefined')
				$scope.settings.tempsurcharge = true;
		}
		
		$scope.master = angular.copy($scope.settings); 
	});

	$scope.reset = function() {
		$scope.settings = angular.copy($scope.master);
	};

}]);

MetronicApp.controller('SettingPrinterController',['$rootScope', '$scope', '$timeout','$http','$state','settingsModel', function($rootScope, $scope, $timeout,$http,$state,settingsModel) {
	//To authroize google account and get cloud priters access token
	$scope.authorizeGoogleAccount = function(){
		$http.get("/adminapi/setting/authorize-google-account/").success(function(response){
			if(response.success){
				
				//$sce.trustAsResourceUrl(response.url);
				window.location.href = response.url;
				//window.open(success.url,500,500);
			}
		});
	}

	$scope.printers = [];

	$http.get("/adminapi/setting/printerlist/").success(function(response){
		$scope.printerData = response;		
	});

	$scope.update = function(){
		settingsModel.updatePrinter($scope.printerData);		
	}

}]);

MetronicApp.controller('SettingHomeBannerController',
	['$rootScope', '$scope', '$timeout','$http','$state','settingsModel', 
	function($rootScope, $scope, $timeout,$http,$state,settingsModel){

		// get saved data
		settingsModel.getSettings($state.$current.data.key).success(function(response){
			$scope.bannerSettings = response.settings;
		});

		$scope.update = function(){
			var data = $scope.bannerSettings;
			$scope.errors = {};

			//POST DATA WITH FILES
			settingsModel.updateHomeBanner($state.$current.data.key,data).success(function(response){
				$scope.errors = {};
			}).error(function(data, status, headers){
				$scope.errors = data;
			});
		}

}]);