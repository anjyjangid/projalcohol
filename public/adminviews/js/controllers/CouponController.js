'use strict';

MetronicApp.controller('CouponController',['$rootScope', '$scope', '$timeout','$http', 'sweetAlert', '$q', function($rootScope, $scope, $timeout,$http,sweetAlert,$q) {

    $scope.$on('$viewContentLoaded', function() {   
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_discounts')); // set cms link active in sidebar menu 
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;  

    $scope.selected = function(file) {
    	console.log(file)
    }

    $scope.importCSV = function() {
    	sweetAlert.swal({
			title: "Import CSV",
			text: "Select the input file<br><a href=\"/adminviews/coupons.csv\">Click here to Download the format</a>",
			input: "file",
			inputAttributes: {
				accept: ".csv"
			},
			showCancelButton: true,
			closeOnCancel: false,
			showLoaderOnConfirm: true,
			preConfirm: function(file) {
				console.log(file);
				if(!file)
					return $q(function(resolve, reject){
						reject("Please select a csv file");
					})
				var fd = new FormData();
				fd.append('csv', file);

				return $http.post('/adminapi/coupon/import', fd, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				})
				.catch(function(err){
					if(err.data && typeof err.data == "string")
						throw(new Error(err.data));
					if(err.data)
						throw(new Error(err.data.err[0]+"<br>\nOn Row: "+err.data.row_number+", Coupon: "+err.data.data.code));
					
					throw err;	
				})
			}
		}).then(function(data) {
			console.log(data);
		})
    }
}]); 

MetronicApp.controller('CouponAddController',['$rootScope','$scope','$http','$stateParams','couponModel','packageModel', function($rootScope,$scope,$http,$stateParams,couponModel,packageModel) {
	
	$scope.itemlist = [];

	$scope.searching = false;
	$scope.isupdate = false;
	$scope.errors = {};

	$scope.coupon = {		
		status:"1",
		type:"1",
	};

	angular.coupon = $scope.coupon;
	
	if($stateParams.couponId){

		$scope.isupdate = true;

		couponModel.getCoupon($stateParams.couponId).success(function(response){									
			
			$scope.coupon = response;

		}).error(function(data, status, headers){
						
			Metronic.alert({
                type: 'danger',
                icon: 'warning',
                message: 'Coupon not found',
                container: '.portlet-body',
                place: 'prepend',
                closeInSeconds: 3
            });

		});
	}

	$scope.store = function(){
		
		var data = $scope.coupon;
		
		if($stateParams.couponId){

			couponModel.update(data,$stateParams.couponId).success(function(response){

			}).error(function(data, status, headers){

				$scope.errors = data;

			});

		}else{
			couponModel.storeCoupon(data).success(function(response){

			}).error(function(data, status, headers){

				$scope.errors = data;

			});	
		}
		//POST DATA WITH FILES
		
	}

}]);