'use strict';

MetronicApp.controller('PurchaseOrderController',['$rootScope', '$scope', '$timeout', '$http', 'sweetAlert', '$stateParams'
, function($rootScope, $scope, $timeout, $http, sweetAlert, $stateParams) {

	$scope.$on('$viewContentLoaded', function() {
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_products')); // set cms link active in sidebar menu
    });
	
	function init() {
		$http.get('/adminapi/purchaseorder/'+$stateParams.id)
		.then(function(res) {

			res.data = res.data[0];

			angular.extend($scope, res.data._id);

			$scope.products = res.data.products;

		});
	}

	if($stateParams.id)
		init();

	$scope.save = function(shortfall){
		
		/*alert('Purchase order update is under construction!');
		return false;*/

		var req = {};
		req.products = $scope.products;
		if(shortfall)
			req.status = 3;

		$http.put('/adminapi/purchaseorder/'+$stateParams.id, req)
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
