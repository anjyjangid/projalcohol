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

MetronicApp.controller('PackageFormController',['$scope', '$location','$stateParams','$state','sweetAlert','fileUpload','packageModel', function($scope,$location,$stateParams,$state,sweetAlert,fileUpload,packageModel) {

	$scope.itemlist = [];

	$scope.searching = false;

	$scope.currentGroup = 0;

	if($stateParams.packageid){

		packageModel.getPackage($stateParams.packageid,$state.$current.data.type).success(function(response){									
			
			$scope.package = response;

		}).error(function(data, status, headers){			
			var redirect = ($state.$current.data.type==1)?'packages/party':'packages/cocktail';
			$location.path(redirect);
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Please validate all fields.',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });
		});
	}

	$scope.store = function(){

		var url = 'package/store';

		if($stateParams.packageid){
			url = 'package/update/'+$stateParams.packageid;
		}
		
		$scope.defaultError = [];
		if($scope.package.type==1){
			angular.forEach($scope.package.packageItems,function(packageItem,packageItemIndex){

			var totalDefault = 0;

			angular.forEach(packageItem.products,function(product){

				if(product.default)
				totalDefault+=product.defaultQty

			})

			if(totalDefault!==0 && totalDefault!==packageItem.quantity){
				$scope.defaultError[packageItemIndex] = true;
			}

		})
		}else{

			angular.forEach($scope.package.packageItems,function(packageItem,packageItemIndex){

				var defaultIndex = packageItem.defaultIndex;				

				angular.forEach(packageItem.products,function(product,index){

					product.defaultQty = 0;
					product.default = false;
					
					if(defaultIndex===index){
						product.defaultQty = 1;
						product.default = true;
					}

				})
				
			})

		}

		if($scope.defaultError.length!==0){

			sweetAlert.swal({
				type:'error',										
				text:"default quantity doesn't match required quantity"
			});

			return false;
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
                container: '.mbody',
                place: 'prepend',
                //closeInSeconds: 3
            });
			$scope.errors = data;			
		});
	}

	$scope.addItem = function(p){
		p.added = true;
		p.quantity = 1;
		
		var cg = $scope.currentGroup;

		$scope.package.packageItems[cg].products.push(angular.copy(p));		

		//$scope.package.packageItems.push(angular.copy(p));
		
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

	$scope.removeItem = function(packKey,proKey,proId){		
		$scope.package.packageItems[packKey].products.splice(proKey,1);
		$scope.removeProduct(proId);
	}

	$scope.removeGroupItem = function(packKey){		
		angular.forEach($scope.package.packageItems[packKey].products, function(value, key) {
			$scope.removeProduct(value._id);
		});
		$scope.package.packageItems.splice(packKey,1);		
	}

	$scope.removeProduct = function(proId){
		$scope.package.products.filter(function(pval,pkey){
			if(pval == proId){
				$scope.package.products.splice(pkey,1);				
			}
		});
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

	$scope.clearSearch = function(cg){
		$scope.currentGroup = cg;
		$scope.searchbox = '';
		$scope.itemlist = [];
	}

}]);