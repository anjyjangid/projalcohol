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
		$scope.shipping = response.user.address[response.delivery.address.key];

	});

	$scope.setStatus = function(status){

		orderModel.setStatus($scope.order._id,status);

	}
	  
}]);


MetronicApp.controller('OrderCreateController',['$scope', '$http', '$timeout', 'alcoholCart', 'NgMap',function($scope, $http, $timeout, alcoholCart, NgMap){

	$scope.users = [];
	$scope.mobile = '';
	$scope.name = '';	
	$scope.errors = {};
	$scope.searchby = "";
	$scope.consumer = {
		mobile : '',
		name : '',
		email : '',
		addresses : ''
	};

	angular.alcoholCart = alcoholCart;
	$scope.cart = alcoholCart.getCart();

	$scope.$watch('consumer.mobile',function() {

		$scope.users = [];

		if($scope.consumer.mobile.length < 2){
			return false;
		}

		var param = { mobile_number: $scope.consumer.mobile };
		$scope.fetchUser(param);

	});

	$scope.$watch('consumer.name',function() {

		$scope.users = [];		

		if($scope.consumer.name.length < 2){
			return false;
		}

		var param = {name:$scope.consumer.name};
		$scope.fetchUser(param);

	});

	$scope.$watch('consumer.email',function() {

		$scope.users = [];
		
		if($scope.consumer.email.length < 2){
			return false;
		}
		var param = {email:$scope.consumer.email};
		$scope.fetchUser(param);

	});

	$scope.newCart = alcoholCart.newCart;

	$scope.resetsearch = function(){
		
		$timeout(function(){
			$scope.searchby='';
			$scope.users = [];
		},500);

	};

	$scope.selectuser = function(user){

		$scope.consumer = {
			mobile : user.mobile_number,
			name : user.name,
			email : user.email,
			addresses : user.address
		};

	}

	$scope.fetchUser = function(searchParams){

		$http.get("/adminapi/customer",{params: searchParams}).then(

			function(successRes){

				$scope.users = successRes.data;
			},
			function(errRes){
				
			}
		)

	}
	// Google map auto complete code start //

	$scope.types = "['geocode']";
	$scope.restrictions="{country:'sg'}";
	$scope.center = "[1.290270, 103.851959]";
	$scope.zoom = 2;

	$scope.placeChanged = function() {

		$scope.address.place = this.getPlace();
		var point = $scope.address.place.geometry.location;
		$scope.map.setCenter(point);

		$scope.map.setCenter(point);
		$scope.map.setZoom(16);
		$scope.marker.setMap(null);
		$scope.marker = new google.maps.Marker({
			position: point,
			map: $scope.map,
		});

	}

	NgMap.getMap().then(function(map) {

		$scope.map = map;
		angular.map = $scope.map;

		setTimeout(function() {

			var point = new google.maps.LatLng(1.290270,103.851959);

			$scope.map.setCenter(point);
			$scope.map.setZoom(12);
			$scope.map.setOptions({draggable: false});

			$scope.marker = new google.maps.Marker({
				position: point,
				map: $scope.map,
			});

		}, 500);

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

				var searchParams = {
					qry : qry,
					parentCategory : $scope.catSelected.parent == ''?'':$scope.catSelected.parent._id,
					subCategory : $scope.catSelected.sub == ''?'':$scope.catSelected.sub._id
				};

				$http.get("/adminapi/product/searchproduct", {
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

			$scope.timeslots = response;

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
	
}])

.controller('OrderReviewController',['$scope', '$http', 'alcoholCart',function($scope, $http, alcoholCart){
	$scope.alcoholCart = alcoholCart;
}])
