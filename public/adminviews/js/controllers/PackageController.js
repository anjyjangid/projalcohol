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
			recipe:[],
			products:[],
			packageItems:[]
		};

	});

}]);

MetronicApp.controller('PackageFormController',['$scope', '$location','$stateParams','$state','fileUpload','packageModel', function($scope,$location,$stateParams,$state,fileUpload,packageModel) {

	$scope.itemlist = [];

	$scope.searching = false;

	if($stateParams.packageid){

	}

	$scope.store = function(){

		var url = 'package/store';

		if($stateParams.productid){
			url = 'package/update/'+$stateParams.packageid;
		}	
		//POST DATA WITH FILES
		packageModel.storePackage($scope.package,url).success(function(response){						
			
			var redirect = ($state.$current.data.type==1)?'packages/party':'packages/cocktail';
			$location.path(redirect);

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
		p.added = true;
		p.quantity = 1;
		$scope.package.packageItems.push(angular.copy(p));
		$scope.package.products.push(angular.copy(p._id));
	};

	$scope.searchItem = function($event){
		var qry = $event.currentTarget.value;
		if(qry.length>=3){
			$scope.searching = true;
			packageModel.searchItem(qry).success(function(response){
				$scope.itemlist = response;
				$scope.searching = false;
			});
		}else{
			$scope.itemlist = [];
		}
	};

	$scope.removeItem = function(i){
		$scope.package.packageItems.splice(i,1);
		$scope.package.products.splice(i,1);
	}

	$scope.checkItem = function(){

		if(!$scope.itemlist) return [];

		return $scope.itemlist.filter(function(item){
			if($scope.package.products.indexOf(item._id) > -1){
				item.added = true;
			}
			return item;
		});

	}

	$scope.clearSearch = function(){
		$scope.searchbox = '';
		$scope.itemlist = [];
	}

}]);