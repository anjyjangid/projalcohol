'use strict';

MetronicApp.controller('PurchaseOrderController',['$rootScope', '$scope', '$timeout', '$http', 'sweetAlert'
, function($rootScope, $scope, $timeout, $http, sweetAlert) {

	function init() {
		$http.get('/adminapi/purchaseorder/57ee720d16f2d14e0279f3f5')
		.then(function(res) {

			res.data = res.data[0];

			angular.extend($scope, res.data._id);

			$scope.products = res.data.products;

		});
	}

	init();

	$scope.save = function(shortfall){
		$http.put('/adminapi/purchaseorder/57ee720d16f2d14e0279f3f5', shortfall?{status:3}:{products:$scope.products})
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
