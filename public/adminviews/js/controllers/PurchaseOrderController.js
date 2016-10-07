'use strict';

MetronicApp.controller('PurchaseOrderController',['$rootScope', '$scope', '$timeout', '$http', 'sweetAlert', '$stateParams'
, function($rootScope, $scope, $timeout, $http, sweetAlert, $stateParams) {

	function init() {
		$http.get('/adminapi/purchaseorder/'+$stateParams.id)
		.then(function(res) {

			res.data = res.data[0];

			angular.extend($scope, res.data._id);

			$scope.products = res.data.products;

		});
	}

	init();

	$scope.save = function(shortfall){
		$http.put('/adminapi/purchaseorder/'+$stateParams.id, shortfall?{status:3}:{products:$scope.products})
		.then(function(res) {
            Metronic.alert({
                type: 'success',
                icon: 'check-circle',
                message: "PO updated",
                container: '#info-message',
                place: 'prepend',
                closeInSeconds: 10
            });

			init();
		})
		.catch(function(err) {
            Metronic.alert({
                type: 'danger',
                icon: 'exclamation-circle',
                message: err.data || err.message || "Internal server error!",
                container: '#info-message',
                place: 'prepend',
                closeInSeconds: 10
            });
		})
	};

}])
