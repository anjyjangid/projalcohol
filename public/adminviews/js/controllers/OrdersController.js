'use strict';

MetronicApp.controller('OrdersController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {
    $scope.$on('$viewContentLoaded', function() {
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_orders')); // set profile link active in sidebar menu
    });
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

}]);

MetronicApp.controller('OrderUpdateController',['$rootScope', '$scope', '$timeout','$http','$stateParams','orderModel', function($rootScope, $scope, $timeout,$http,$stateParams,orderModel) {
    $scope.errors = {};
	$http.get("/adminapi/global/getcountries").success(function(response){
		$scope.countries = response;
	});
	orderModel.getOrder($stateParams.orderid).success(function(response){
		$scope.order = response;
		$scope.order.address.country=$scope.order.address.country._id.$id;
	});
	$scope.contactRemove = function(i){
		$scope.order.contacts.splice(i, 1);
	}
	$scope.update = function(){
		var data = $scope.order;
		//POST DATA WITH FILES
		orderModel.updateOrder(data,$stateParams.orderid).success(function(response){
		}).error(function(data, status, headers){
			$scope.errors = data;
		});
	}

}]);

MetronicApp.controller('OrderShowController',['$rootScope', '$scope', '$timeout','$http','$stateParams','orderModel', function($rootScope, $scope, $timeout,$http,$stateParams,orderModel) {
    $scope.order = [];
    angular.orderModel = orderModel;
    orderModel.getOrder($stateParams.order).success(function(response){
		$scope.order = response;

		//$scope.shipping = response.user.address[response.delivery.address.key];
		$scope.serviceCharge = 0;
		if($scope.service.express.status){
			$scope.serviceCharge += $scope.service.express.charges;
		}

		if($scope.service.smoke.status){
			$scope.serviceCharge += $scope.service.smoke.charges;
		}

	});
	$scope.setStatus = function(status){
		orderModel.setStatus($scope.order._id,status);
	}

}]);

MetronicApp.controller('OrderCreateController',['$scope', '$http', '$timeout', 'alcoholCart', '$modal', '$filter'
, function($scope, $http, $timeout, alcoholCart, $modal, $filter){
	angular.alcoholCart = alcoholCart;

	$scope.cart = alcoholCart.getCart();

	$scope.cart.orderType = "consumer";

	$scope.cart.addresses = [];

	$scope.autoComplete = function(term, field, api){
		if(!api)
			api = $scope.cart.orderType;

		if(api=='business')
			api = '/adminapi/business/autocomplete/'+(field?field:'email');
		else
			api = '/adminapi/customer/autocomplete/'+(field?field:'email');

		var params = {q:term};

		return $http.get(api, {params})
		.then(function(res){
			return res.data;
		})
	}

	$scope.customerSelect = function(customer) {
		$scope.cart[$scope.cart.orderType] = customer;
		delete $scope.cart[($scope.cart.orderType=='consumer')?'business':'consumer'];

		var api;
		if($scope.cart.orderType=='business')
			api = '/adminapi/business/detail/'+customer._id;
		else
			api = '/adminapi/customer/detail/'+customer._id;

		$http.get(api)
		.then(function(res){
			$scope.cart.addresses = res.data.address;
			$scope.cart.savedCards = res.data.savedCards;
		});
	}

	$scope.updateConsumer = function(){

		var api;
		if($scope.cart.orderType=='business')
			api = '/adminapi/business/save';
		else
			api = '/adminapi/customer/save';

		if(!$scope.cart[$scope.cart.orderType]._id) {
			$scope.cart.addresses = [];
			$scope.cart.savedCards = [];
		}

		$scope.savingCust = true;
		delete $scope.errors;
		$http.post( api, angular.extend({status: 1}, $scope.cart[$scope.cart.orderType]) )
		.then(function(res){
			if(res.data._id)
				$scope.cart[$scope.cart.orderType]._id = res.data._id;
		})
		.catch(function(err){
			$scope.errors = err.data;
		})
		.finally(function(){
			$scope.savingCust = false;
		});
	}

	$scope.qualifyFor = function(section){

		if(!$scope.cart || !$scope.cart[$scope.cart.orderType] || !$scope.cart[$scope.cart.orderType]._id){
			return false;
		}
		else if(!$scope.cart.addresses[$scope.cart.selectedAddress] && !$scope.cart.addresses[$scope.cart.selectedBilAddr]) {
			return section=='address';
		}
		else
			return true;
	}

	$scope.newAddress = function(address){
		if(!$scope.cart[$scope.cart.orderType]._id) return;

		$modal.open({
			templateUrl: 'newAddress.html',
			controller: 'NewAddressModel',
			backdrop: false,
			resolve: {
				detail: function(){
					return {
						user: $scope.cart[$scope.cart.orderType],
						type: $scope.cart.orderType,
						addrType: address
					}
				}
			}
		})
		.result.then(function (address) {
			$scope.cart.addresses.push(address);

			var api;
			if($scope.cart.orderType=='business')
				api = '/adminapi/business/addresses/'+$scope.cart[$scope.cart.orderType]._id;
			else
				api = '/adminapi/customer/addresses/'+$scope.cart[$scope.cart.orderType]._id;

			$http.get(api)
			.then(function(res){
				$scope.cart.addresses = res.data.address;
			});
		});
	}

	$scope.clearProp = function(ob, prop) {
		if(!ob) return;

		delete ob[prop];
	}
}])
.controller('NewAddressModel',[ '$scope', '$modalInstance', 'NgMap', '$http', 'detail'
, function($scope, $modalInstance, NgMap, $http, detail) {
	$scope.cancel = $modalInstance.dismiss;

	$scope.type = 1;

	$scope.address;

	$scope.searchLocation = function(q){
		return $http.get('/site/search-location', {params: {q}})
		.then(function(res){
			return res.data;
		});
	}

	$scope.locationSelect = function(location) {
		$scope.address = location;

		var point = new google.maps.LatLng(parseFloat(location.LAT),parseFloat(location.LNG));

		$scope.map.setCenter(point);
		$scope.marker.setPosition(point);
	}

	console.log(detail);

	$scope.save = function(){
		$scope.savingData = true;

		var api;
		if(detail.type=='business')
			api = '/adminapi/business/address/'+detail.user._id;
		else
			api = '/adminapi/address/'+detail.user._id;

		$http.post(api, $scope.address)
		.then(function(res){
			$modalInstance.close($scope.address);
		})
		.catch(function(err){
			$scope.errors = err.data;
		})
		.finally(function(){
			$scope.savingData = false;
		})
	}

	// Google map auto complete code start //
	NgMap.getMap().then(function(map) {
		$scope.map = map;
		angular.map = map;
		// setTimeout(function() {
		// 	var point = new google.maps.LatLng(1.290270,103.851959);
		// 	$scope.map.setZoom(12);
		// 	$scope.marker = new google.maps.Marker({
		// 		position: point,
		// 		map: $scope.map,
		// 	});
		// 	$scope.map.setCenter(point);
		// }, 500);
	});
	// Google map auto complete code ends //
}])

.controller('OrderProductsController',['$scope', '$http', '$timeout', '$mdDialog', 'alcoholCart', 'categoriesService', 'productFactory', '$q'
, function($scope, $http, $timeout, $mdDialog, alcoholCart, categoriesService, productFactory, $q){
	angular.alcoholCart = alcoholCart;
	angular.categoriesService = categoriesService;
	$scope.alcoholCart = alcoholCart;
	$scope.categories = {};
	$scope.selectedproduct = "";
	$scope.selected = {
		product : '',
	}
	$scope.catSelected = {
		parent : '',
		sub : ''
	};
	$scope.$watch("catSelected",function(){
		$scope.itemlist = [];
		$scope.productquery = '';
	},true);
	$scope.itemlist = [];
	categoriesService.init().then(
		function(parentChildCategories){
			$scope.categories = parentChildCategories;
		}
	);
	var searchTimeout, searchHttpTimeout = $q.defer();
	$scope.$watch('productquery',function(newValue, oldValue){
		if(typeof newValue === 'undefined'){
			return false;
		}
		var qry = newValue;
		if(searchTimeout){
			$timeout.cancel(searchTimeout);
			searchTimeout = null;
			searchHttpTimeout.resolve()
			searchHttpTimeout = $q.defer();
		}
		if(qry.length>=3){
			searchTimeout = $timeout(function() {
				$scope.searching = true;
				// var searchParams = {
				// 	qry : qry,
				// 	parentCategory : $scope.catSelected.parent == ''?'':$scope.catSelected.parent._id,
				// 	subCategory : $scope.catSelected.sub == ''?'':$scope.catSelected.sub._id
				// };
				var searchParams = { search: qry, categories: [] };
				if($scope.catSelected.parent)
					searchParams.categories.push($scope.catSelected.parent._id);
				if($scope.catSelected.sub)
					searchParams.categories.push($scope.catSelected.sub._id);
				searchParams.categories = searchParams.categories.join(',');
				$http.get("/adminapi/product/productsearch", {
					params : searchParams,
					timeout: searchHttpTimeout.promise
				})
				.success(function(response) {
					angular.forEach(response, function(value, key){
						response[key] = new productFactory(value);
					});
					$scope.itemlist = response;
					$scope.searching = false;
				});
			}, 600);
		}else{
			$scope.itemlist = [];
			$scope.selected.product=null;
		}
	})
	$scope.checkItem = function(){
		if(!$scope.itemlist) return [];
		return $scope.itemlist.filter(function(item){
			if  (alcoholCart.getProductById(item._id)) {
				item.added = true;
			}
			return item;
		});
	}
	var proUpdateTimeOut = {};
	$scope.addtocart = function(key,type){
		if(proUpdateTimeOut[key]){
			$timeout.cancel(proUpdateTimeOut[key]);
		}
		proUpdateTimeOut[key] = $timeout(function() {
			alcoholCart.addProduct(key, {
				chilled: parseInt($scope.cart.products[key].qChilled),
				nonChilled: parseInt($scope.cart.products[key].qNChilled)
			}, type=='qChilled');
		},600);
	};
	$scope.remove = function(key,type){
		alcoholCart.addProduct(key, {
			chilled: type=='qChilled'?0:parseInt($scope.cart.products[key].qChilled),
			nonChilled: type!='qChilled'?0:parseInt($scope.cart.products[key].qNChilled)
		}, type=='qChilled');
	};
	$scope.giftcard = function(ev,key) {
		$mdDialog.show({
				controller: "OrderGiftCardController",
				templateUrl: '/adminviews/views/orders/order/giftCard.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
			})
			.then(function(answer) {
			}, function() {
			});
	}
	$scope.package = function(ev) {
		$mdDialog.show({
				controller: "OrderPackageController",
				templateUrl: '/adminviews/views/orders/order/searchpackage.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
			})
			.then(function(answer) {
			}, function() {
			});
	}

}])

.controller('OrderProductDetailController',['$scope', '$http', 'alcoholCart', 'categoriesService', 'productFactory',function($scope, $http, alcoholCart, categoriesService, productFactory){

}])

.controller('OrderPackageController',['$scope', '$http', '$mdDialog', 'alcoholCart', 'categoriesService',function($scope, $http, $mdDialog, alcoholCart, categoriesService){
	$scope.categories = [
		{
			key : "",
			title : "All"
		},
		{
			key : "party",
			title : "Party"
		},
		{
			key : "cocktail",
			title : "Cocktail"
		}
	];
	$scope.catSelected = $scope.categories[0];
	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};

}])

.controller('OrderGiftCardController',['$scope', '$http', '$mdDialog', 'alcoholCart', 'alcoholGifting', function($scope, $http, $mdDialog, alcoholCart, alcoholGifting){
	$scope.hide = function() {
		$mdDialog.hide();
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};
		$scope.btnText = 'add to cart';
		$scope.processing = true;
		$scope.gift = {}
		$http.get('/giftcategory/giftcard')
			.success(function(result){
				$scope.gift = result;
				$scope.gift.recipient = {price:$scope.gift.cards[0].value,quantity:1};
				$scope.processing = false;
				$scope.addCard = function(){
					$scope.processing = true;
					alcoholGifting.addUpdateGiftCard($scope.gift).then(
						function(successRes){
							$mdDialog.cancel();
						},
						function(errorRes){
							$scope.errors = errorRes.data;
						}
					).finally(function(res){
						$scope.processing = false;
					});
				}
			})
			.error(function(err){});

}])

.controller('OrderDeliveryController',['$scope', '$http', 'alcoholCart',function($scope, $http, alcoholCart){

	$scope.alcoholCart = alcoholCart;
	$scope.timeslot = alcoholCart.$cart.timeslot;
	$scope.localDate = new Date();
	if($scope.timeslot.slug){
		$scope.myDate = new Date($scope.timeslot.slug);
	}else{
		$scope.myDate = new Date();
		$scope.myDate.setDate($scope.myDate.getDate()+1);
	}
	$scope.localDate.setDate($scope.localDate.getDate()+1);
	$scope.minDate = new Date(
		$scope.localDate.getFullYear(),
		$scope.localDate.getMonth(),
		$scope.localDate.getDate()
	);
	$scope.maxDate = new Date(
		$scope.localDate.getFullYear(),
		$scope.localDate.getMonth() + 5,
		$scope.localDate.getDate()
	);
	$scope.$watch('myDate',
			function(newValue, oldValue) {
				$scope.dateChangeAction();
			}
		);
	$scope.dateChangeAction = function(){
		$scope.weeksName = new Array(7);
		$scope.weeksName[0]=  "Sunday";
		$scope.weeksName[1] = "Monday";
		$scope.weeksName[2] = "Tuesday";
		$scope.weeksName[3] = "Wednesday";
		$scope.weeksName[4] = "Thursday";
		$scope.weeksName[5] = "Friday";
		$scope.weeksName[6] = "Saturday";
		$scope.monthsName = new Array(12);
		$scope.monthsName[0]=  "January";
		$scope.monthsName[1] = "February";
		$scope.monthsName[2] = "March";
		$scope.monthsName[3] = "April";
		$scope.monthsName[4] = "May";
		$scope.monthsName[5] = "June";
		$scope.monthsName[6] = "July";
		$scope.monthsName[7] = "August";
		$scope.monthsName[8] = "September";
		$scope.monthsName[9] = "Octomber";
		$scope.monthsName[10] = "November";
		$scope.monthsName[11] = "December";
		$scope.day = $scope.myDate.getDate();
		$scope.year = $scope.myDate.getFullYear();
		$scope.weekName = $scope.weeksName[$scope.myDate.getDay()];
		$scope.monthName = $scope.monthsName[$scope.myDate.getMonth()];
		$scope.daySlug = $scope.weekName+', '+$scope.day+' '+$scope.monthName+', '+$scope.year;
		$scope.currDate = $scope.myDate.getFullYear()+'-'+($scope.myDate.getMonth()+1)+'-'+$scope.myDate.getDate();
		$http.get("cart/timeslots/"+$scope.currDate).success(function(response){
			var arr = [];

			for(var i in response){
				arr.push(angular.extend({ day: i }, response[i]));
			}

			$scope.timeslots = arr;
	    });
	}
	$scope.timerange = {
		"0":'12am',
	    "30":'12:30am',
	    "60":'1am',
	    "90":'1:30am',
	    "120":'2am',
	    "150":'2:30am',
	    "180":'3am',
	    "210":'3:30am',
	    "240":'4am',
	    "270":'4:30am',
	    "300":'5am',
	    "330":'5:30am',
	    "360":'6am',
	    "390":'6:30am',
	    "420":'7am',
	    "450":'7:30am',
	    "480":'8am',
	    "510":'8:30am',
	    "540":'9am',
	    "570":'9:30am',
	    "600":'10am',
	    "630":'10:30am',
	    "660":'11am',
	    "690":'11:30am',
	    "720":'12pm',
	    "750":'12:30pm',
	    "780":'1pm',
	    "810":'1:30pm',
	    "840":'2pm',
	    "870":'2:30pm',
	    "900":'3pm',
	    "930":'3:30pm',
	    "960":'4pm',
	    "990":'4:30pm',
	    "1020":'5pm',
	    "1050":'5:30pm',
	    "1080":'6pm',
	    "1120":'6:30pm',
	    "1150":'7pm',
	    "1180":'7:30pm',
	    "1210":'8pm',
	    "1240":'8:30pm',
	    "1270":'9pm',
	    "1300":'9:30pm',
	    "1330":'10pm',
	    "1370":'10:30pm',
	    "1400":'11pm',
	    "1430":'11:30pm',
	};
	$scope.setSlot = function(dateKey,slotKey){
		if(!$scope.isSlotAvailable(dateKey,slotKey)){
			return false;
		}
		$scope.timeslot.datekey = dateKey;
		$scope.timeslot.slotkey = slotKey;
		$scope.timeslot.slug = $scope.myDate;
		var timeslots = $scope.timeslots;
		for(var key in timeslots){
			if(timeslots[key].datekey==dateKey){
				for(var skey in timeslots[key].slots){
					if(skey==slotKey){
						$scope.timeslot.slotslug = $scope.timerange[timeslots[key].slots[skey].from]+" - "+$scope.timerange[timeslots[key].slots[skey].to];
					}
				}
			}
		}
	}
	$scope.isSlotAvailable = function(dateKey,slotKey){
		for(var key in $scope.timeslots){
			var slot = $scope.timeslots[key];
			if(slot.datekey == dateKey){
				if(slot.status==0){
					return false;
				}
				for(var currSlotKey in slot.slots){
					if(currSlotKey==slotKey && slot.slots[currSlotKey].status==0){
						return false;
					}
				}
			}
		}
		return true;
	}
	$scope.timeslotCheckout = function(){
		if($scope.timeslot.datekey===false || $scope.timeslot.slotkey===false){
			sweetAlert.swal({
				type:'error',
				title: 'Oops...',
				text:"Please select a available time slot",
				timer: 2000
			});
		}else{
			alcoholCart.deployCart().then(
				function(result){
					$state.go("mainLayout.checkout.payment");
				}
			);
		}
	}

}])

.controller('OrderPaymentController',['$scope', '$http', 'alcoholCart', 'categoriesService', 'productFactory',function($scope, $http, alcoholCart, categoriesService, productFactory){
	$scope.payment = alcoholCart.payment;

	if(!$scope.payment)
		$scope.payment = {};
	if(!$scope.payment.method)
		$scope.payment.method = 'COD';

}])

.controller('OrderReviewController',['$scope', '$http', 'alcoholCart',function($scope, $http, alcoholCart){
	$scope.alcoholCart = alcoholCart;
}])



.directive('userCards', function(){

	return {
		scope :{
			paymentmode: '=paymentmode',
			payment:'=payment',
			savedCards: '=savedcards'
		},
		restrict: 'A',
		templateUrl: '/adminviews/views/orders/order/addcard.html',
		controller: function($scope,$rootScope,$http,$state,sweetAlert,alcoholCart){//,$payments

			$scope.$on('addcardsubmit', function() {
	            $scope.addnewcard();
	        });

	    	// $scope.userdata = {};

		    // $scope.verified = function () {
		    // 	return $payments.verified();
		    // }

		    $scope.addnewcard = function(){
		    	if($scope.paymentmode){
		    		$scope.payment.creditCard.token = 1;
		    	}
		    	$scope.processingcard = true;
		    	$scope.errors = [];
				$http.post('/payment/addcard',$scope.payment.creditCard).success(function(rdata){

					if($scope.paymentmode){
						$scope.payment.creditCard = rdata.card;

						alcoholCart.deployCart().then(
							function(result){
								$state.go('mainLayout.checkout.review');
							}
						);

					}else{
						$scope.payment.card = '';
						// $scope.userdata = rdata.user;
						$scope.savedCards = rdata.user.savedCards;
						$scope.payment.creditCard = {};
					}

					$scope.processingcard = false;
				}).error(function(errors){
					$scope.errors = errors;
					$scope.processingcard = false;
				});
			}

			$scope.removeCard = function(card){
				sweetAlert.swal({
				  title: 'Are you sure?',
				  text: "You won't be able to revert this!",
				  type: 'warning',
				  showCancelButton: true,
				  confirmButtonColor: '#3085d6',
				  cancelButtonColor: '#d33',
				  confirmButtonText: 'Yes, delete it!'
				}).then(function() {
					$http.post('/payment/removecard',card).success(function(rdata){
						// $scope.userdata = rdata.user;
						$scope.savedCards = rdata.user.savedCards;
						$scope.payment.card = '';
					}).error(function(errors){
						sweetAlert.swal({
							type:'error',
							text:errors,
						});
					});
				});
			}

			$scope.changeCard = function(card){
				$scope.payment.creditCard = card;
			}

		}
	};
})
.filter('creditcard', function() {
	return function(number) {
		var r = number.substr(number.length-4,4);
		return 'XXXX XXXX XXXX '+r;
	}
})