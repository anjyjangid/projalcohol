'use strict';

MetronicApp.controller('BusinessController',['$rootScope', '$scope', '$timeout','$http','businessModel', '$q'
, function($rootScope, $scope, $timeout,$http,businessModel, $q) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  
		
	});

}]);

MetronicApp.controller('BusinessAddController',['$scope', '$http','businessModel', function($scope,$http,businessModel) {
	
	$scope.errors = {};
	$scope.business = {		
		status:"1",
		address : [{}],
		// delivery_address : [{}]
	};	
	
	$scope.store = function(){

		var data = $scope.business;	
		
		//POST DATA WITH FILES
		businessModel.storeBusiness(data).success(function(response){

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

	$scope.billingAddressRemove = function(i){
		
		// $scope.business.billing_address.splice(i, 1);
		$scope.business.address.splice(i, 1);
	}

	$scope.deliveryAddressRemove = function(i){
		
		$scope.business.delivery_address.splice(i, 1);
	}	

}]);


MetronicApp.controller('BusinessUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','businessModel', '$q'
, function($rootScope, $scope, $timeout,$http,$stateParams,businessModel, $q) {

	$scope.errors = {};
	$scope.business = {		
		status:"1",
		address : [{}],
		products: []
		// delivery_address : [{}]
	};

	if($stateParams.businessid){
		businessModel.getBusiness($stateParams.businessid).success(function(data){
			console.log($stateParams.businessid);
			
			if(!data.products)
				data.products = [];
			$scope.business = data;
			if(typeof data.address == 'undefined'){
				$scope.business.address = [{}];
			}
			$scope.hideBasicInfo = true;
			$scope.business._id = $stateParams.businessid;
		});
	}

	$scope.store = function(){
		$scope.productInfoIncompelete = false;
		
		for(var i in $scope.business.products){
			if(!$scope.business.products[i].disc){
				$scope.productInfoIncompelete = true;
				break;
			}
		}
		if($scope.productInfoIncompelete){
			Metronic.alert({type: 'danger',icon: 'warning',message: 'Please fill all products discount.',container: '.portlet-body',place: 'prepend',closeInSeconds: 3});
			return false;
		}

		if($stateParams.businessid){
			$scope.business._id = $stateParams.businessid;
			businessModel.updateBusiness($scope.business, $stateParams.businessid)
			.success(function(response){
				//$location.path("business/list");
			}).error(function(data, status, headers){						
				$scope.errors = data;			
			});
		}else{
			var data = $scope.business;
			// console.log(data);
			// return false;
			//POST DATA WITH FILES
			businessModel.storeBusiness(data).success(function(response){
			}).error(function(data, status, headers){
				$scope.errorss = data;
			});
		}
	}

	$scope.billingAddressRemove = function(i){
		$scope.business.address.splice(i, 1);
	}

	// $scope.deliveryAddressRemove = function(i){
		
	// 	$scope.business.delivery_address.splice(i, 1);
	// }	

	$scope.product = { searchBox: null, waitQueue: null, reqTimeout: $q.defer() };

	$scope.searchItem = function(){
		var qry = $scope.product.searchBox;

		if($scope.product.waitQueue)
			$timeout.cancel($scope.product.waitQueue);

		if(qry && qry.length>=3) {
			$scope.searching = true;

			$scope.product.waitQueue = $timeout(function(){
				$scope.product.reqTimeout.resolve();
				$scope.product.reqTimeout = $q.defer();
				$http.get("/adminapi/package/searchproduct",{params:{length:10,qry:qry}, timeout: $scope.product.reqTimeout.promise})
				.then(function(response) {

					response.data.forEach(function(item){
						for(var i in $scope.business.products){
							if($scope.business.products[i]._id == item._id){
								item.added=true;
								break;
							}
						}
					})

					$scope.itemlist = response.data;
				})
				.finally(function() {
					$scope.searching = false;
				});
			}, 600);
		}
		else {
			$scope.itemlist = [];
		}
	};

	$scope.$watch('product.searchBox', $scope.searchItem);

	$scope.addItem = function(p){
		p.added = true;
		p.quantity = 1;
		console.log(angular.copy(p));
		$scope.business.products.push(angular.copy(p));
	};

	$scope.removeItem = function(proKey){
		$scope.business.products.splice(proKey,1);
	}


	$scope.searchLocation = function(q){
		return $http.get('/site/search-location', {params: {q}})
		.then(function(res){
			return res.data;
		});
	}
	
	$scope.locationSelect = function(location, model, label, index) {
		location.location = [parseFloat(location.LAT),parseFloat(location.LNG)];
		var data  = $scope.business.address[index];
		for ( var key in location ) {
			data[key] = location[key];
	 	}
		$scope.business.address[index] = data;
	}

}]);