/*This is the main file where angular is defined*/
var MobileApp = angular.module('MobileApp', [
	'ui.router',
	'19degrees.ngSweetAlert2',
	'ui.bootstrap',
	'ngMaterial',
	'ngPayments',
	'ngRoute'
]).config(['$locationProvider',function($locationProvider){
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);

/* Setup Routing For All Pages */
MobileApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
	// Redirect any unmatched url
	$urlRouterProvider.otherwise("/");

	$stateProvider
		.state('mainLayout',{
			//abstract:true,
			url: "/devicepayment/{deviceconfigid}",
			views: {
				"": {
					templateUrl: '/templates/mobileappLayout.html',
					controller: 'MobileAppController',
				},
				"addcard@mainLayout": {
					templateUrl: '/templates/partials/addcard.html',
				},
				"deviceconfiguredcard@mainLayout": {
					templateUrl: '/templates/partials/deviceConfiguredCard.html',
				},
			},
			data: {pageTitle: 'Device Payment'}
		});
}]);

MobileApp.factory("UserService", ["$q", "$timeout", "$http", "$state", function($q, $timeout, $http, $state) {

	function GetUserAddress(){

	};

	function LogoutReset(){

	};

	function getIfUser(serverCheck, redirect){
		var _self = this;

		if(serverCheck)
			return $http.get("/loggedUser")
			.then(function(res){
				if(!res.data || !res.data.auth){
					_self.currentUser = false;
					if(redirect) {
						$state.go('mainLayout.index', null, {reload: true});
					}
				}
				else
					_self.currentUser = res.data;

				return angular.copy(_self.currentUser);
			})
			.catch(function(err){
				_self.currentUser = false;
				throw err;
			});

		return angular.copy(_self.currentUser);
	};

	return {
		GetUserAddress: GetUserAddress,
		currentUser: null,
		currentUserAddress: null,
		getIfUser:getIfUser,
	};
}]);

/* Setup App Main Controller */
MobileApp.controller('MobileAppController', [
	'$scope','$rootScope','$http','$state','$stateParams','$payments','$sce','UserService','sweetAlert', '$timeout', '$routeParams',
	function($scope,$rootScope,$http,$state,$stateParams,$payments,$sce,UserService,sweetAlert, $timeout,$routeParams){		

		$scope.adminmode = true; // To remove card delete option
    	$scope.userdata = {savedCards:[]};
		$scope.isConfiguredCardFound = false;
    	$scope.paymentmode = true;
		$scope.payment = {};
    	$scope.payment.creditCard = {token_id:"", type:""};

		// get device configuration id
		var deviceconfigid = $stateParams.deviceconfigid;
		// console.log($deviceconfigid);
		if(typeof deviceconfigid!='undefined'){
			$http.get('/cart/configuredCard/'+deviceconfigid)
			.success(function(data){
				// get cart payment detail
				$scope.payment.paymentres = data.cart;

				if(data.success==false){
					$scope.isConfiguredCardFound = false;
					$scope.userdata.user = data.user;
					$scope.userdata.savedCards = data.cards;
				}else{
					$scope.isConfiguredCardFound = true;
					$scope.payment.creditCard = data.cards;
					$scope.payment.card = data.cards.token_id;
				}
			})
			.error(function(errors){
				sweetAlert.swal({
					type:'error',
					text:errors.message,
				});
			});
		}


		/* --------------- Device Payment Start --------------- */
		// $scope.payment = alcoholCart.$cart.payment;

		if(typeof $scope.payment.creditCard != 'undefined'){
			$scope.payment.creditCard.cvc = '';
		}

		if(typeof $scope.payment.savecard == 'undefined'){
			$scope.payment.savecard = true;
		}

		$scope.proceedReview = function(){

			$deployCart = false;

			if(typeof $scope.payment.card == 'undefined' || $scope.payment.card == "" || $scope.payment.card == null){
				sweetAlert.swal({
					type:'error',
					text:"Please select card for payment.",
				});
			}else{
				if($scope.payment.card == 'newcard'){
					$scope.$broadcast('addcardsubmit');
				}else{
					if(!$scope.payment.creditCard.cvc || $scope.payment.creditCard.cvc == ''){
						sweetAlert.swal({
							type:'error',
							text:"Please enter cvv for the selected card.",
						});
					}else{
						$deployCart = true;
					}
				}
			}

			if($deployCart){
				$http.post('/cart/deviceOrder/'+deviceconfigid,$scope.payment.creditCard)
				.success(function(response){
					var payurl = $sce.trustAsResourceUrl(response.formAction);
					$scope.$broadcast('gateway.redirect', {
						url: payurl,
						method: 'POST',
						params: response.formData
					})/*.done()*/;
				})
				.error(function(errors){
					sweetAlert.swal({
						type:'error',
						text:errors.message,
					});
				});
			}

		}
		/* --------------- Device Payment End --------------- */


		$scope.$on('addcardsubmit', function(){
            $scope.addnewcard();
        });

	    $scope.verified = function () {
	    	return $payments.verified();
	    }

	    $scope.addnewcard = function(){

	    	if($scope.paymentmode){
	    		$scope.payment.creditCard.token = 1;
	    	}
	    	$scope.processingcard = true;
	    	$scope.errors = [];
			$http.post('/api/payment/addcard/'+$scope.userdata.user,$scope.payment.creditCard).success(function(rdata){

				if($scope.paymentmode){
					$scope.payment.creditCard = rdata.card;

					$http.post('/cart/deviceOrder/'+deviceconfigid,$scope.payment.creditCard)
					.success(function(response){
						var payurl = $sce.trustAsResourceUrl(response.formAction);
						$scope.$broadcast('gateway.redirect', {
							url: payurl,
							method: 'POST',
							params: response.formData
						})/*.done()*/;
					})
					.error(function(errors){
						sweetAlert.swal({
							type:'error',
							text:errors.message,
						});
					});
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
			$scope.payment.creditCard.cvc = '';
		}

		var offset = 0; range = 10;
		var currentYear = new Date().getFullYear();			
		$scope.years = [];
		for(var i = (offset*1); i < (range*1) + 1; i++){
			$scope.years.push(currentYear + i);
		}

        $scope.months = [];
		for(var i = 0; i < 12; i++){
			$scope.months.push(1 + i);
		}

		/*$scope.userdata.savedCards = [
			{
				token_id:"2992471298821111",
				type: 'maestro',
			},{
				token_id:"2992471298831111",
				type: 'dinersclub',
			}, {
				token_id:"2992471298841111",
				type: 'laser',
			}, {
				token_id:"2992471298851111",
				type: 'jcb',
			}, {
				token_id:"2992471298861111",
				type: 'unionpay',
			}, {
				token_id:"2992471298871111",
				type: 'discover',
			}, {
				token_id:"2992471298881111",
				type: 'mastercard',
			}, {
				token_id:"2992471298891111",
				type: 'amex',
			}, {
				token_id:"2992471298801111",
				type: 'visa',
			}
		];*/
	}
])
.directive('paymentForm', ['$rootScope','$timeout',function($rootScope,$timeout){
	return {
		restrict: 'E',
        replace: true,
        template:
            '<form action="{{ formData.url }}" method="{{ formData.method }}">' +
            '   <div ng-repeat="(key,val) in formData.params">' +
            '       <input type="hidden" name="{{ key }}" value="{{ val }}" />' +
            '   </div>' +
            '</form>',
        link: function($scope, $element, $attrs) {
            $scope.$on('gateway.redirect', function(event, data) {
                $scope.formData = data;
                $timeout(function() {
                    $rootScope.$broadcast('redirecting','Wait while we redirect you to the payment gateway..');
                    $element.submit();
                });
            })
        }
	};
}]);

/* Init global settings and run the app */
MobileApp.run([
		"$rootScope", "$state", "$log", "$location", "$timeout", "$stateParams", "$http", "$filter", 
		function($rootScope, $state, $log, $location, $timeout, $stateParams, $http, $filter){
			$rootScope.$state = $state; // state to be accessed from view
}]);

/*AngularJS Credit Card Payment Service*/
angular.module('ngPayments', [])
	.factory('$payments', function() {

		var verCC, verCVC, verEXP, defaultFormat, isIE, verName;
		isIE = (document.documentMode && document.documentMode < 9); //Don't try to deal with selections on < IE9
		defaultFormat = /(\d{1,4})/g;

		return {

			verified: function() {
				return verCC && verCVC && verEXP && verName;
			},

			cards: [
			{
				type: 'maestro',
				pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
				format: defaultFormat,
				length: [12, 13, 14, 15, 16, 17, 18, 19],
				cvcLength: [3],
				luhn: true
			}, {
				type: 'dinersclub',
				pattern: /^(36|38|30[0-5])/,
				format: defaultFormat,
				length: [14],
				cvcLength: [3],
				luhn: true
			}, {
				type: 'laser',
				pattern: /^(6706|6771|6709)/,
				format: defaultFormat,
				length: [16, 17, 18, 19],
				cvcLength: [3],
				luhn: true
			}, {
				type: 'jcb',
				pattern: /^35/,
				format: defaultFormat,
				length: [16],
				cvcLength: [3],
				luhn: true
			}, {
				type: 'unionpay',
				pattern: /^62/,
				format: defaultFormat,
				length: [16, 17, 18, 19],
				cvcLength: [3],
				luhn: false
			}, {
				type: 'discover',
				pattern: /^(6011|65|64[4-9]|622)/,
				format: defaultFormat,
				length: [16],
				cvcLength: [3],
				luhn: true
			}, {
				type: 'mastercard',
				pattern: /^5[1-5]/,
				format: defaultFormat,
				length: [16],
				cvcLength: [3],
				luhn: true
			}, {
				type: 'amex',
				pattern: /^3[47]/,
				//format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
				format: defaultFormat,
				length: [15],
				cvcLength: [3, 4],
				luhn: true
			}, {
				type: 'visa',
				pattern: /^4/,
				format: defaultFormat,
				length: [13, 14, 15, 16],
				cvcLength: [3],
				luhn: true
			}],

			reFormatCardNumber: function(num) {
				var card, groups, upperLength, _ref;
				card = this.cardFromNumber(num);
				if(!card){
				  return num;
				}
				upperLength = card.length[card.length.length - 1];
				num = num.replace(/\D/g, '');
				num = num.slice(0, +upperLength + 1 || 9e9);
				if(card.format.global){
				  return (_ref = num.match(card.format)) != null ? _ref.join(' ') : void 0;
				}else{
				  groups = card.format.exec(num);
				  if (groups != null) {
				    groups.shift();
				  }
				  return groups != null ? groups.join(' ') : void 0;
				}
			}, //reFormatCardNumber

			cardFromNumber: function(num){
				var card, _i, _len;
				num = (num + '').replace(/\D/g, '');
				for (_i = 0, _len = this.cards.length; _i < _len; _i++) {
				  card = this.cards[_i];
				  if (card.pattern.test(num)) {
				    return card;
				  }
				}
			}, //cardFromNumber

			luhnCheck: function(num) {
				var digit, digits, odd, sum, _i, _len, card, length;
				odd = true;
				sum = 0;
				card = this.cardFromNumber(num);
				if(!card) { return false; }
				length = card.length[card.length.length - 1];
				digits = (num + '').split('').reverse();
				for (_i = 0, _len = digits.length; _i < _len; _i++) {
				  digit = digits[_i];
				  digit = parseInt(digit, 10);
				  if ((odd = !odd)) {
				    digit *= 2;
				  }
				  if (digit > 9) {
				    digit -= 9;
				  }
				  sum += digit;
				}
				return verCC = sum % 10 === 0;
			}, //luhnCheck

			validateCardExpiry: function(month, year) {
				var currentTime, expiry, prefix, _ref;
				if (typeof month === 'object' && 'month' in month) {
				  _ref = month, month = _ref.month, year = _ref.year;
				}
				if (!(month && year)) {
				  return verEXP = false;
				}
				if (!/^\d+$/.test(month)) {
				  return verEXP = false;
				}
				if (!/^\d+$/.test(year)) {
				  return verEXP = false;
				}
				if (!(parseInt(month, 10) <= 12)) {
				  return verEXP = false;
				}
				if (year.length === 2) {
				  prefix = (new Date).getFullYear();
				  prefix = prefix.toString().slice(0, 2);
				  year = prefix + year;
				}
				expiry = new Date(year, month);
				currentTime = new Date;
				expiry.setMonth(expiry.getMonth() - 1);
				expiry.setMonth(expiry.getMonth() + 1, 1);
				return verEXP = expiry > currentTime;
			}, //validateCardExpiry

			validateCVC: function(a, b) {
				return verCVC = a.indexOf(b)>-1;
			},

			validateName: function(n) {
				return verName = (n != "" && n != null);
			}
		}
	}
)
.directive('validateCard', ['$payments', function($payments) {
  return {
    require: 'ngModel',
    scope: {
      ngModel: '='
    },
    link: function(scope, elem, attrs) {

      var expm, expy, card, length, upperLength, cvvLength, ccVerified, cname;

      upperLength = 16;
      ccVerified = false;

      scope.$watch('ngModel.number', function(newValue, oldValue) {
        if(newValue) {
          card = $payments.cardFromNumber(newValue);
          if(card && card.type) { scope.ngModel.type = card.type; }
          if (card) {
            upperLength = card.length[card.length.length - 1];
          }
          length = newValue.replace(/\D/g, '').length;
          if(length == upperLength) {
            ccVerified = scope.ngModel.valid = $payments.luhnCheck(newValue.replace(/\D/g, ''));
          }
          if(ccVerified && length != upperLength) {
            ccVerified = scope.ngModel.valid = false;
          }
          /*if(card && scope.ngModel.cvc){
          	var cl = scope.ngModel.cvc.length;
          	scope.ngModel.cvcValid = $payments.validateCVC(card.cvcLength, cl);
          }*/
        }
      }, true);

      scope.$watch('ngModel.month', function(newValue, oldValue) {

			expm = newValue;
			scope.expiry = $payments.validateCardExpiry(expm, expy);

      }, true);

      scope.$watch('ngModel.year', function(newValue, oldValue) {

			expy = newValue;
			scope.expiry = $payments.validateCardExpiry(expm, expy);

      }, true);

      scope.$watch('ngModel.cvc', function(newValue, oldValue) {
        	if(newValue && card){
        		scope.ngModel.cvcValid = $payments.validateCVC(card.cvcLength, newValue.length);
            }
      }, true);

      scope.$watch('ngModel.name', function(newValue, oldValue) {
			cname = newValue;
			scope.nameValid = $payments.validateName(cname);
      }, true);

    }
  }
}])
.directive('formatCard', ['$payments','$timeout', function($payments, $timeout) {
return {
    scope: false,
    link: function(scope, elem, attrs, validateCtrl) {

      //Format and determine card as typing it in
      elem.on('keypress', function(e) {
        var digit, re, card, value, length;
        if(e.which === 8 || e.metaKey || (!e.which && e.keyCode)) {
            return;
        }

        digit = String.fromCharCode(e.which);
        if (!/^\d+$/.test(digit)) {
          e.preventDefault();
          return;
        }
        value = elem.val();

        card = $payments.cardFromNumber(value + digit);

        length = (value.replace(/\D/g, '') + digit).length;
        upperLength = 16;

        if (card) {
          upperLength = card.length[card.length.length - 1];
        }

        if (length > upperLength) {
          e.preventDefault();
          return;
        }

        if (!this.isIE && (e.currentTarget.selectionStart != null) && (e.currentTarget.selectionStart !== value.length)) {
          return;
        }

        if (card && card.type === 'amex') {
          re = /^(\d{4}|\d{4}\s\d{6})$/;
        } else {
          re = /(?:^|\s)(\d{4})$/;
        }

        if (re.test(value)) {
          e.preventDefault();
          elem.val(value + ' ' + digit);
        } else if (re.test(value + digit) && length < upperLength) {
          e.preventDefault();
          elem.val(value + digit + ' ');
        }
      });

      //Format the card if they paste it in and check it
      elem.on('paste', function(e) {
        $timeout(function() {
          var formatted, value;
          value = elem.val();
          var formatted = $payments.reFormatCardNumber(value);
          elem.val(formatted);
        });
      });
    }
}
}]);

MobileApp.filter('creditcard', function() {
	return function(number) {		
		var r = number.substr(number.length-4,4);
		return 'XXXX XXXX XXXX '+r;
	}
});

MobileApp.filter('creditcardname', function() {
	return function(name) {
		var cardName = {
			visa:'VISA',
			maestro:'Maestro',
			dinersclub:'Diners Club',
			laser:'LASER',
			jcb:'JCB',
			unionpay:'UnionPay',
			discover:'Discover',
			mastercard:'MasterCard',
			amex:'American Express'
		};		
		return cardName[name];
	}
});

MobileApp.filter('filterParentCat', function(){

	return function(pCategories){

		var inputArray = [];

		for(var key in pCategories) {

			if(typeof pCategories[key].featured!=='undefined' && pCategories[key].featured.length>0){
				inputArray.push(pCategories[key]);
			}

		}

		return inputArray;
	}

});

MobileApp.filter('dateSuffix', ['$filter',function ($filter) {
    var suffixes = ["th", "st", "nd", "rd"];
    return function (input) {
        var dtfilter = $filter('date')(input, 'dd');
        var day = parseInt(dtfilter, 10);
        var relevantDigits = (day < 30) ? day % 20 : day % 30;
        var suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
        
        var weekDay = $filter('date')(input, 'EEEE');
        var monthYear = $filter('date')(input, 'MMMM')+', '+$filter('date')(input, 'yyyy');

        //Thursday, 13 October, 2016
        return weekDay+', '+day+suffix+' '+monthYear;
    };
}]).directive('ngSpinnerBar', ['$rootScope',function($rootScope) {
	return {
		link: function(scope, element, attrs) {
			// by defult hide the spinner bar
			element.addClass('hide'); // hide spinner bar by default

			
			// display the spinner bar whenever the route changes(the content part started loading)
			$rootScope.$on('$stateChangeStart', function() {

				if(!(angular.isDefined($rootScope.processingOrder) && $rootScope.processingOrder===true))
				element.removeClass('hide'); // show spinner bar
				//$('#sectionarea').addClass('hide');
			});

			// hide the spinner bar on rounte change success(after the content loaded)
			$rootScope.$on('$stateChangeSuccess', function() {
				element.addClass('hide'); // hide spinner bar
				$('#sectionarea').removeClass('hide');
				//$('body').removeClass('page-on-load'); // remove page loading indicator
				// auto scorll to page top
				setTimeout(function () {
					$('body').scrollTop(); // scroll to the top on content load
				}, 0);     
			});

			// handle errors
			$rootScope.$on('$stateNotFound', function() {
				element.addClass('hide'); // hide spinner bar
				$('#sectionarea').removeClass('hide');
			});

			// handle errors
			$rootScope.$on('$stateChangeError', function() {
				element.addClass('hide'); // hide spinner bar
				$('#sectionarea').removeClass('hide');
			});
		}
	};
}]);