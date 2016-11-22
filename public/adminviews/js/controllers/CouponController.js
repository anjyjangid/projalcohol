'use strict';

MetronicApp.controller('CouponController',['$rootScope', '$scope', '$timeout','$http', 'sweetAlert', '$q', function($rootScope, $scope, $timeout,$http,sweetAlert,$q) {

	$scope.$on('$viewContentLoaded', function() {
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_discounts')); // set cms link active in sidebar menu
	});

	// set sidebar closed and body solid layout mode
	$rootScope.settings.layout.pageBodySolid = false;
	$rootScope.settings.layout.pageSidebarClosed = false;

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
			if(grid){
				grid.getDataTable().ajax.reload();
			}
		})
	}
}]);

MetronicApp.controller('CouponAddController',['$rootScope','$scope','$http','$stateParams','couponModel','packageModel', function($rootScope,$scope,$http,$stateParams,couponModel,packageModel) {

	$scope.itemlist = [];

	$scope.searching = false;
	$scope.isupdate = false;
	$scope.errors = {};

	$scope.coupon = {
		/*status:"1",
		type:"1",*/
		saleProductId:[],
		saleProductDetail:[],
		saleCategoryId:[],
		saleCategoryDetail:[]
	};

	$scope.coupon;
	$scope.coupon.discount_status = 0;
	$scope.coupon.status = 1;

	if($stateParams.couponId){

		$scope.isupdate = true;

		couponModel.getCoupon($stateParams.couponId).success(function(response){

			if(response.saleProductDetail){
				response.saleProductId = response.saleProductDetail.map(function(prod){
					return prod._id.$id;
				})
			}

			if(response.saleCategoryDetail){
				response.saleCategoryId = response.saleCategoryDetail.map(function(cat){
					return cat._id.$id;
				})
			}

			angular.extend($scope.coupon, response);

			setTimeout(function(){ // to perform this action after the current thread
				if (jQuery().datepicker) {
					$('.date-picker').datepicker({
						rtl: Metronic.isRTL(),
						orientation: "left",
						autoclose: true
					});
				}
			})

		}).error(function(data, status, headers){

			Metronic.alert({
				type: 'danger',
				icon: 'warning',
				message: 'Coupon not found',
				container: '#main-container.portlet-body',
				place: 'prepend',
				closeInSeconds: 3
			});

		});
	}
	else if (jQuery().datepicker) {
		$('.date-picker').datepicker({
			rtl: Metronic.isRTL(),
			orientation: "left",
			autoclose: true
		});
	}

	$scope.store = function(){

		var data = angular.copy($scope.coupon);
		data.products = data.saleProductId;
		data.categories = data.saleCategoryId;

		delete data.saleProductId;
		delete data.saleProductDetail;
		delete data.saleCategoryId;
		delete data.saleCategoryDetail;

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

	$scope.addItem = function(p,currentIdObj,currentDetailObj){
		p.added = true;

		//EMPTY THE OBJ SO THAT USER CANNOT ADD MORE THAN 1 PRODUCT
		if($scope.searchType == 'offerproduct'){
			currentDetailObj.splice(0,1);
			currentIdObj.splice(0,1);
		}

		currentDetailObj.push(angular.copy(p));
		currentIdObj.push(angular.copy(p._id));
	};

	$scope.searchItem = function($event,searchType){

		var qry = $event.currentTarget.value;
		if(qry.length>=3){
			$scope.searching = true;
			(function(qry,searchType){
				if(searchType == 'product' || searchType == 'offerproduct')
					return $http.get("/adminapi/package/searchproduct",{params:{length:10,qry:qry}});
				else
					return $http.get("/adminapi/category/searchcategory",{params:{length:10,qry:qry}});
			}(qry,searchType)).success(function(response){
				$scope.itemlist = response;
				$scope.searching = false;
			});
		}else{
			$scope.itemlist = [];
		}
	};

	$scope.removeItem = function(index,idObj,detailObj){
		detailObj.splice(index,1);
		idObj.splice(index,1);
	}

	$scope.checkItem = function(currentIdObj){

		if(!$scope.itemlist) return [];

		return $scope.itemlist.filter(function(item){
			angular.forEach(currentIdObj, function (pro) {
				if  (pro === item._id) {
					item.added = true;
				}else if($scope.searchType == 'offerproduct'){
					item.added = false;
				}
			});
			return item;
		});
	}

	$scope.clearSearch = function(searchType,currentIdObj,currentDetailObj){

		if(searchType == 'product' || searchType == 'offerproduct'){
			$scope.popTitle = 'product';
		}else{
			$scope.popTitle = 'category';
		}

		$scope.searchType = searchType;
		$scope.currentIdObj = currentIdObj;
		$scope.currentDetailObj = currentDetailObj;
		$scope.searchbox = '';
		$scope.itemlist = [];
	}

}]);