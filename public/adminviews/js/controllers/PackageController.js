'use strict';

MetronicApp.controller('PackageController',['$rootScope', '$scope', '$timeout','$http','$state','fileUpload','packageModel', function($rootScope, $scope, $timeout,$http,$state,fileUpload,productModel) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_packages')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  		
		
		$scope.package = {
			type:$state.$current.data.type,
			recipe:[]
		};

	});

}]);

MetronicApp.controller('PackageFormController',['$scope', '$location','$stateParams','fileUpload','packageModel', function($scope,$location,$stateParams,fileUpload,packageModel) {

	$scope.itemlist = [];

	if($stateParams.packageid){

	}

	$scope.store = function(){

		var url = 'package/store';

		if($stateParams.productid){
			url = 'package/update/'+$stateParams.packageid;
		}	
		//POST DATA WITH FILES
		packageModel.storePackage($scope.package,url).success(function(response){						
			
		}).error(function(data, status, headers){			
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Please validate all fields.',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });
			$scope.errors = data;			
		});
	}

	$scope.addItem = function(p){
		console.log(p);
	};

	$scope.searchItem = function($event){
		var qry = $event.currentTarget.value;
		if(qry.length>=3){
			Metronic.blockUI({
		        target: $('#orderlist'),				        
		        overlayColor: '#000'
		    });
			packageModel.searchItem(qry).success(function(response){
				$scope.itemlist = response;
				Metronic.unblockUI($('#orderlist'));
			});
		}else{
			$scope.itemlist = [];
		}
	}

}]);