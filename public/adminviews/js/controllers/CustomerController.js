'use strict';

MetronicApp.controller('CustomerController',[
	'$q','$rootScope', '$scope', '$timeout','$http','customerModel', 'sweetAlert',
	function($q,$rootScope, $scope, $timeout,$http,customerModel,sweetAlert) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_user')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  
		
	});	

}]);

MetronicApp.controller("CustomerImportController",['$scope','$stateParams','$q','$http','sweetAlert',function ($scope,$stateParams,$q,$http,sweetAlert){	

	$scope.importCSV = function() {
		sweetAlert.swal({
			title: "Import CSV",
			text: "Select the csv file",
			input: "file",
			inputAttributes: {
				accept: ".csv"
			},
			showCancelButton: true,
			showLoaderOnConfirm: true,
			allowOutsideClick: false,	
			preConfirm: function(file) {
				
				if(!file || (file && file.type != 'text/csv'))
					return $q(function(resolve, reject){
						reject("Please select a csv file");
					})
				var fd = new FormData();
				fd.append('csv', file);

				return $http.post('/adminapi/customer', fd, {
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
			if(grid){
				grid.getDataTable().ajax.reload();
			}
		})
	}


	if($stateParams.import==='true'){
		$scope.importCSV();
	}

}]);

MetronicApp.controller('CustomerAddController',['$scope', '$http','customerModel', function($scope,$http,customerModel) {
	
	$scope.errors = {};

	$scope.customer = {
		status:"1",
		country_code : '65'
	};	
	
	$scope.store = function(){

		var data = $scope.customer;	
		
		//POST DATA WITH FILES
		customerModel.storeCustomer(data).success(function(response){

		}).error(function(data, status, headers){						

			$scope.errors = data;

		});
	}

}]);


MetronicApp.controller('CustomerUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','customerModel', function($rootScope, $scope, $timeout,$http,$stateParams,customerModel) {

	customerModel.getCustomer($stateParams.customerid).success(function(data){

		if(!angular.isDefined(data.country_code)){
			data.country_code = '65';
		}
		$scope.customer = data;
		$scope.hideBasicInfo = true; 
	});

	$scope.store = function(){

		var data = $scope.customer;		
		//POST DATA WITH FILES
		customerModel.updateCustomer(data,$stateParams.customerid).success(function(response){
			//$location.path("customer/list");
		}).error(function(data, status, headers){						
			$scope.errors = data;			
		});
	}

}]);