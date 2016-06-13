'use strict';

angular.module('alcoholCart.directives',[])

	.controller('CartTopController',['$scope', 'alcoholCart', function($scope, alcoholCart) {
		
		$scope.alcoholCart = alcoholCart;

		$scope.scrollconfig = {
				autoHideScrollbar: false,
				theme: 'light',
				setHeight: 200,
				scrollInertia: 0
			}

	}])

	.directive('alcoholcartAddtocart', ['alcoholCart', function(alcoholCart){
		return {
			restrict : 'E',
			controller : 'CartController',
			scope: {
				id:'@',
				name:'@',
				quantity:'@',
				quantityMax:'@',
				price:'@',
				data:'='
			},
			transclude: true,
			templateUrl: function(element, attrs) {
				if ( typeof attrs.templateUrl == 'undefined' ) {
					return 'template/alcoholCart/addtocart.html';
				} else {
					return attrs.templateUrl;
				}
			},
			link:function(scope, element, attrs){
				scope.attrs = attrs;
				scope.inCart = function(){
					return  alcoholCart.getItemById(attrs.id);
				};

				if (scope.inCart()){
					scope.q = alcoholCart.getItemById(attrs.id).getQuantity();
				} else {
					scope.q = parseInt(scope.quantity);
				}

				scope.qtyOpt =  [];
				for (var i = 1; i <= scope.quantityMax; i++) {
					scope.qtyOpt.push(i);
				}

			}

		};
	}])

	.directive('alcoholcartCart', [function(){
		return {
			restrict : 'E',
			controller : 'CartController',
			scope: {},
			templateUrl: function(element, attrs) {
				if ( typeof attrs.templateUrl == 'undefined' ) {
					return 'template/alcoholCart/cart.html';
				} else {
					return attrs.templateUrl;
				}
			},
			link:function(scope, element, attrs){

			}
		};
	}])

	.directive('alcoholcartSummary', [function(){
		return {
			restrict : 'E',
			controller : 'CartTopController',
			replace: true,
			scope: {},
			transclude: true,
			templateUrl: function(element, attrs) {
				if ( typeof attrs.templateUrl == 'undefined' ) {
					return 'templates/partials/headerCartSummary.html';
				} else {
					return attrs.templateUrl;
				}
			}
		};
	}])

	.directive('alcoholcartCheckout', [function(){
		return {
			restrict : 'E',
			controller : ('CartController', ['$rootScope', '$scope', 'alcoholCart', 'fulfilmentProvider', function($rootScope, $scope, alcoholCart, fulfilmentProvider) {
				$scope.alcoholCart = alcoholCart;

				$scope.checkout = function () {
					fulfilmentProvider.setService($scope.service);
					fulfilmentProvider.setSettings($scope.settings);
					fulfilmentProvider.checkout()
						.success(function (data, status, headers, config) {
							$rootScope.$broadcast('alcoholCart:checkout_succeeded', data);
						})
						.error(function (data, status, headers, config) {
							$rootScope.$broadcast('alcoholCart:checkout_failed', {
								statusCode: status,
								error: data
							});
						});
				}
			}]),
			scope: {
				service:'@',
				settings:'='
			},
			transclude: true,
			templateUrl: function(element, attrs) {
				if ( typeof attrs.templateUrl == 'undefined' ) {
					return 'template/alcoholCart/checkout.html';
				} else {
					return attrs.templateUrl;
				}
			}
		};
	}]);
