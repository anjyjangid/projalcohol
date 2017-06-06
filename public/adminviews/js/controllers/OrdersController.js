'use strict';

MetronicApp.controller('OrdersController',['$rootScope', '$scope', '$timeout','$http', function($rootScope, $scope, $timeout,$http) {
    $scope.$on('$viewContentLoaded', function() {
        Metronic.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_orders')); // set profile link active in sidebar menu
    });
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

    $scope.updateStatus = function(status){

    	

    }

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
		$scope.shipping = response.delivery.address.detail;
		$scope.serviceCharge = 0;
		if($scope.order.service.express.status){
			$scope.serviceCharge += $scope.order.service.express.charges;
		}

		if($scope.order.service.smoke.status){
			$scope.serviceCharge += $scope.order.service.smoke.charges;
		}

	});
	$scope.setStatus = function(status){
		orderModel.setStatus($scope.order._id,status);
	}

}]);

MetronicApp.controller('OrderCreateController',[
	'$scope', '$state', '$http', '$timeout', 'alcoholCart', '$modal', '$filter', '$rootScope', 'sweetAlert','$sce'
, function($scope, $state, $http, $timeout, alcoholCart, $modal, $filter, $rootScope, sweetAlert,$sce){

	// angular.alcoholCart = alcoholCart;
	$scope.alcoholCart = alcoholCart;
	$scope.cart = alcoholCart.getCart();

	$scope.paymentError = [];	

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

	// $scope.$watch('cart.delivery.contact',
	// 		function(newValue, oldValue) {

	// 			if(newValue!=null && $scope.cartFrm.deliveryContact.$valid && $scope.cart.consumer.mobile_number!==newValue){
	// 				$scope.newNumber = true;
	// 			}else{
	// 				$scope.newNumber = false;
	// 			}
	// 		}
	// 	);

	if(!angular.isDefined($scope.cart.delivery.country_code)){
		$scope.cart.delivery.country_code = 65;
	}


	$scope.mobile_number = {
		'min' : 6,
		'max' : 15
	}	

	$scope.$watch('cart.delivery.contact',
			function(newValue, oldValue) {

				setMobileNumberMinMax();

				if(newValue!=null && $scope.cartFrm.deliveryContact.$valid && $scope.cart.consumer.mobile_number!==newValue){
					$scope.newNumber = true;
				}else{
					$scope.newNumber = false;
				}
			}
		);

	$scope.$watch('cart.delivery.country_code',
			function(newValue, oldValue) {

				if($scope.cart.delivery.contact!=null && $scope.cart.delivery.contact.length>8){
					$scope.cart.delivery.contact = '';
					return true;
				}

				setMobileNumberMinMax();
			});
	
	function setMobileNumberMinMax () {

		if($scope.cart.delivery.country_code=='65'){

			$scope.mobile_number.min = 8;
			$scope.mobile_number.max = 8;
		}else{
			$scope.mobile_number.min = 6;
			$scope.mobile_number.max = 15;
		}



	}


	$scope.customerSelect = function(customer) {

		delete $scope.cart['consumer'];
		delete $scope.cart['business'];
		$scope.cart.user = null;

		$scope.cart[$scope.cart.orderType] = customer;
		$scope.cart.user = mongoIdToStr(customer._id);

		delete $scope.cart.payment.creditCard;
		delete $scope.cart.payment.card;
		delete $scope.cart.payment.savecard;

		var api;
		if($scope.cart.orderType=='business')
			api = '/adminapi/business/detail/'+$scope.cart.user;
		else
			api = '/adminapi/customer/detail/'+$scope.cart.user;

		$http.get(api)
		.then(function(res){

			$scope.cart.addresses = res.data.address || [];

			$scope.cart.consumer.specialNote = res.data.specialNote;

			if($scope.cart.addresses.length){

				var defaultAddKey = 0;

				angular.forEach($scope.cart.addresses,function (currAdd,key) {					

					if(currAdd.default==true){
						defaultAddKey = key;
					}

				})

				$scope.alcoholCart.$cart.selectedAddress = defaultAddKey;
				$scope.setSelectedAddress(defaultAddKey);

			}else{

				delete $scope.alcoholCart.$cart.delivery.address;
				delete $scope.alcoholCart.$cart.selectedAddress;

			}
			//$scope.cart.[$scope.cart.orderType].savedCards = res.data.savedCards || [];
			$scope.alternateNumbers = res.data.alternate_number || [];

			if(!angular.isDefined(res.data.mobile_number) || res.data.mobile_number==""){

				if($scope.alternateNumbers.length>0){
					$scope.cart.delivery.contact = $scope.alternateNumbers[$scope.alternateNumbers.length-1];
				}else{
					$scope.alcoholCart.$cart.delivery.contact = null;
				}

			}else{
				$scope.cart.delivery.contact = res.data.mobile_number;
			}

			$scope.cart.delivery.country_code = res.data.country_code;

			alcoholCart.deployCart();

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
			if(res.data._id){
				$scope.cart[$scope.cart.orderType]._id = res.data._id;
				$scope.cart.user = res.data._id;
			}
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
		// else if(!$scope.cart.addresses || (!$scope.cart.addresses[$scope.cart.selectedAddress] && !$scope.cart.addresses[$scope.cart.selectedBilAddr])) {
		// 	return section=='address';
		// }
		else
			return true;
	}

	$scope.newAddress = function(address){

		if(!$scope.cart[$scope.cart.orderType]._id) return;

		$modal.open({
			templateUrl: 'newAddress.html',
			controller: 'NewAddressModel',
			backdrop: false,
			size:'lg',
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
			
			// $scope.cart.addresses.push(address);

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

	$scope.updateAddress = function(addressKey){

		$modal.open({
			templateUrl: 'newAddress.html',
			controller: 'UpdateAddressModel',
			backdrop: false,
			size:'lg',
			resolve: {
				detail: function(){
					return {
						user: $scope.cart[$scope.cart.orderType],
						address: $scope.cart.addresses[addressKey],
						key:addressKey

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

	$scope.removeAddress = function(key) {

		sweetAlert.swal({
                title: "Are you sure?",
                //text: "You will not be able to recover this address!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes",
                // closeOnConfirm: false,
                // closeOnCancel: false
        }).then(function(isConfirm) {
                if (isConfirm) {

                    $http.delete('/adminapi/customer/address/'+$scope.cart[$scope.cart.orderType]._id+'/'+key)
                        .success(function(response) {

                            if(response.success){
                            	
                            	$scope.cart.addresses = response.address;
								sweetAlert.swal({
                                	title: response.message,
					                type: "success",
					                timer: 2000,

                                });

                            }else{
                                sweetAlert.swal("Cancelled!", response.message, "error");
                            }

                        })
                        .error(function(data, status, headers) {
                            sweetAlert.swal("Cancelled", data.message, "error");
                        })

                } else {
                    sweetAlert.swal("Cancelled", "Address safe :)", "error");
                }
            },function(cancel){}
       	);
	};

	$scope.clearProp = function(ob, prop) {
		if(!ob) return;

		delete ob[prop];
	}

	$rootScope.invalidCodeMsg = true;

	if(alcoholCart.getCouponCode()){
		$scope.discountCode = alcoholCart.getCouponCode();
		$rootScope.couponInput = false;
		$rootScope.couponOutput = true;
	}else{
		$rootScope.couponInput = true;
		$rootScope.couponOutput = false;
	}

	$scope.checkCoupon = function(discountCode){
		$scope.discountCode = discountCode;
		alcoholCart.checkCoupon(discountCode, alcoholCart.getCartKey());
	}

	$scope.removeCoupon = function(){
		$scope.discountCode = '';
		delete $scope.discountCode;
		alcoholCart.removeCoupon();
	}

	$scope.hideCouponMsg = function(){
		$rootScope.invalidCodeMsg = true;
		$rootScope.invalidCodeMsgTxt = '';
	}

	$scope.setSelectedAddress = function(key){

		$scope.alcoholCart.$cart.delivery.address = {};
		$scope.alcoholCart.$cart.delivery.address.key = key;
		$scope.alcoholCart.$cart.delivery.address.detail = $scope.cart.addresses[key];
	}

	$scope.orderprocessing = false;

	$scope.orderConfirm = function(){

		$scope.orderprocessing = true;

		alcoholCart.checkoutValidate().then(

			function (successRes) {
				
				if(typeof successRes.card != "undefined")
					$scope.alcoholCart.$cart.payment.creditCard = successRes.card;

				alcoholCart.deployCart().then(

					function (successRes) {

						alcoholCart.freezCart().then(

							function(result){

							var cartKey = alcoholCart.getCartKey();

							$http.put("adminapi/order/confirmorder/"+cartKey, {} ,{

							}).error(function(response, status, headers) {
									$scope.orderprocessing = false;
									sweetAlert.swal({
										type:'error',										
										text:response.message										
									});

					        }).success(function(response) {

						        	if($scope.cart.payment.method == 'CARD'){
						        		var payurl = $sce.trustAsResourceUrl(response.formAction);
							            $rootScope.$broadcast('gateway.redirect', {
							                url: payurl,
							                method: 'POST',
							                params: response.formData
							            });
						        		return;
						        	}

									sweetAlert.swal({
										type:'success',
										title: response.message,
										timer: 1000
									});

									$state.go('userLayout.orders.show',{order:response.order},{reload: false, location: 'replace'});

							})
						},
							function(errorRes){
							$scope.orderprocessing = false;	
							sweetAlert.swal({
								type:'error',
								text:errorRes.message								
							});							
						}
						);
					},
					function (errRes){
						$scope.orderprocessing = false;
						sweetAlert.swal({
							text: "Error in cart",
				  			type: 'error',
						});
					}
				);	
			},
			function (errorRes) {
				
				$scope.orderprocessing = false;
				if(errorRes.customError){					
					for(var m in errorRes.messages){
						if($('.'+errorRes.messages[m].value).length) continue;
						
						if(errorRes.messages[m].errors){
							$scope.paymentError = errorRes.messages[m].errors;
						}

						$scope.showError({message:errorRes.messages[m].message,value:errorRes.messages[m].value});
					}									
				}else{
					$scope.showError(errorRes);					
					if(typeof errorRes.errors != "undefined")
						$scope.paymentError = errorRes.errors;
				}
			}
		);
			
	}

	$scope.showError = function(data){

		$.bootstrapGrowl(data.message, {
            ele: 'body', // which element to append to
            type: 'danger '+data.value, // (null, 'info', 'danger', 'success', 'warning')
            offset: {
                from: 'top',
                amount: 50
            }, // 'top', or 'bottom'
            align: 'right', // ('left', 'right', or 'center')
            width: 'auto', // (integer, or 'auto')
            delay: 10000, // Time while the message will be displayed. It's not equivalent to the *demo* timeOut!
            allow_dismiss: true, // If true then will display a cross to close the popup.
            //stackup_spacing: 10 // spacing between consecutively stacked growls.
        });

	}  

	$scope.newCart = function() {
		
		sweetAlert.swal({

				  title: 'Are you sure?',
				  text: "You won't be able to revert this!",
				  type: 'warning',
				  showCancelButton: true,
				  confirmButtonColor: '#3085d6',
				  cancelButtonColor: '#d33',
				  confirmButtonText: 'Yes, cancel it!'

				}).then(function() {

					$http.get("/adminapi/order/remove-un-processed")
					.success(function(rdata){

						$state.go("userLayout.orders.consumer", {}, {reload: true});

					}).error(function(errors){

						sweetAlert.swal({
							type:'error',
							text:errors,
						});

					});
				});

	}


}])

.controller('NewAddressModel',[ '$scope', '$modalInstance', 'NgMap', '$http', 'detail'
, function($scope, $modalInstance, NgMap, $http, detail) {
	$scope.cancel = $modalInstance.dismiss;

	$scope.type = 1;

	$scope.address = {};

	$scope.types = "['geocode']";
	$scope.restrictions="{country:'sg'}";
	$scope.center = "[1.290270, 103.851959]";
	$scope.zoom = 2;

	// Google map auto complete code start //
	NgMap.getMap().then(function(map) {
		$scope.map = map;
		angular.map = $scope.map;
		setTimeout(function() {
			var point = new google.maps.LatLng(1.3544542534181963,103.86775184667965);
			$scope.map.setCenter(point);
			$scope.map.setZoom(12);
			$scope.map.setOptions({draggable:false});
		}, 500);
	});

	$scope.searchLocation = function(q){
		return $http.get('api/site/search-location', {params: {q}})
		.then(function(res){
			return res.data;
		});
	}

	/*$scope.locationSelect = function(location) {
		$scope.address = location;

		if(location){
			lat = item.LAT;
			long = item.LNG;
			zoom = 18;
			var addressData = angular.copy($scope.addressData.SEARCHTEXT);
			$scope.addressData = angular.copy(item);
			$scope.addressData.SEARCHTEXT = addressData;
			$scope.locateMap(lat,long,zoom,item);
		}
	}*/

	$scope.addressData = {SEARCHTEXT:''};
	$scope.simulateQuery = true;
	$scope.isDisabled = false;

	$scope.querySearch = function(query){
		return $http.get('/site/search-location?q='+query).then(function(result){
		    return result.data;
		});
	}

	$scope.locationSelect = function(item){
		
		if(item){
			var lat = item.LATITUDE;
			var long = item.LONGITUDE;
			var zoom = 18;
			var addressData = angular.copy($scope.addressData.SEARCHTEXT);
			$scope.addressData = angular.copy(item);
			$scope.address = angular.copy(item);
			$scope.addressData.SEARCHTEXT = addressData;
			$scope.locateMap(lat,long,zoom,item);
		}
	}

	$scope.locateMap = function(lat,lng,zoom,item) {
		setTimeout(function() {
			
			if($scope.map){
				var point = new google.maps.LatLng(lat,lng);
				$scope.map.setCenter(point);
				$scope.map.setZoom(zoom);
				$scope.map.setOptions({draggable:false});
				//REMOVE THE PREVIOUS MARKER
				if($scope.marker)
					$scope.marker.setMap(null);

				if(item.LAT){
					$scope.marker = new google.maps.Marker({
			            position: point,
			            map: $scope.map,
			        });
				}
			}
		},500);
	}


	$scope.$watch('addressData.SEARCHTEXT',function(newValue,oldValue){
		if(newValue == ''){
			$scope.addressData = {};
			$scope.address = {};
			var lat = 1.3544542534181963;
			var long = 103.86775184667965;
			var zoom = 12;
			var item = angular.copy($scope.addressData);
			$scope.locateMap(lat,long,zoom,item);
		}
	});

	// Google map auto complete code start //
	/*NgMap.getMap().then(function(map) {
		$scope.map = map;
		angular.map = map;
		
	});*/
	// Google map auto complete code ends //

	$scope.save = function(){
		$scope.savingData = true;
		$scope.errors = [];
		var api;
		
		if(detail.type=='business')
			api = '/adminapi/business/address/'+detail.user._id;
		else
			api = '/adminapi/address/'+detail.user._id;

		delete $scope.address.manualForm;

		if($scope.type == 3){
			$scope.address.manualForm = 1;
		}

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
}])

.controller('UpdateAddressModel',[ '$scope', '$modalInstance', 'NgMap', '$http', 'detail'
, function($scope, $modalInstance, NgMap, $http, detail) {

	$scope.cancel = $modalInstance.dismiss;

	$scope.type = 3;

	$scope.address = detail.address;

	$scope.updateAddres = true;

	$scope.currentKey = detail.key;

	// Google map auto complete code start //
	NgMap.getMap().then(function(map) {
		$scope.map = map;
		angular.map = $scope.map;
		setTimeout(function() {
			var point = new google.maps.LatLng($scope.address.LAT,$scope.address.LNG);
			$scope.map.setCenter(point);
			$scope.map.setZoom(12);
			$scope.map.setOptions({draggable:false});
		}, 500);
	});

	$scope.searchLocation = function(q){
		return $http.get('api/site/search-location', {params: {q}})
		.then(function(res){
			return res.data;
		});
	}		

	$scope.save = function(){

		$scope.errors = {};
		$scope.address.manualForm = 1;

		var api = '/adminapi/address/'+detail.user._id+'/'+$scope.currentKey;		

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

}])


.controller('OrderProductsController',[
				'$scope', '$http', '$timeout', '$mdDialog', 'alcoholCart', 
				'categoriesService', 'productFactory', 'alcoholGifting',
				'AlcoholProduct', '$q', '$modal', 'sweetAlert'
	, function($scope, $http, $timeout, $mdDialog, alcoholCart, 
				categoriesService, productFactory, alcoholGifting,
				AlcoholProduct, $q, $modal, sweetAlert){

	var giftCardUpdateTimeOut = {};
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
						var proObj = new AlcoholProduct(value);

						if(!proObj.isInCart){
							if(proObj.chilled){
								proObj.qChilled = 1;
							}else{
								proObj.qNChilled = 1;
							}
						}

						response[key] = proObj;

					});

					if(angular.isDefined(response[0])){
						$scope.selected.product = response[0];
						$scope.selected.index = 0;
					}
					
					$scope.products = response;
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

	$scope.proUpdateTimeOut = {};
	
	$scope.addtocart = function(key,type){

		var proObj = alcoholCart.getProductById(key);

		if(angular.isDefined($scope.proUpdateTimeOut[key])){
			$timeout.cancel($scope.proUpdateTimeOut[key]);
		}

		$scope.proUpdateTimeOut[key] = $timeout(function(){

			var quantity = {
				chilled : parseInt(proObj.qChilled),
				nonChilled : parseInt(proObj.qNChilled)
			}
			alcoholCart.addProduct(key,quantity,proObj.servedAs).then(
				function(response){
					$scope.isInCart = true;
				},
				function(errRes){

				}

			);

		},1500)
	};

	$scope.removeSale = function(saleObj){

		var id = saleObj.getId();
		id = id.$id;

		alcoholCart.removeSale(id).then(

			function(response){

			},
			function(errRes){

			}
		);
	}
	
	$scope.remove = function(key,type){

		if(type=='qChilled'){

			alcoholCart.removeProduct(key,true);

		}else{

			alcoholCart.removeProduct(key,false);

		}
	};

	$scope.giftcard = function(ev,key) {

		$modal.open({
			size:'lg',
			controller: "OrderGiftCardController",
			templateUrl: '/adminviews/views/orders/order/giftCard.html',
		}).result
		.then(function(answer) {
			
		});

			/*$mdDialog.show({
				controller: "OrderGiftCardController",
				templateUrl: '/adminviews/views/orders/order/giftCard.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true
			})
			.then(function(answer) {
			}, function() {
			});*/
	}



	$scope.setSmoke = function () {

		var smoke = alcoholCart.$cart.service.smoke;
		
		if(typeof smoke.detail === 'undefined'){
			smoke.detail = "";
		}

		if(smoke.status === false){
			alcoholCart.removeSmoke();
			return false;
		}

		sweetAlert.swal({

						title: 'Smoke Detail',
						input: 'textarea',
						inputValue : smoke.detail,
						showCancelButton: true,
						confirmButtonText: 'Submit',
						showLoaderOnConfirm: true,
						preConfirm: function (textarea) {
							return new Promise(function (resolve, reject) {
								setTimeout(function() {
									if (textarea == '') {
										reject('Please provide smoke detail');
									} else {
										resolve()
									}
								}, 500)
							})
						},
						allowOutsideClick: false
					}).then(

						function (textarea) {

						alcoholCart.addSmoke(textarea);

						swal({
							type: 'success',
							title: 'Smoke Detail Saved!',
							allowOutsideClick: false,
							// html: textarea
						})
					},
						function (cancel) {
							
							if(!angular.isDefined(smoke.detail) || smoke.detail==""){
								alcoholCart.removeSmoke();
							}

						}
					)
	}

	$scope.package = function(ev) {

		$modal.open({
			size:'lg',
			controller: "OrderPackageController",
			templateUrl: '/adminviews/views/orders/order/searchpackage.html',
		}).result
		.then(function(answer) {
			
		});


	}

	$scope.updateGiftCard = function(uid){

		if(giftCardUpdateTimeOut[uid]){
			$timeout.cancel(giftCardUpdateTimeOut[uid]);
		}
		giftCardUpdateTimeOut[uid] = $timeout(function() {
			alcoholGifting.updateGiftCard(uid);
		},600)
		
	}

}])

.controller('OrderProductDetailController',['$scope', '$http', 'alcoholCart', 'categoriesService', 'productFactory',function($scope, $http, alcoholCart, categoriesService, productFactory){

}])

.controller('OrderPackageController',[
	'$scope', '$http', '$mdDialog', '$compile', '$sce','alcoholCart', 'categoriesService','sweetAlert','$stateParams','$location','$modalInstance',
	function($scope, $http, $mdDialog, $compile, $sce, alcoholCart, categoriesService,sweetAlert,$stateParams,$location,$modalInstance){

	$scope.cart = alcoholCart.getCart();
	$scope.alcoholCart = alcoholCart;

	$scope.hidemodal = function() {
		$modalInstance.close();
	};

	$scope.errors = [];

	$scope.processing = false;

	$scope.btnText = "ADD TO CART";	

	$scope.allPackages = {};
	$scope.selected = {};
	$scope.fetchList = function(type) {
		if(!$scope.allPackages[type])
			$http.get('api/package/packages/'+type)
			.then(function(res){
				$scope.allPackages[type] = res.data;
				$scope.selected.package = res.data[0];
			})
		else
			$scope.selected.package = $scope.allPackages[type][0];

		$scope.packageType=type;
	};

	$scope.collapseCallback = function (index, id) {
		
		var totalseleted = 0;
		var packageItems = angular.copy($scope.selected.package.packageItems[index]);
		var maxQuantity = parseInt(packageItems.quantity);
		var packageUpdate = true;

		var outerloopPromises = angular.forEach($scope.selected.package.packageItems, function(pkgItem, pkgKey) {
			
			var totalseleted = 0;
			var maxQuantity = parseInt(pkgItem.quantity);

			angular.forEach(pkgItem.products, function(value, key) {
				totalseleted+=parseInt(value.customizequantity);
			});

			if(totalseleted!=maxQuantity){
				$scope.errors[pkgKey] = 'You must select total of '+maxQuantity+' items.';
			}else{
				delete $scope.errors[pkgKey];
			}

		});

		if(typeof $scope.errors[index] == 'undefined'){
			//ADD IN CARTQUATITY IF THERE IS NO ERROR
			angular.forEach($scope.selected.package.packageItems[index].products, function(inPkgItem, inPkgKey) {

				$scope.selected.package.packageItems[index].products[inPkgKey].cartquantity = parseInt(inPkgItem.customizequantity);

			});
			$scope.updatePackage();
		}else{			
			$scope.accordion.toggle(index);
		}

	};

	$scope.updatePackage = function(){

		var discountAmount = 0;
		var originalAmount = 0;
		angular.forEach($scope.selected.package.packageItems, function(pkgItem, pkgkey) {
			var lineofproductadded = [];
			angular.forEach(pkgItem.products, function(value, key) {
				var quantityadded = parseInt(value.cartquantity);
				if(quantityadded > 0)
					lineofproductadded.push(quantityadded+' x '+value.name);

				discountAmount += parseFloat(value.cprice)*parseInt(quantityadded);
				originalAmount += parseFloat(value.sprice)*parseInt(quantityadded);
			});
			$scope.selected.package.packageItems[pkgkey].selectedProducts = lineofproductadded.join(', ');
		});

		$scope.selected.package.packagePrice = discountAmount.toFixed(2);
		$scope.selected.package.packageSavings = parseFloat(originalAmount-discountAmount).toFixed(2);

	}

	$scope.validateByIndex = function(index){
		var totalseleted = 0;
		var packageItems = angular.copy($scope.selected.package.packageItems[index]);
		var maxQuantity = parseInt(packageItems.quantity);
		var packageUpdate = true;

		var apromise = angular.forEach($scope.selected.package.packageItems, function(pkgItem, pkgKey) {

			var totalseleted = 0;
			var maxQuantity = parseInt(pkgItem.quantity);

			angular.forEach(pkgItem.products, function(value, key) {
				totalseleted+=parseInt(value.customizequantity);
			});

			if(totalseleted!=maxQuantity){
				$scope.errors[pkgKey] = 'You must select total of '+maxQuantity+' items.';
			}else{
				delete $scope.errors[pkgKey];
			}

		});

		if(typeof $scope.errors[index] == 'undefined'){
			//ADD IN CARTQUATITY IF THERE IS NO ERROR

			angular.forEach($scope.selected.package.packageItems[index].products, function(inPkgItem, inPkgKey) {

				$scope.selected.package.packageItems[index].products[inPkgKey].cartquantity = parseInt(inPkgItem.customizequantity);

			});
			$scope.updatePackage();
		}
	}

	$scope.toTrustedHTML = function( html ){
		return $sce.trustAsHtml( html );
	}

	$scope.expandCallback = function (index, id) {
		/*$timeout(function() {
			$anchorScroll(id);
		});*/
	};	

	$scope.customizeCocktail = function(pkgKey, proKey){

		angular.forEach($scope.selected.package.packageItems[pkgKey].products, function(item, key) {
			if(key == proKey){
				item.cartquantity = 1;
			}else{
				item.cartquantity = 0;
			}
		});
		$scope.updatePackage();
	};

	$scope.addPackage = function(){

		var c = Object.keys($scope.errors).length;
		if(c!=0){
			/*sweetAlert.swal({
				type:'error',
				title: 'Wait...',
				text:"Please verify your selection.",
				timer: 2000
			});*/
			alert("Please verify your selection.");
			
			return;
		}

		$scope.processing = true;

		//if($scope.selected.package.isInCart===false){
			alcoholCart.addPackage($scope.selected.package._id,$scope.selected.package)
			.then(function(response) {

				$scope.selected.package.unique = response.key;
				$scope.processing = false;

				$scope.btnText = "UPDATE CART";

				$scope.hidemodal();

				//$location.path($location.path()+response.key).replace();
				

			}, function(error) {

				console.error(error);
				$scope.processing = false;

			});
		/*}else{

			alcoholCart.updatePackage($scope.selected.package._id,$scope.selected.package)
			.then(function(response) {

				
				$scope.processing = false;
				

			}, function(error) {

				console.error(error);
				$scope.processing = false;

			});

		}*/

	}	

}])

.controller('PackageDetailController',
	['$q','$scope', '$rootScope','$state','$http','$stateParams','$location','$timeout','$anchorScroll','alcoholCart','sweetAlert', '$sce',
	function($q, $scope, $rootScope,$state,$http,$stateParams,$location,$timeout,$anchorScroll,alcoholCart,sweetAlert,$sce){

	$scope.errors = [];

	$scope.processing = false;

	$scope.btnText = "ADD TO CART";

	$scope.packages = [];


	$scope.updatePackage = function(){

		var discountAmount = 0;
		var originalAmount = 0;
		angular.forEach($scope.packages.packageItems, function(pkgItem, pkgkey) {
			var lineofproductadded = [];
			angular.forEach(pkgItem.products, function(value, key) {
				var quantityadded = parseInt(value.cartquantity);
				if(quantityadded > 0)
					lineofproductadded.push(quantityadded+' x '+value.name);

				discountAmount += parseFloat(value.cprice)*parseInt(quantityadded);
				originalAmount += parseFloat(value.sprice)*parseInt(quantityadded);
			});
			$scope.packages.packageItems[pkgkey].selectedProducts = lineofproductadded.join(', ');
		});

		$scope.packages.packagePrice = discountAmount.toFixed(2);
		$scope.packages.packageSavings = parseFloat(originalAmount-discountAmount).toFixed(2);

	}
	
	$http.get('api/package/packagedetail/'+$stateParams.type+'/'+$stateParams.id).success(function(response){

		delete response.productlist;

		$scope.packages = response;

		if($stateParams.uid!==''){

			var isInCart = alcoholCart.getPackageByUniqueId($stateParams.uid);

			if(isInCart){

				$scope.btnText = "UPDATE CART";

				var packageProInCartCount = isInCart.getProductsCount();
				
				angular.forEach($scope.packages.packageItems,function(pRow){

					angular.forEach(pRow.products,function(product){

						var inCartProQty = packageProInCartCount[product._id];

						product.customizequantity = 0;
						product.cartquantity = 0;
						if(typeof inCartProQty !== 'undefined'){
							product.customizequantity = inCartProQty;
							product.cartquantity = inCartProQty;
						}

					})

				})

				$scope.packages.packageQuantity = isInCart.getQuantity();

				$scope.packages.isInCart = isInCart;

				$scope.updatePackage();
			}

		}else{

			$scope.packages.isInCart = false;

		}

		var mdata = {
			title:$scope.packages.metaTitle,
			description:$scope.packages.metaDescription,
			keyword:$scope.packages.metaKeywords
		};
		

	});

	$scope.expandCallback = function (index, id) {
		/*$timeout(function() {
			$anchorScroll(id);
		});*/
	};
	$scope.hasErrors = false;
	//PARTY PACKAGE CUSTOMISATION FUNCTION
	$scope.collapseCallback = function (index, id) {

		var totalseleted = 0;
		var packageItems = angular.copy($scope.packages.packageItems[index]);
		var maxQuantity = parseInt(packageItems.quantity);
		var packageUpdate = true;

		var outerloopPromises = angular.forEach($scope.packages.packageItems, function(pkgItem, pkgKey) {

			var totalseleted = 0;
			var maxQuantity = parseInt(pkgItem.quantity);

			angular.forEach(pkgItem.products, function(value, key) {
				totalseleted+=parseInt(value.customizequantity);
			});

			if(totalseleted!=maxQuantity){
				$scope.errors[pkgKey] = 'You must select total of '+maxQuantity+' items.';
			}else{
				delete $scope.errors[pkgKey];
			}

		});

		if(typeof $scope.errors[index] == 'undefined'){
			//ADD IN CARTQUATITY IF THERE IS NO ERROR
			angular.forEach($scope.packages.packageItems[index].products, function(inPkgItem, inPkgKey) {

				$scope.packages.packageItems[index].products[inPkgKey].cartquantity = parseInt(inPkgItem.customizequantity);

			});
			$scope.updatePackage();
		}else{
			$scope.accordionA.toggle(index);
		}

	};



	$scope.customizeCocktail = function(pkgKey, proKey){

		angular.forEach($scope.packages.packageItems[pkgKey].products, function(item, key) {
			if(key == proKey){
				item.cartquantity = 1;
			}else{
				item.cartquantity = 0;
			}
		});
		$scope.updatePackage();
	};

	$scope.addPackage = function(){

		var c = Object.keys($scope.errors).length;
		if(c!=0){
			alert('Please verify your selection.');
			return;
		}

		$scope.processing = true;

		if($scope.packages.isInCart===false){
			alcoholCart.addPackage($stateParams.id,$scope.packages)
			.then(function(response) {

				$scope.packages.unique = response.key;
				$scope.processing = false;

				$scope.btnText = "UPDATE CART";

				$location.path($location.path()+response.key).replace();
				

			}, function(error) {

				console.error(error);
				$scope.processing = false;

			});
		}else{

			alcoholCart.updatePackage($stateParams.uid,$scope.packages)
			.then(function(response) {

				
				$scope.processing = false;
				

			}, function(error) {

				console.error(error);
				$scope.processing = false;

			});

		}

	}

	$scope.validateByIndex = function(index){
		var totalseleted = 0;
		var packageItems = angular.copy($scope.packages.packageItems[index]);
		var maxQuantity = parseInt(packageItems.quantity);
		var packageUpdate = true;

		var apromise = angular.forEach($scope.packages.packageItems, function(pkgItem, pkgKey) {

			var totalseleted = 0;
			var maxQuantity = parseInt(pkgItem.quantity);

			angular.forEach(pkgItem.products, function(value, key) {
				totalseleted+=parseInt(value.customizequantity);
			});

			if(totalseleted!=maxQuantity){
				$scope.errors[pkgKey] = 'You must select total of '+maxQuantity+' items.';
			}else{
				delete $scope.errors[pkgKey];
			}

		});

		if(typeof $scope.errors[index] == 'undefined'){
			//ADD IN CARTQUATITY IF THERE IS NO ERROR

			angular.forEach($scope.packages.packageItems[index].products, function(inPkgItem, inPkgKey) {

				$scope.packages.packageItems[index].products[inPkgKey].cartquantity = parseInt(inPkgItem.customizequantity);

			});
			$scope.updatePackage();
		}
	}

	$scope.toTrustedHTML = function( html ){
		return $sce.trustAsHtml( html );
	}

}])

.controller('OrderGiftCardController',['$scope', '$http', '$mdDialog', '$modalInstance', 'alcoholCart', 'alcoholGifting', function($scope, $http, $mdDialog, $modalInstance, alcoholCart, alcoholGifting){
	$scope.hide = function() {		
		$mdDialog.hide();
	};

	$scope.hidemodal = function() {
		$modalInstance.close();		
	};
	$scope.cancel = function() {
		$mdDialog.cancel();
	};
		$scope.btnText = 'add to cart';
		$scope.processing = true;
		$scope.gift = {}
		$http.get('api/giftcategory/giftcard')
			.success(function(result){
				$scope.gift = result;
				$scope.gift.recipient = {price:$scope.gift.cards[0].value,quantity:1};
				$scope.processing = false;

				$scope.addCard = function(){
					$scope.processing = true;
					alcoholGifting.addUpdateGiftCard($scope.gift, alcoholCart.getCart()._id).then(
						function(successRes){
							$scope.hidemodal();
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

.controller('OrderDeliveryController',['$scope', '$http', '$timeout', 'alcoholCart',function($scope, $http, $timeout, alcoholCart){

	$scope.alcoholCart = alcoholCart;
	$scope.timeslot = alcoholCart.$cart.timeslot;
	$scope.localDate = new Date();
	var skipDays = 0;
	
	if($scope.timeslot.slug){
		$scope.myDate = new Date($scope.timeslot.slug);
	}else{
		$scope.myDate = new Date();
		$scope.myDate.setDate($scope.myDate.getDate()+skipDays);
	}
	$scope.localDate.setDate($scope.localDate.getDate()+skipDays);
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
		$scope.loadingSlots = true;
		$http.get("api/cart/timeslots/"+$scope.currDate).success(function(response){

			var arr = [];

			for(var i in response){
				arr.push(angular.extend({ day: i }, response[i]));
			}

			$scope.timeslots = arr;

		}).finally(function() {
			$timeout(function() {
				$scope.loadingSlots = false;
			},1000);
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
		"1110":'6:30pm',
		"1140":'7pm',
		"1170":'7:30pm',
		"1200":'8pm',
		"1230":'8:30pm',
		"1260":'9pm',
		"1290":'9:30pm',
		"1320":'10pm',
		"1350":'10:30pm',
		"1380":'11pm',
		"1410":'11:30pm',
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
						$scope.timeslot.slotTime = timeslots[key].slots[skey].from;
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
.controller('RepeatOrderController',[
			'$scope','$rootScope','$http','$mdDialog','alcoholCart','sweetAlert','AlcoholProduct'
		,function($scope,$rootScope,$http,$mdDialog,alcoholCart,sweetAlert,AlcoholProduct){

	$scope.lastorder = {};
	$scope.error = true;

	$scope.$watch('alcoholCart.$cart.consumer',

		function(newValue, oldValue) {

			if(angular.isUndefined(alcoholCart.$cart.consumer)){
				return false;
			}

			$scope.fetching = true;

			$scope.repeatOrderInit();

		},true
	);

	$scope.repeatOrderInit = function(){		

		$http.get("api/user/lastorder/"+alcoholCart.$cart.consumer._id+"/"+1).then(

				function(response){

					if(response.data.order){

						var products = [];
						angular.forEach(response.data.order.products,function(oPro){
							var product = new AlcoholProduct(oPro);
							products.push(product);
						});

						angular.forEach(products,function(product){

							angular.forEach(response.data.order.products,function(oPro){
								
								if(product._id===oPro._id.$id){

									product.qChilled = oPro.orderQty.chilled;
									product.qNChilled = oPro.orderQty.nonChilled;
									product.selected = true;

								}
							});

						})

						response.data.order.products = products;

						$scope.lastorder = response.data.order;
						
						$scope.fetching = false;
						$scope.error = false;
					}

				},
				function(errorRes){

				}
			)

	}

	$scope.selectAll = function(selected) {
		$scope.lastorder.products.forEach(function(product){			
			product.selected = selected;
		})
	}

	$scope.repeatOrder = function(ev) {

		$mdDialog.show({

			controller: "ShopFromPreviousController",
			templateUrl: '/templates/users/repeat-order.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false,
			fullscreen:true
		})
		.then(function(answer) {

		}, function() {

		});

	};

	$scope.shopFromPrevious = function(ev){

		$mdDialog.show({

			controller: "ShopFromPreviousController",
			templateUrl: '/templates/users/shopFromPrevious.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:false,
			fullscreen:true

		})
		.then(function(answer) {

		}, function() {

		});

	}

	$scope.$watch('lastorder.products', function() {
		var count = 0;
		angular.forEach($scope.lastorder.products, function(product) {
			if(product.selected)
				count++;
		});
		$scope.selectedCount = count;
	}, true);

	$scope.selectPro = function () {

		var isAllSelected = true;
		angular.forEach($scope.lastorder.products, function(product) {

			if(!product.selected){
				isAllSelected = false;
			}

		})

		$scope.allSelected = isAllSelected;

	}

	$scope.addSelected = function(){

		var selected = {
			products : []
		};

		angular.forEach($scope.lastorder.products, function(product) {

			var selPro = {
							id : product._id,
							quantity : {
								chilled : product.qChilled,
								nonChilled : product.qNChilled
							}
							
						};			

			if((selPro.quantity.chilled+selPro.quantity.nonChilled)>0){
				selected.products.push(selPro);
			}

		})

		if(selected.products.length){

			$scope.processAdding = true;

			alcoholCart.addBulk(selected).then(

				function(response){
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Previous order products added to cart"});
				},
				function(errorRes){

					sweetAlert.swal({
						type:'error',
						title: 'Oops...',
						text:'Something went wrong',
						timer: 2000
					});

				}

			).finally(function(){

				angular.forEach($scope.lastorder.products, function(product) {
					product.selected = false;
				});

				$scope.allSelected = false;
				$scope.processAdding = false;

			});

		}else{

			sweetAlert.swal({
				type:'error',
				title: 'Oops...',
				text:'Please select a product to add',
				timer: 2000
			});

		}

	}
}])
.directive('userCards', function(){

	return {
		scope :{
			paymentmode: '=paymentmode',
			payment:'=payment'
		},
		restrict: 'A',
		templateUrl: '/templates/partials/addcard.html',
		controller: function($scope,$rootScope,$http,$state,$payments,sweetAlert,alcoholCart){

			$scope.$on('addcardsubmit', function() {
	            $scope.addnewcard();
	        });

	    	$scope.userdata = alcoholCart.getUser();

		    $scope.verified = function () {
		    	return $payments.verified();
		    }

		    $scope.addnewcard = function(){
		    	if($scope.paymentmode){
		    		$scope.payment.creditCard.token = 1;
		    	}
		    	$scope.processingcard = true;
		    	$scope.errors = [];
				$http.post('api/payment/addcard',$scope.payment.creditCard).success(function(rdata){

					if($scope.paymentmode){
						$scope.payment.creditCard = rdata.card;

						alcoholCart.deployCart().then(
							function(result){
								$state.go('mainLayout.checkout.review');
							}
						);

					}else{
						$scope.payment.card = '';
						$scope.userdata = rdata.user;
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
						$scope.userdata = rdata.user;
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

			var offset = 0; 
			var range = 10;
			var currentYear = new Date().getFullYear();			
			$scope.years = [];
            for (var i = (offset*1); i < (range*1) + 1; i++){
                $scope.years.push(currentYear + i);
            }

            $scope.months = [];
            for (var i = 0; i < 12; i++){
                $scope.months.push(1 + i);
            }
			/*$scope.testCard = [
		        {
		          token_id:"2992471298821111",
		          type: 'maestro',
		        }, {
		          token_id:"2992471298821111",
		          type: 'dinersclub',
		        }, {
		          token_id:"2992471298821111",
		          type: 'laser',
		        }, {
		          token_id:"2992471298821111",
		          type: 'jcb',
		        }, {
		          token_id:"2992471298821111",
		          type: 'unionpay',
		        }, {
		          token_id:"2992471298821111",
		          type: 'discover',
		        }, {
		          token_id:"2992471298821111",
		          type: 'mastercard',
		        }, {
		          token_id:"2992471298821111",
		          type: 'amex',
		        }, {
		          token_id:"2992471298821111",
		          type: 'visa',
		        }
		      ];*/
		}
	};
})
.filter('creditcard', function() {
	return function(number) {
		var r = number.substr(number.length-4,4);
		return 'XXXX XXXX XXXX '+r;
	}
})
