AlcoholDelivery.directive('sideBar', function() {
	return {
		restrict: 'E',
		templateUrl: '/templates/partials/sidebar.html',
		controller: function($scope){
								
				$scope.childOf = function(categories, parent){
					
						if(!categories) return [];

						if(!parent || parent==0){
								return categories.filter(function(category){
										return (!category.ancestors || category.ancestors.length==0);
								});
						}

						return categories.filter(function(category){
								return (category.ancestors && category.ancestors.length > 0 && category.ancestors[0]._id["$id"] == parent);
						});
				}
				
		}
	};
});

 AlcoholDelivery.directive('topMenu', function(){

	return {
		restrict: 'E',
		/*scope:{
			user:'='
		},*/
		templateUrl: '/templates/partials/topmenu.html',
		controller: function($scope,$rootScope,$http,$state,sweetAlert,$facebook){			
			
			$scope.list = [];

			$scope.signup = {
				terms:null
			};

			$scope.login = {};
			$scope.forgot = {};
			$scope.reset = {};
			$scope.errors = {};
			$scope.signup.errors = {};
			$scope.forgot.errors = {};
			$scope.reset.errors = {};

			$scope.signupSubmit = function() {
				$http.post('/auth/register',$scope.signup).success(function(response){
	                $scope.user = response;
					$scope.user.name = response.email;	                

	                sweetAlert.swal({
						type:'success',
						title: "Congratulation!",
						text : "Account Created successfully. Please check your mail to verify your account",
						timer: 10000
					});

					$('#register').modal('hide');

	            }).error(function(data, status, headers) {                            
	                $scope.signup.errors = data;                
	            });
			};

			$scope.loginSubmit = function(){

				$http.post('/auth',$scope.login).success(function(response){
	                
	                $scope.login = {};
	                $scope.user = response;
					$scope.user.name = response.email;
	                $('#login').modal('hide');
	                $scope.errors = {};
	                
	                var deliverykey = localStorage.getItem("deliverykey");
					console.log(deliverykey)
	                if(deliverykey!==null && typeof deliverykey!=="undefined"){
						
						$http.put('cart/merge/'+deliverykey).success(function(response){
							
							$state.go($state.current, {}, {reload: true});

						}).error(function(data, status, headers) {

			                $scope.errors = data;

			            });

	            	}


				}).error(function(data, status, headers) {

	                $scope.errors = data;

	            });
			};

			$http.get('/check').success(function(response){
	            $scope.user = response;            
	        }).error(function(data, status, headers) {                            
	          	
	        });

	        $scope.forgotSubmit = function() {
				$http.post('/password/email',$scope.forgot).success(function(response){					
	                $scope.forgot = {};	                
	                $scope.forgot.message = response.message;
	                $('#forgot_password').modal('hide');
	                $('#forgot_password_sent').modal('show');	                
	            }).error(function(data, status, headers) {                            
	                $scope.forgot.errors = data;                
	            });
			};

			$scope.resetSubmit = function() {

				$scope.reset.token = $rootScope.token;
				
				$http.post('/password/reset',$scope.reset).success(function(response){					
	                $scope.reset = {};
	                $scope.reset.errors = {};

	                $('#reset').modal('hide');
	                
		                sweetAlert.swal({
							type:'success',
							title: "Congratulation!",
							text : response.message,
							timer: 4000,
							closeOnConfirm: false
						});

		                setTimeout(function(){
							$state.go('mainLayout.login');
						},4000)

						

	            }).error(function(data, status, headers) {

	            	if(typeof data.token !== "undefined" && data.token===false){

	            		$('#reset').modal('hide');
	            		$state.go('mainLayout.index');

	            		sweetAlert.swal({
							type:'warning',
							title: "Not a valid token",							
							timer: 4000,
							showConfirmButton:false,
							closeOnConfirm: false
						})
	            	}

	                $scope.reset.errors = data;                
	            });
			};



	        $scope.logout = function() {
				$http.get('/auth/logout').success(function(response){
	                
	                $scope.user = {};	                

	                // Destroy Cart Params start
	                delete $rootScope.deliverykey
	                localStorage.removeItem("deliverykey");
	                // Destroy Cart Params end


	                $state.go("mainLayout.index", {}, {reload: true});

	            }).error(function(data, status, headers) {
	                $scope.user = {};
	                $facebook.logout();   									
	            });
			};

			
		}
	};
})

.directive("owlCarousel", function(){

    return {
        restrict: 'E',
        transclude: false,
        
        link: function (scope) {

            scope.initCarousel = function(element,ngModel) {
              // provide any default options you want

                var defaultOptions = {
                };
                var customOptions = scope.$eval($(element).attr('data-options'));
                // combine the two options objects
                for(var key in customOptions) {
                    defaultOptions[key] = customOptions[key];
                }

            	// init carousel
            	if(typeof $(element).data('owlCarousel') === "undefined"){
            		
                	scope[ngModel] = $(element).owlCarousel(defaultOptions);

            	}
            };
        }
    };
})

.directive('owlCarouselItem', [function() {
    return {
        restrict: 'A',
        transclude: false,
        link: function(scope, element) {
        					          
          	if(scope.$first && typeof $(element.parent()).data('owlCarousel') !== "undefined"){

          		$(element.parent()).data('owlCarousel').destroy();
          		$(element.parent()).find(".owl-wrapper").remove();

          	}

            if(scope.$last) {

                scope.initCarousel(element.parent(),element.parent().attr("ng-model"));

            }
        }
    };
}])

.directive("tscroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             
             if(element.hasClass('fixh')) return;

             if (this.pageYOffset >= 1) {
                 element.addClass('navbar-shrink');                 
             } else {
                 element.removeClass('navbar-shrink');                 
             }
        });
    };
})

.directive('errProSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {

        element.parent(".prod_pic").addClass("no-image");

          attrs.$set('src', attrs.errSrc);
        
      });
    }
  }
})

.directive('onlyDigits', function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, element, attr, ctrl) {
        function inputValue(val) {
          if (val) {
            var digits = val.replace(/[^0-9]/g, '');

            if (digits !== val) {
              ctrl.$setViewValue(digits);
              ctrl.$render();
            }
            return parseInt(digits,10);
          }
          return undefined;
        }            
        ctrl.$parsers.push(inputValue);
      }
    };
})

.directive('ngTouchSpin', ['$timeout', '$interval', function($timeout, $interval) {
	'use strict';

	var setScopeValues = function (scope, attrs) {
		scope.min = attrs.min || 0;
		scope.max = attrs.max || 100;
		scope.step = attrs.step || 1;
		scope.prefix = attrs.prefix || undefined;
		scope.postfix = attrs.postfix || undefined;
		scope.decimals = attrs.decimals || 0;
		scope.stepInterval = attrs.stepInterval || 500;
		scope.stepIntervalDelay = attrs.stepIntervalDelay || 500;
		scope.initval = attrs.initval || '';
		//scope.val = attrs.value || scope.initval;
		scope.verticalButtons = attrs.vertical || false;
	};

	return {
		restrict: 'EA',
		require: '?ngModel',
		scope: {
			'myincrement': '&onIncrement',
			'mydecrement': '&onDecrement',
			'val': "=value"
		},
		replace: true,
		link: function (scope, element, attrs, ngModel) {
			
			setScopeValues(scope, attrs);


			var timeout, timer, helper = true, oldval = scope.val, clickStart;

			ngModel.$setViewValue(scope.val);

			scope.decrement = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) - parseFloat(scope.step)).toFixed(scope.decimals);

				if (parseFloat(value) < parseFloat(scope.min)) {
					value = parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = value;
					ngModel.$setViewValue(value);
					return;
				}

				scope.val = value;
				ngModel.$setViewValue(value);
				scope.mydecrement();
			};

			scope.increment = function () {
				oldval = scope.val;
				var value = parseFloat(parseFloat(Number(scope.val)) + parseFloat(scope.step)).toFixed(scope.decimals);
				
				if (parseFloat(value) > parseFloat(scope.max)) return;
				
				scope.val = value;

				ngModel.$setViewValue(value);
				scope.myincrement();
			};

			scope.startSpinUp = function () {

				scope.checkValue();
				scope.increment();

				clickStart = Date.now();
				scope.stopSpin();

				// $timeout(function() {
				// 	timer = $interval(function() {
				// 		scope.increment();
				// 	}, scope.stepInterval);
				// }, scope.stepIntervalDelay);

			};

			scope.startSpinDown = function () {
				scope.checkValue();
				scope.decrement();

				clickStart = Date.now();

				// var timeout = $timeout(function() {
				// 	timer = $interval(function() {
				// 		scope.decrement();
				// 	}, scope.stepInterval);
				// }, scope.stepIntervalDelay);
			};

			scope.stopSpin = function () {
				if (Date.now() - clickStart > scope.stepIntervalDelay) {
					$timeout.cancel(timeout);
					$interval.cancel(timer);
				} else {
					$timeout(function() {
						$timeout.cancel(timeout);
						$interval.cancel(timer);
					}, scope.stepIntervalDelay);
				}
			};

			scope.checkValue = function () {
				var val;
				scope.val = String(scope.val);
				if (scope.val !== '' && !scope.val.match(/^-?(?:\d+|\d*\.\d+)$/i)) {
					val = oldval !== '' ? parseFloat(oldval).toFixed(scope.decimals) : parseFloat(scope.min).toFixed(scope.decimals);
					scope.val = val;
					ngModel.$setViewValue(val);
				}
			};

		},
		template:
		// '<div class="input-group bootstrap-touchspin">'+

		// '	<span class="input-group-addon bootstrap-touchspin-prefix" ng-show="prefix" ng-bind="prefix"></span>'+

		// '	<input type="text" ng-model="val" class="form-control" ng-blur="checkValue()">'+

		// '	<span class="input-group-addon bootstrap-touchspin-postfix" ng-show="postfix" ng-bind="postfix"></span>'+
			
		// '	<span class="input-group-btn-vertical">'+

		// '		<button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-plus"></i></button>'+

		// '		<button class="btn btn-default bootstrap-touchspin-down"  ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-minus"></i></button>'+

		// '	</span>'+

		// '</div>'

		'<div class="input-group bootstrap-touchspin" ng-class={vertical:!verticalButtons}>' +
		'  <span class="input-group-btn" ng-show="verticalButtons">' +
		'    <button class="btn btn-default bootstrap-touchspin-down" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()">-</button>' +
		'  </span>' +
		'  <span class="input-group-addon bootstrap-touchspin-prefix" ng-show="prefix" ng-bind="prefix"></span>' +
		'  <span class="addmore-count" ng-bind="val"></span>'+
		// '  <input type="text" ng-model="val" class="form-control addmore-count" ng-blur="checkValue()" disabled>' +
		'  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
		'  <span class="input-group-btn" ng-if="verticalButtons">' +
		'    <button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()">+</button>' +
		'  </span>' +

		'  <span class="input-group-btn-vertical" ng-if="!verticalButtons">'+
		'		<button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-plus"></i></button>'+
		'		<button class="btn btn-default bootstrap-touchspin-down"  ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-minus"></i></button>'+
		'	</span>'+
		'</div>'
		// <div class="input-group bootstrap-touchspin">
		// 	<span class="input-group-btn">
		// 		<button class="btn btn-default bootstrap-touchspin-down" type="button">-</button>
		// 	</span>
		// 	<span class="input-group-addon bootstrap-touchspin-prefix" style="display: none;"></span>
		// 	<input id="addmore_count" type="text" value="" name="addmore_count" class="form-control" style="display: block; top: 0px;">
		// 	<span class="input-group-addon bootstrap-touchspin-postfix" style="display: none;"></span>
		// 	<span class="input-group-btn">
		// 		<button class="btn btn-default bootstrap-touchspin-up" type="button">+</button>
		// 	</span>
		// </div>



	};

}])

.directive('alTplProduct',[function($rootScope){
	return {
		restrict: 'A',
		transclude: true,
		scope:{
			productInfo:'=info',
			classes : '@'
		},
		templateUrl: '/templates/product/product_tpl.html',

		controller: ['$rootScope','$scope',function($rootScope,$scope){

			$scope.settings = $rootScope.settings;

			$scope.setPrices = function(localpro){

				if(typeof localpro.categories === "undefined"){return true;}
				
				var catIdIndex = localpro.categories.length - 1;
				var catPriceObj = $rootScope.catPricing[localpro.categories[catIdIndex]];	

				if(typeof catPriceObj === "undefined"){

					console.log("Something wrong with this product : "+localpro._id);
					localpro.quantity = 0;
					return localpro;
				}

				localpro = $.extend(catPriceObj, localpro);
				localpro.price = parseFloat(localpro.price);

				var orderValue = localpro.regular_express_delivery;

				if(orderValue.type==1){
					localpro.price +=  parseFloat(localpro.price * orderValue.value/100);
				}else{
					localpro.price += parseFloat(orderValue.value);
				}

				for(i=0;i<localpro.express_delivery_bulk.bulk.length;i++){

					var bulk = localpro.express_delivery_bulk.bulk[i];

					if(bulk.type==1){
						bulk.price = localpro.price + (localpro.price * bulk.value/100);
					}else{
						bulk.price = localpro.price + bulk.value;
					}
					bulk.price = bulk.price.toFixed(2);
				}

				localpro.price = localpro.price.toFixed(2);
				
				return localpro;

			}
			
			Object.assign($scope.productInfo, $scope.setPrices($scope.productInfo));

		}]
	}
}])

.directive('addToCartBtn',[function(){
	return {
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/templates/partials/addToCartBtn.html';
		},
		scope: {
			product:'=',			
		},
		controller: function($scope,$rootScope,$element,$timeout,$http,CartSession){
			
			$scope.isInCart = false;
			$scope.addMoreCustom = false;
			$scope.element = $element;
			
			$scope.product.quantitycustom = 1;

			$scope.addtocart = function(){

				// $timeout(function() {
				// 	timer = $interval(function() {
				// 		scope.increment();
				// 	}, scope.stepInterval);
				// }, scope.stepIntervalDelay);

				if(typeof $scope.proUpdateTimeOut!=="undefined"){
					$timeout.cancel($scope.proUpdateTimeOut);
				}
				
				$scope.proUpdateTimeOut = $timeout(function(){

					CartSession.GetDeliveryKey().then(

						function(response){						

							$http.put("/cart/"+response.deliverykey, {
									"id":$scope.product._id,
									"quantity":$scope.product.quantitycustom,
									"chilled":$scope.product.servechilled,
								},{

					        }).error(function(data, status, headers) {

					        }).success(function(response) {
					        	if(!response.success){
					        		
					        		switch(response.errorCode){
										case "100":
											$scope.product.quantitycustom = response.data.quantity;
											console.log($scope.product.quantitycustom);
										break;
					        		}

					        	}
					        });

					        if($scope.product.quantitycustom==0){
								$scope.isInCart = false;
								$scope.addMoreCustom = false;
								$scope.product.quantitycustom = 1;
							}

						}

					)
				},1500)
				

			};

			$scope.addCustom = function(){
								
				$scope.activeAddToCart();

			};

			$scope.activeAddToCart = function() {

				$scope.isInCart = true;
				$scope.addMoreCustom = false;

				$timeout(function(){
					$element.find(".addmore-count").animate({ top: "0px"},300);
				}, 100);

				$scope.addtocart();

			};

			$scope.activeAddToCartCustom = function(){
				$scope.addMoreCustom = true;
				
				$timeout(function(){
					$element.find(".addmanual input").animate({ width: "70%"},250).focus();
		  			$element.find(".addmanual .addbuttton").animate({ width: "30%"},250);
				}, 100);
			};
		}
	}
}])

.directive('ngBlur', ['$parse', function($parse){
	return function(scope, element, attr) {
		var fn = $parse(attr['ngBlur']);
		element.on('blur', function(event) {
			scope.$apply(function() {
				fn(scope, {$event:event});
			});
		});
	};
}])

.directive("apFocusOut", ['$document','$parse', function( $document, $parse ){
    return {
        link: function( $scope, $element, $attributes ){
            var scopeExpression = $attributes.apFocusOut,
                onDocumentClick = function(event){
                    var isChild = $element.find(event.target).length > 0;
console.log(isChild);
                    if(!isChild) {
                        $scope.$apply(scopeExpression);
                    }
                };

            $document.on("click", onDocumentClick);

            $element.on('$destroy', function() {
                $document.off("click", onDocumentClick);
            });
        }
    }
}]).directive('backImg', function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
}).directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
}).directive('outOfStock',[function(){
	return {
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/templates/partials/outOfStock.html';
		},
		scope: {
			product:'=',			
		},
		controller: function($scope,$rootScope,$http,$mdToast,$document,UserService,$log){
			
			$scope.nlabel = 'Notify Me';

			$scope.showCustomToast = function() {

				$scope.nlabel = 'Wait..';

				UserService.GetUser().then(

					function(result) {

						if(result.auth===false){
							$scope.nlabel = 'Notify Me';
							$('#login').modal('show');

						}else{
							

							$http.post('/user/notifyme',{pid:$scope.product._id}).success(function(){
								$scope.showPopover(result);
							}).error(function(){
								$scope.nlabel = 'Notify Me';
							});
						}

					}
				);
			};	


			$scope.showPopover = function(result){
				$mdToast.show({			      
			      controller:function($scope){
			      	$scope.user = result;
			      	$scope.closeToast = function(){
			      		$mdToast.hide();
			      	}
			      },
			      templateUrl: '/templates/toast-tpl/notify-template.html',
			      parent : $document[0].querySelector('#toastBounds'),			      
			      //parent : $document[0].querySelector('nav'),
			      position: 'top center',
			      hideDelay:6000
			    });

				$scope.nlabel = 'Notify Me';
			};

		}
	}
}]).directive('notAvailable',[function(){
	return {
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/templates/partials/available-tag.html';
		},		
		scope: {
			product:'=',			
		},
		controller: function($scope,$rootScope,$log){

			$scope.addDays = function(days,mins){
				var curDate = new Date();				
				curDate.setHours(0,0,0,0);
				curDate.setDate(curDate.getDate() + days);
				return curDate.setMinutes(mins);								
			}

			$scope.availDate = $scope.addDays($scope.product.availabilityDays,$scope.product.availabilityTime);

		}
	}
}]);
