AlcoholDelivery.directive('sideBar', function() {
	return {
		restrict: 'E',
		templateUrl: '/templates/partials/sidebar.html',
		controller: ['$scope',function($scope){				

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

			$scope.hideMenu = function(){
				$('.dropdown-menu').removeClass('animate');
			}
			  
		}]
	};
})
.directive('readMore', function() {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    template: '<p></p>',
    scope: {
    	expand: '@',
		moreText: '@',
		lessText: '@',
		words: '@',
		ellipsis: '@',
		char: '@',
		limit: '@',
		content: '@'
    },
    link: function(scope, elem, attr, ctrl, transclude) {
    	
      var moreText = angular.isUndefined(scope.moreText) ? ' <a class="read-more">Read More...</a>' : ' <a class="read-more">' + scope.moreText + '</a>',
        lessText = angular.isUndefined(scope.lessText) ? ' <a class="read-less">Less ^</a>' : ' <a class="read-less">' + scope.lessText + '</a>',
        ellipsis = angular.isUndefined(scope.ellipsis) ? '' : scope.ellipsis,
        limit = angular.isUndefined(scope.limit) ? 150 : scope.limit;

      attr.$observe('content', function(str) {      	
        readmore(str);
      });

      transclude(scope.$parent, function(clone, scope) {
        readmore(clone.text().trim());
      });

      function readmore(text) {

        var text = text,
          orig = text,
          regex = /\s+/gi,
          charCount = text.length,
          wordCount = text.trim().replace(regex, ' ').split(' ').length,
          countBy = 'char',
          count = charCount,
          foundWords = [],
          markup = text,
          more = '';

        if (!angular.isUndefined(attr.words)) {
          countBy = 'words';
          count = wordCount;
        }

        if (countBy === 'words') { // Count words

          foundWords = text.split(/\s+/);

          if (foundWords.length > limit) {
            text = foundWords.slice(0, limit).join(' ') + ellipsis;
            more = foundWords.slice(limit, count).join(' ');
            markup = text + moreText + '<span class="more-text">' + more + lessText + '</span>';
          }

        } else { // Count characters

          if (count > limit) {
            text = orig.slice(0, limit) + ellipsis;
            more = orig.slice(limit, count);
            markup = text + moreText + '<span class="more-text">' + more + lessText + '</span>';
          }

        }

        elem.append(markup);

        elem.find('.read-more').on('click', function() {

			if(scope.expand!='false'){
        	
				$(this).hide();
				elem.find('.more-text').addClass('show').slideDown();
			}

        });
        elem.find('.read-less').on('click', function() {
          elem.find('.read-more').show();
          elem.find('.more-text').hide().removeClass('show');
        });

      }
    }
  };
})
.directive('topMenu', function(){
	return {
		restrict: 'E',
		templateUrl: '/templates/partials/topmenu.html',
		controller: [
		'$scope','$rootScope','$http','$state','$mdDialog','$timeout','$window','appSettings','sweetAlert',
		'UserService','store','alcoholWishlist','ClaimGiftCard','$auth','$cookies',
		function($scope,$rootScope,$http,$state,$mdDialog,$timeout,$window,appSettings,sweetAlert,
			UserService,store,alcoholWishlist,ClaimGiftCard,$auth,$cookies){

					if(angular.isUndefined($cookies.get('announcementDisable'))){
						$scope.announcementDisable = false;
					}else{
						$scope.announcementDisable = true;
					}
										
					$scope.disableAnnouncement = function () {
						$cookies.put('announcementDisable', true);
						$scope.announcementDisable = true;
					}
					

					$scope.list = [];
		
					$scope.menu = {openSearch:true};
		
					$scope.login = {};
					$scope.forgot = {};
					$scope.reset = {};
					$scope.resend = {};
					$scope.resendemail = '';
					$scope.sendmail = {};
		
					$scope.signupSubmit = function() {
						$scope.signup.errors = {};
						$scope.socialError = '';
						if(angular.isDefined($rootScope.refferal)){
							$scope.signup.refferedBy = $rootScope.refferal;
						}
		
						$http.post('/auth/register',$scope.signup).success(function(response){

							$scope.user = response;
							$scope.user.name = response.email;
							sweetAlert.swal({
								title: "Verification email sent",
								text : "Please check your inbox to activate your account and start shopping with us!",
								imageUrl:'/images/send.gif',
								confirmButtonColor: "#aa00ff",
							});
			                $mdDialog.hide();

			            }).error(function(data, status, headers) {

			            	if(angular.isDefined(data.addedViaEci)){

			            		$mdDialog.hide();
			            		sweetAlert.swal({

									title: "Account already exist ",
									text : "An account have already been created for you automatically when you placed your order over the phone on your previous order. We will be sending a reset password email so you can gain access to your account!",
									confirmButtonColor: "#aa00ff",
									// confirmButtonText: 'Send '

								}).then(function() {

									$scope.forgot.email = $scope.signup.email;
									$scope.forgotSubmit();

								});

								return true;

							}
			            		

			                $scope.signup.errors = data;
			            });
					};
		
					// Any change in user login detail will be tracked here
					$scope.$watch(function(){return UserService.currentUser},function(newValue, oldValue) {
						$scope.user = newValue;
					});
		
			        $scope.forgotSubmit = function() {
						$scope.forgot.errors = {};
						$scope.login.errors = {};
						$http.post('/password/email',$scope.forgot).success(function(response){
			                $scope.forgot = {};
			                //$scope.forgot.message = response.message;
			                sweetAlert.swal({
								title: "Reset link sent",
								text : "Please check your inbox to reset your account password",
								imageUrl:'/images/send.gif',
								confirmButtonColor: "#aa00ff", 
							});
			                $mdDialog.hide();
			            }).error(function(data, status, headers) {
			                $scope.forgot.errors = data;
			                $scope.resendemail = angular.copy($scope.forgot.email);
			            });
					};
		
					$scope.logout = function() {
		
						$http.get('/auth/logout').success(function(response){
		
			                $scope.user = null;
			                // Destroy Cart Params start
			                delete $rootScope.deliverykey;
			                localStorage.removeItem("deliverykey");
			                // call promotional banner function on logout
							$rootScope.getPromotionalBanners();
			                $state.go("mainLayout.index", {}, {reload: true});
			                
			            }).error(function(data, status, headers) {
			                $scope.user = {};
			            });
		
					};
		
					$scope.openMenu = function(){
						angular.element('#wrapper').toggleClass('toggled');
						angular.element('body').toggleClass(' hidden-scroll');
					}
		
					$scope.socialError = '';
					//FACEBOOK LOGIN
		
					/*$scope.socialLogin = function(){
						
						FB.login(function(response) {
						    if (response.authResponse) {				     
						     FB.api('/me', {fields: 'first_name,last_name,locale,email,birthday'},function(result) {
						       	
								$http.post('/auth/registerfb',result)
								.success(function(res){
									$mdDialog.hide();
									$scope.loginSuccess(res);
								}).error(function(erresult){
									if(typeof erresult.suspended != 'undefined'){
										$scope.login.errors = erresult;
									}else{
										$mdDialog.hide();	
										$scope.socialError = erresult;
										FB.logout();
										$scope.signupOpen();
									}
								});
						     });
						    } else {
						     	alert(JSON.parse(response));
						    }
						});					
						
					}*/
		
					$scope.loginToggle = function() {
		
						$fblogin({
							fbId: $rootScope.settings.fbid,
							permissions: 'email,user_birthday',
							fields: 'first_name,last_name,locale,email,birthday',
							success:function(response){
								$mdDialog.hide();
								$http.post('/auth/registerfb',response)
								.success(function(res){
		
									$scope.loginSuccess(res);
		
								}).error(function(result){
									$scope.socialError = result;
									$scope.signupOpen();
								});
							},
							error:function(res){
								/*$scope.socialError = 'We are unable to retrieve your email address via Facebook login to complete the sign up. Please change the settings in Facebook or signup via your email address on Alcohol Delivery!';
								$scope.signupOpen();
								*/
							}
						});
					};			
		
				    $scope.signupOpen = function(ev){
					    $scope.signup = {
							terms:null,
							errors:[]
						};
					    $mdDialog.show({
							scope: $scope.$new(),
							controller: function(){
		
							},
							templateUrl: '/templates/partials/signup.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose:true,
							fullscreen:true
						});
					}
		
					$scope.forgotpassOpen = function(ev){
					    $scope.forgot = {errors:[]};
		
					    $mdDialog.show({
							scope: $scope.$new(),
							controller: function(){},
							templateUrl: '/templates/partials/forgotpassword.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose:true,
							fullscreen:true
						});
					}
		
					$scope.hide = function() {
						$mdDialog.hide();
					};
		
					$scope.$on("showLogin", function () {
				        $scope.loginOpen();
				    });
		
				    $scope.$on("showSignup", function (event,args) {
				        $scope.signupOpen();
				    });
		
					$scope.loginOpen = function(ev){
					    $scope.login.errors = {};
					    var elementWrapper = {};
		    			elementWrapper.target = document.getElementById('loginlink');
					    $mdDialog.show({
							scope: $scope.$new(),
							controller: function(){},
							templateUrl: '/templates/partials/login.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose:true,		
							fullscreen:true
						});			
		
					}
		
					$scope.loginSubmit = function(ev){
						$scope.login.errors = {};
						$http.post('/auth',$scope.login).success(function(response){
							$scope.loginSuccess(response);
						}).error(function(data, status, headers) {

							if(angular.isDefined(data.resetRequired)){

								$mdDialog.show({
									scope: $scope.$new(),
									controller: function($scope){
										$scope.guest = data.guest;
									},
									templateUrl: '/templates/partials/resetPasswordRequired.html',
									parent: angular.element(document.body),
									targetEvent: ev,
									clickOutsideToClose:true,
									fullscreen:true
								});

							}

							$scope.login.errors = data;
							$scope.resendemail = angular.copy($scope.login.email);
				        });
					};
			
					$scope.resetPasswordRequiredSubmit = function() {

						$http.post('/password/reset-required-email',{email:$scope.login.email}).success(function(response){

			                sweetAlert.swal({
								title: "Reset link sent",
								text : "Please check your inbox to reset your account password",
								imageUrl:'/images/send.gif',
								confirmButtonColor: "#aa00ff", 
							});
			                $mdDialog.hide();

			            }).error(function(data, status, headers) {

			            });
					};

					//INTIALIZE AFTER USER LOGIN(FB & NORMAL)
				    $scope.loginSuccess = function(response){
				    	UserService.currentUser = response;
				    	$scope.login = {};		  
				        $mdDialog.hide();
				        $scope.errors = {};
				        // call promotional banner function on login
						$rootScope.getPromotionalBanners();
				       	$state.go($state.current, {}, {reload: true});
				        /*store.init().then(
				        	function(successRes){		        
				        	},
				        	function(errorRes){}
				        );
				        alcoholWishlist.init();
				        ClaimGiftCard.claim();*/
				    }	
		
				    $scope.visitLink = function(slug){
				    	$state.go('cmsLayout.pages',{slug:slug,target:'_blank'});
				    }
		
				    $scope.resendverification = function(){
				    	$mdDialog.show({
							scope: $scope.$new(),
							controller: function(){},
							templateUrl: '/templates/partials/resendverification.html',
							parent: angular.element(document.body),
							//targetEvent: ev,
							clickOutsideToClose:true,		
							fullscreen:true
						});
				    }
		
				    $scope.resendSubmit = function(){
				    	$scope.resend.errors = {};
				    	$scope.resend.email = angular.copy($scope.resendemail);
						$http.post('/user/resendverification',$scope.resend).success(function(response){
							$scope.resend = {};
							$scope.resendemail = '';
							sweetAlert.swal({
								title: "Verification email sent",
								text : "Please check your inbox to activate your account and start shopping with us!",
								imageUrl:'/images/send.gif',
								confirmButtonColor: "#aa00ff", 
							});					
			                $mdDialog.hide();
						}).error(function(data, status, headers) {
							$scope.resend.errors = data;
				        });
				    }				    			

				    $scope.authenticate = function(provider) {
				      $scope.login.errors = {};

				      $auth.authenticate(provider).then(function(response) {						
						$mdDialog.hide();
						$scope.loginSuccess(response);
					  }).finally(function(){					  	

					  }).catch(function(erresult) {					  	
				  		if(typeof erresult.data.emailnotfound != 'undefined'){								
							$mdDialog.hide();
							$scope.socialError = erresult.data.emailnotfound;								
							$scope.resendverification();
						}else{															
					  		$scope.login.errors = erresult.data;
						}
					  });

				    };

				    $scope.addEmail = function(){				    	
				    	$scope.sendmail.errors = {};				    	
						$http.post('/auth/socialverification',$scope.sendmail).success(function(response){
							$scope.sendmail = {};							
							sweetAlert.swal({
								title: "Verification email sent",
								text : "Please check your inbox to verify your email and start shopping with us!",
								imageUrl:'/images/send.gif',
								confirmButtonColor: "#aa00ff", 
							});					
			                $mdDialog.hide();
						}).error(function(data, status, headers) {
							$scope.sendmail.errors = data;
				        });
				    }
		
				}]
	};
})
.directive('owlCarousel', ['$timeout',function($timeout){
    return {
        restrict: 'E',
        priority: 100,
        transclude: false,
        replace: true,
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
					$timeout(function(){

						scope[ngModel] = $(element).owlCarousel(defaultOptions);
						if(typeof $(scope[ngModel]).data('owlCarousel')!=='undefined'){
							
							scope[ngModel].visibleItems = $(scope[ngModel]).data('owlCarousel').visibleItems.length;
						}
						

						//visibleItems
					});
				}
            };


        }
    };
}])
.directive('owlCarouselItem', ['$timeout',function($timeout) {

    return {
        restrict: 'A',
        priority: 99,
        transclude: false,
        replace: true,
        link: function(scope, element) {

          	if(scope.$first && typeof $(element.parent()).data('owlCarousel') !== "undefined"){

				$(element.parent()).find(".owl-wrapper-outer").remove();
				//$(element.parent()).find(".owl-wrapper").remove();
          		$(element.parent()).data('owlCarousel').destroy();

          	}

            if(scope.$last) {
            	$timeout(function(){
            		scope.initCarousel(element.parent(),element.parent().attr("ng-model"));
            	});
            }
        }
    };
}])
.directive('tscroll', ['$window',function ($window) {
    return function(scope, element, attrs) {

    	// FIRST METHOD: Morpher
		// var svgMorpheus = new SVGMorpheus('#icon',{rotation:'none'});
		var icons = ['question', 'answer'];
		var prev=1;	

		// SECOND METHOD: Morpher
		/*var json = {"images":[{"points":[{"x":0,"y":37},{"x":112,"y":-5},{"x":171,"y":76},{"x":120,"y":14},{"x":70,"y":5},{"x":31,"y":76},{"x":0,"y":39},{"x":0,"y":76},{"x":171,"y":51}],"src":"images/l2.png","x":0,"y":0},{"points":[{"x":1,"y":17},{"x":52,"y":0},{"x":15,"y":34},{"x":51,"y":11},{"x":27,"y":0},{"x":5,"y":43},{"x":-7,"y":17},{"x":-8,"y":42},{"x":-16,"y":53}],"src":"images/logo-small.png","x":60,"y":23}],"triangles":[[1,3,4],[0,3,4],[0,3,6],[6,3,7],[5,3,7],[2,5,8],[3,5,8]]};
		var morpher = new Morpher(json);
		angular.element('#logosvg').append(morpher.canvas);*/

		// THIRD METHOD: Morpher
		var tl = new TimelineMax({
			paused: true
		});

		tl.staggerTo("#large", 0.5, {morphSVG:"#small"}, 0.06)
		  .to("#small", 0.5, {morphSVG:"#large"}, '-='+tl.duration());


		angular.element($window).bind("scroll", function(e) {

			//if(element.hasClass('fixh')) return;

			if(angular.element('md-backdrop').length == 0 && angular.element('.md-scroll-mask').length == 0){

				if (this.pageYOffset >= 1) {
					element.addClass('navbar-shrink');
					
					if(prev!==0){
						// FIRST METHOD: Morpher
						// svgMorpheus.to(icons[0]);

						// SECOND METHOD: Morpher
						/*morpher.set([1, 0]);
						morpher.animate([0, 1], 300);*/

						// THIRD METHOD: Morpher
						tl.play(0);

						prev = 0;
					}

				} else if(this.pageYOffset == 0) {
					element.removeClass('navbar-shrink');

					if(prev!==1){
						// FIRST METHOD: Morpher
						// svgMorpheus.to(icons[1]);
						
						// SECOND METHOD: Morpher
						/*morpher.set([0, 1]);
						morpher.animate([1, 0], 300);*/

						// THIRD METHOD: Morpher
						tl.reverse();

						prev = 1;	
					}				
				} 

			}
             
        });
    };
}])
.directive('errProSrc', ['$q',function($q) {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {

		element.parent(".prod_pic").addClass("no-image");

		attrs.$set('src', attrs.errSrc);

      });     
    }
  }
}])
.directive('onlyDigits', [function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, element, attr, ctrl) {
        function inputValue(val) {
          if (val) {
          	
            var digits = val.replace(/[^0-9]/g, '');

			if(attr.max){
				var max = parseFloat(attr.max);
				if(digits>max){

					var newVal = ctrl.$modelValue || 0;
					newVal = newVal.toString();
					ctrl.$setViewValue(newVal);
              		ctrl.$render();
              		return parseInt(newVal,10);
				}
			}

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
}])
.directive('onlyCurrency', [function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, element, attr, ctrl) {
        function inputValue(val) {
          if (val) {

            var digits = val.replace(/.*?(\d+(\.\d{0,2})?)?.*/g, '$1');

			if(attr.max){
				var max = parseFloat(attr.max);
				
				if(digits>max){

					var newVal = ctrl.$modelValue || 0;
					newVal = newVal.toString();
					
					ctrl.$setViewValue(newVal);
              		ctrl.$render();
              		return parseInt(newVal,10);
				}
			}

            if (digits !== val) {
              ctrl.$setViewValue(digits);
              ctrl.$render();
            }

            return parseFloat(digits);
          }
          return undefined;
        }
        ctrl.$parsers.push(inputValue);
      }
    };
}])
.directive('useCredits',['UserService', 'alcoholCart',function(UserService, alcoholCart){
	return {
		restrict :'E',
		require : '?ngModel',
		replace : true,
		link : function ($scope, element, attr, ctrl) {

			var userData = UserService.currentUser;
			var uCredits = userData.credits;
			if(!(uCredits>0)){
				$scope.render = false;
			}else{

				var cartTotal = alcoholCart.getCartTotal()
				$scope.render = true;

				if(uCredits>cartTotal){
					$scope.credit = cartTotal;
					
				}else{
					$scope.credit = uCredits;
				}
				$scope.maxCredits = $scope.credit;

			}

			$scope.$watch("credit",function(newVal,oldVal){
				alcoholCart.setCreditDiscount(newVal);
			});

		},
		template : '<div class="checkoutstep5right-middle-first" ng-if="render">'+
						'<div class="checkoutstep5right-middle-title" >Discount (Credits) <span><img src="images/questionimg.png">'+
						'<md-tooltip class="ad-tooltip" md-visible="true" md-direction="bottom">'+
							'Use credits available in account'+
						'</md-tooltip>'+
						'</span></div>'+
						'<div class="checkboxtotaldiv-text-font-size negative-field" ng-class="">'+
							'<input type="text" id="credits-input" max="{{maxCredits}}" only-currency ng-model="$parent.credit">'+
						'</div>'+
					'</div>'
	}
}])
.directive('ngTouchSpin', ['$timeout', '$interval', function($timeout, $interval) {
	'use strict';

	var setScopeValues = function (scope, attrs) {
		scope.min = attrs.min || 0;
		// scope.max = attrs.max || 100;
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
			'val': "=value",
			'max': "=mquantity",
			'remainQty' : "=?remain"
		},
		replace: true,
		link: function (scope, element, attrs, ngModel) {

			setScopeValues(scope, attrs);

			var timeout, timer, helper = true, oldval = scope.val, clickStart;

			ngModel.$setViewValue(scope.val);

			scope.decrement = function () {

				if(typeof scope.remainQty !== 'undefined'){
					scope.remainQty--;
				}


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

				if(typeof scope.remainQty !== 'undefined'){
					scope.remainQty++;
				}
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

		'<div class="input-group bootstrap-touchspin spin-border" ng-class={vertical:!verticalButtons}>' +
		'  <span class="input-group-btn" ng-show="verticalButtons">' +
		'    <button class="btn btn-default bootstrap-touchspin-down" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()">-</button>' +
		'  </span>' +
		'  <span class="input-group-addon bootstrap-touchspin-prefix" ng-show="prefix" ng-bind="prefix"></span>' +
		'  <span class="addmore-count" ng-bind="remainQty || val"></span>'+
		// '  <input only-digits type="text" ng-if="!verticalButtons" class="addmore-count" ng-model="val">'+
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
.directive('alTplProduct',['$rootScope',function($rootScope){
	return {
		restrict: 'A',
		transclude: true,
		priority: 100,
		replace: true,
		scope:{
			productInfo:'=info',
			classes : '@',
			promotion : '=',
			loyalty : '='
		},
		templateUrl: '/templates/product/product_tpl.html',

		controller: ['$rootScope','$scope','$state','sweetAlert','alcoholCart','alcoholWishlist','promotionsService',"$mdToast",'UserService',
		function($rootScope,$scope,$state,sweetAlert,alcoholCart,alcoholWishlist,promotionsService,$mdToast,UserService){

			angular.alcoholWishlist = alcoholWishlist;

			$scope.settings = $rootScope.settings;

			$scope.alcoholCart = alcoholCart;

			$scope._sPromotion = promotionsService;

			if($scope.loyalty){
				$scope.productInfo.loyaltyStoreProduct = true;
			}

			// var isInCart = alcoholCart.getProductById($scope.productInfo._id);

			$scope.isInwishList = alcoholWishlist.getProductById($scope.productInfo._id);

			$scope.addToWishlist = function(addInSale){

				alcoholWishlist.add($scope.productInfo._id,addInSale).then(function(response) {

						if(response.success){

							$scope.isInwishList = alcoholWishlist.getProductById($scope.productInfo._id);

						}

					});
			}

			$scope.saleExists = function () {
				return alcoholWishlist.isNotified($scope.productInfo._id);
			};

			$scope.itemClick = function(slug){
			  $state.go('mainLayout.product', {'product': slug});
			};

			$scope.myWish = function(){
				$state.go('accountLayout.wishlist');
			}

		}]
	}
}])
.directive('addToCartBtn',[function(){
	return {
		restrict : "E",
		replace: true,
		priority: 99,
		templateUrl: function(elem, attr){
			return '/templates/partials/addToCartBtn.html';
		},
		scope: {
			product:'=',
		},

		controller: [
		'$scope', '$rootScope', '$element', '$timeout', '$http', 'alcoholCart', '$mdToast', 'UserService',
		function($scope, $rootScope, $element, $timeout, $http, alcoholCart, $mdToast, UserService){
		
					$scope.addMoreCustom = false;
					$scope.element = $element;
					$scope.isAddCustom = false;
		
					$scope.focusout = function(){
		
						$timeout(function() {

							$scope.addMoreCustom = false;
							
							if(typeof $scope.isAddCustom === "undefined"){
				
								if(!$scope.product.loyaltyStoreProduct){
									var p = alcoholCart.getProductById($scope.product._id);
								}else{
									var p = alcoholCart.getLoyaltyProductById($scope.product._id);
								}

								$scope.product.qChilled = p.qChilled;
								$scope.product.qNChilled = p.qNChilled;
		
							}else{
		
								delete $scope.isAddCustom;
		
							}				
		
						}, 2000);
		
					};
		
					$scope.addtocart = function(){
		
						$scope.product.addToCart().then(
							function(successRes){},
							function(errRes){
		
							}
						)
		
					};
		
					$scope.addCustom = function(){				

						$scope.isAddCustom = true;
						$scope.addtocart();
						$scope.addMoreCustom = false;
		
					};
		
					$scope.activeAddToCart = function() {

						var userData = UserService.currentUser;

						$element.find(".addmore-count").css({visibility: "hidden"});
						$element.find(".addmore").css({ "opacity": "0"});
						$element.find(".addmore-count").css({top: "30px"});

						if($scope.product.isLoyaltyStoreProduct === true){
		
							if(userData===false){
		
								$rootScope.$broadcast('showLogin');
								return false;
		
							}
		
							if($scope.product.notSufficient){
								return false;
							}
		
						}
		
						if($scope.maxQuantity < $scope.tquantity){
		
							var ele = $scope.element;
							var qChilled = $scope.product.qChilled;
							var qNchilled = $scope.product.qNChilled;
		
							$mdToast.show({
								controller:['$scope',function($scope){
										
																	$scope.qChilled = qChilled;
																	$scope.qNchilled = qNchilled;
										
																	$scope.closeToast = function(){
																		$mdToast.hide();
																	}
																}],
								templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
								parent : ele,
								//parent : $document[0].querySelector('nav'),
								position: 'top center',
								hideDelay:116000
							});
		
		
							return false;
						}
		
						$scope.addMoreCustom = false;
						
						$timeout(function(){
							
							if($scope.product.servechilled){
		
								if($scope.product.qChilled==0)
								$scope.product.qChilled = 1;
		
							}else{
		
								if($scope.product.qNChilled==0)
								$scope.product.qNChilled = 1;
							}
							
							$timeout(function(){					
								
								$element.find(".addmore").css({ "opacity": "1"});
		
								$scope.addtocart();
		
								$element.find(".addmore-count").css({visibility: "visible"});
								
								$element.find(".addmore-count").animate({ top: "0px"},300);
		
							}, 100);
		
						}, 100)				
		
					};
		
					$scope.activeAddToCartCustom = function(){
		
						$scope.addMoreCustom = true;
		
						$timeout(function(){
							$element.find(".addmanual input").animate({ width: "70%"},250);
							$element.find(".addmanual input").css({ "padding-left": "13px"}).focus();
				  			$element.find(".addmanual .addbuttton").animate({ width: "30%"},250);

						}, 100);
		
					};
				}]
	}
}])
.directive('productBreadcrumb', ['categoriesFac', function(categoriesFac){
	'use strict';

	return {
		restrict: 'EA',
		transclude: true,
		scope: {
			productInfo : "=info",
			viaLoyaltyStore : "="

		},
		replace: true,
		controller: ['$scope',function ($scope) {
		
					$scope.categoryBread = [];
		
					$scope.$watch('productInfo',
		
						function(newValue, oldValue) {
		
							if(typeof $scope.productInfo === "undefined"){
								return $scope.categoryBread;
							}
		
							if(typeof $scope.viaLoyaltyStore !== "undefined"){
								return $scope.categoryBread.push({
		
											_id:0,
											title:'loyalty-store',
											slug:'loyalty-store'
		
										});
							}
		
							angular.forEach($scope.productInfo.categories, function (catId, index) {
		
								for(var i=0;i<categoriesFac.categories.length;i++){
		
									var cat = categoriesFac.categories[i];
									if(cat["_id"]===catId){
		
										$scope.categoryBread.push({
		
											_id:catId,
											title:cat.cat_title,
											slug:cat.slug
		
										})
		
									}
								}
		
							});
		
						}
					);
		
		
		
				}],
		template:'<div class="productdetailbrudcumcover">'+

				'<a href="">Home</a>'+
				'<img src="images/productdetail2.png">'+

				'<span ng-repeat="category in categoryBread">'+

				'<a ng-if="$first" ui-sref="mainLayout.category.products({categorySlug:category.slug})">{{category.title}}</a>'+
				'<a ng-if="!$first" ui-sref="mainLayout.category.subCatProducts({categorySlug:categoryBread[$index-1].slug,subcategorySlug:category.slug})">{{category.title}}</a>'+
				'<img src="images/productdetail2.png">'+

				'</span>'+

				'<span>{{productInfo.name}}</span>'+
				'</div>'
	};
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
.directive('apFocusOut', ['$document','$parse', function( $document, $parse ){
    return {
        link: function( scope, element, attributes ){
            // var scopeExpression = $attributes.apFocusOut,
            
            //     onDocumentClick = function(event){
            //         var isChild = $element.find(event.target).length > 0;

            //         if(!isChild) {
            //             $scope.$apply(scopeExpression);
            //         }
            //     };

            // $document.on("click", onDocumentClick);

            // $element.on('$destroy', function() {
            //     $document.off("click", onDocumentClick);
            // });
        }
    }
}])
.directive('backImg', [function(){
    return function(scope, element, attrs){
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
        });
    };
}])
.directive('errSrc', [function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {

			if(attrs.errSrc==""){attrs.errSrc="asset/i/defaultImage.png"}
			attrs.$set('src', attrs.errSrc);
		
        }
      });
    }
  }
}])
.directive('outOfStock',[function(){
	return {
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/templates/partials/outOfStock.html';
		},
		scope: {
			product:'=',
		},
		controller: [
		'$scope','$rootScope','$http','$mdToast','$document','UserService','$log',
		function($scope,$rootScope,$http,$mdToast,$document,UserService,$log){
		
					$scope.nlabel = 'Notify Me';
		
					$scope.showCustomToast = function() {
						$scope.nlabel = 'Wait..';
						if(!UserService.getIfUser()){
							$scope.nlabel = 'Notify Me';
							$rootScope.$broadcast('showLogin');
						}else{
							$http.post('/user/notifyme',{pid:$scope.product._id}).success(function(){
								$scope.showPopover(UserService.getIfUser());
							}).error(function(){
								$scope.nlabel = 'Notify Me';
							});
						}
					};
		
					$scope.showPopover = function(result){
						$mdToast.show({
							controller:['$scope',function($scope){
															$scope.user = result;
															$scope.closeToast = function(){
																$mdToast.hide();
															}
														}],
							templateUrl: '/templates/toast-tpl/notify-template.html',
							//parent : $document[0].querySelector('#toastBounds'),
							position: 'bottom right',
							hideDelay:0
						});
		
						$scope.nlabel = 'Notify Me';
					};
		
				}]
	}
}])
.directive('notAvailable',[function(){
	return {
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/templates/partials/available-tag.html';
		},
		scope: {
			product:'=',
			tagsize:'@'
		},
		controller: [
		'$scope','$rootScope','$log','$filter',
		function($scope,$rootScope,$log,$filter){
		
					var holiDays = angular.copy($rootScope.settings.holiDays);
		
					$scope.weekdayoff = $filter('filter')(holiDays,{_id:'weekdayoff'});
		
					if(typeof $scope.weekdayoff[0] !== 'undefined'){
						$scope.weekdayoff = $scope.weekdayoff[0];
					}else{
						$scope.weekdayoff = {dow:[]};
					}
		
					$scope.isHoliday = function(daystoadd){
						var cDate = new Date();
						cDate.setTime($rootScope.settings.today);
						cDate.setDate(cDate.getDate() + daystoadd);
						var dayofdate = cDate.getDay();
						if($scope.weekdayoff.dow.indexOf(dayofdate) !== -1){
							return true;
						}
						var tsofdate = cDate.getTime();
						
						var isPh = $filter('filter')(holiDays,{timeStamp:tsofdate});
						if(typeof isPh[0] !== 'undefined'){
							return true;
						}else{
							return false;
						}
					};
		
					$scope.addDays = function(days,mins){
						var old = days;		
						var init = 0;
						var daystoadd = 0;						
						//CALCULATE DAYS TO BE ADDED IN CURRENT DATE, SKIPING ALL PUBLIC HOLIDAYS
						while(init<days){
							daystoadd+=1;
							//SKIP THE DAY IF IT IS A HOLIDAY 
							if(!$scope.isHoliday(daystoadd))
								init = init + 1;
		
						}
						
						var curDate = new Date();
						curDate.setTime($rootScope.settings.today);
						curDate.setHours(0,0,0,0);
						curDate.setDate(curDate.getDate() + daystoadd);
						
						return curDate.setMinutes(mins);
					};
		
					$scope.availDate = $scope.addDays($scope.product.availabilityDays,$scope.product.availabilityTime);
		
				}]
	}
}])
.directive('hoverClass', [function () {
    return {
        restrict: 'A',
        scope: {
            hoverClass: '@'
        },
        link: function (scope, element) {
            /*element.on('mouseenter', function() {
                element.addClass(scope.hoverClass);
            });*/
            element.on('mouseleave', function() {
                element.removeClass(scope.hoverClass);
            });
        }
    };

}])
.directive('twitterShareBtn',['SocialSharingService','sweetAlert',function(SocialSharingService,sweetAlert) {
        return {
            link: function(scope, element, attr) {
                setTimeout(function() {

                        twttr.widgets.createHashtagButton(
                            attr.url,
                            element[0],
                            function(el) {}, {
                                count: 'none',
                                text: "I have made a purchase on alcoholdelivery",
                                url: "http://54.169.107.156",
                                screen_name : "orderShare",
                                via : "alcoholdelivery.com"
                            }
                        );

						twttr.events.bind('tweet',function (event) {
							
							SocialSharingService.shareTwitter({

								key:'ADSG37171O1022',
								type:'order',

							}).then(

								function(resolveRes){

									sweetAlert.swal({

										title: "Awesome!",
										text: "Share successfully! Loyalty points are credit to your account",
										imageUrl: 'http://54.169.107.156/images/thumbimg.png'

									});

								},
								function(rejectRes){

									// sweetAlert.swal({

									// 	type:'error',
									// 	title: 'Oops...',
									// 	text:rejectRes.message,
									// 	timer: 2000

									// });

								}
							)
						});
                });
            }
        }
    }])
.directive('giftingProducts',['alcoholCart',function(alcoholCart){
	return {
		restrict: 'A',
		scope: {
			giftItemKey : '@'
		},
		controller:''
	};
}])
.directive('userCards', [function(){

	return {
		scope :{
			paymentmode: '=paymentmode',
			payment:'=payment'
		},
		restrict: 'A',
		templateUrl: '/templates/partials/addcard.html',
		controller: [
		'$scope','$rootScope','$http','$state','$payments','UserService','sweetAlert','alcoholCart',
		function($scope,$rootScope,$http,$state,$payments,UserService,sweetAlert,alcoholCart){
		
					$scope.$on('addcardsubmit', function() {
			            $scope.addnewcard();
			        });
		
			    	$scope.userdata = UserService.getIfUser();
		
				    $scope.verified = function () {
				    	return $payments.verified();
				    }
		
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
				}]
	};
}])
.directive('navLeft', [function(){

	return {
		restrict: 'A',
		templateUrl: '/templates/account/navLeft.html',
		controller: [
		'$scope','UserService',
		function($scope,UserService){
			    	$scope.user = UserService.getIfUser();	    	
		}]	
	};
}])
.directive('userAddresses', [function(){

	return {
		scope :{
			delivery: '=delivery'
		},
		restrict: 'A',
		templateUrl: '/templates/partials/addresslist.html',
		controller: [
		'$scope','$rootScope','$http','$state','$payments','UserService','$mdDialog','NgMap','sweetAlert','$anchorScroll',
		function($scope,$rootScope,$http,$state,$payments,UserService,$mdDialog,NgMap,sweetAlert,$anchorScroll){
			
					var isDefaultSet = false;

					$scope.listUserAddress = function(flag){
						$http.get("address").success(function(response){

							if(response.length>0){

								angular.forEach(response,function (currAdd,key) {

									currAdd.isAlreadyDefault = currAdd.default;

									if(currAdd.default==true){
										isDefaultSet = key;
									}
								})

								if(!isDefaultSet){
									response[0].default=true;
									isDefaultSet = 0;
								}
								
							}

							$scope.addresses = response;

							if(isDefaultSet!==false && angular.isDefined($scope.delivery) && $scope.delivery.address == null){									
								$scope.setSelectedAddress(isDefaultSet);
							}

							
							$rootScope.addresses = $scope.addresses;
							if($scope.delivery && flag){
								var lastkey = ($scope.addresses.length - 1);
								$scope.setSelectedAddress(lastkey);
							}
							$anchorScroll();									
						}).error(function(data, status, headers) {
		
						});
					}
		
					$scope.listUserAddress(false);
		
					$scope.hide = function() {
						$mdDialog.hide();
					};
					$scope.cancel = function() {
						$mdDialog.cancel();
					};
		
					$scope.answer = function(answer) {
						$mdDialog.hide(answer);
					};
		
					$scope.addNewAddress = function(ev){
		
						$mdDialog.show({
							scope: $scope.$new(),
							controller: function(){
								
								$scope.address = {step:1};
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
		
								$scope.addressData = {SEARCHTEXT:''};
								$scope.simulateQuery = true;
								$scope.isDisabled = false;
		
								$scope.querySearch = function(query){
									return $http.get('/site/search-location?q='+query).then(function(result){
									    return result.data;
									});
								}
		
								$scope.selectedItemChange = function(item){
									if(item){
										lat = item.LATITUDE;
										long = item.LONGITUDE;
										zoom = 18;
										var addressData = angular.copy($scope.addressData.SEARCHTEXT);
										$scope.addressData = angular.copy(item);
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
										var lat = 1.3544542534181963;
										var long = 103.86775184667965;
										var zoom = 12;
										var item = angular.copy($scope.addressData);
										$scope.locateMap(lat,long,zoom,item);
									}
								});
		
								$scope.saveAddress = function(){
		
									$http.post("address", $scope.addressData, {
		
								    }).success(function(response) {
								    	$scope.errors = {};
								    	$scope.hide();
								    	$scope.listUserAddress(true);
								    }).error(function(data, status, headers) {
								    	$scope.errors = data;
								    })
		
								};
		
								//SELECT THIS ADDRESS
								$scope.setMapAddress = function(){
									if($scope.addressData.POSTAL){
										$scope.address.step = 2;
									}
								}
		
								//CANCEL FROM STEP 2
								$scope.changeAddress = function(){
									var lat = angular.copy($scope.addressData.LATITUDE);
									var long = angular.copy($scope.addressData.LONGITUDE);
									var zoom = 18;
									var item = angular.copy($scope.addressData);
									$scope.locateMap(lat,long,zoom,item);
									$scope.address.step = 1;
								}
		
							},
							templateUrl: '/templates/partials/addressMap.html',
							parent: angular.element(document.body),
							targetEvent: ev,
							clickOutsideToClose:true,
							fullscreen:true
						});
					};
		
					$scope.showAddressForm = function(dObj) {

						$scope.errors = {};
						$mdDialog.show({
							scope: $scope.$new(),
							controller: function() {
								$scope.update = false;
								$scope.currentKey = dObj.key;
								if(dObj.key!=null){
									$scope.update = true;
									$scope.address = $rootScope.addresses[dObj.key];
								}
		
								$scope.saveManualAddress = function(){
		
									$scope.errors = {};
									$scope.address.manualForm = 1;
									if($scope.update){

										$http.put("address/"+$scope.currentKey, $scope.address, {
		
								        }).success(function(response) {
								        	$scope.errors = {};
								        	$scope.hide();

								        	if($scope.address.isAlreadyDefault === false && $scope.address.default === true){

								        		$scope.listUserAddress(false);
								        		$scope.setSelectedAddress($scope.currentKey);

								        	}

								        }).error(function(data, status, headers) {
								        	$scope.errors = data;
								        });

							    	}else{
										$http.post("address", $scope.address, {
		
								        }).success(function(response) {
								        	$scope.errors = {};
								        	$scope.hide();
								        	$scope.listUserAddress(true);
								        }).error(function(data, status, headers) {
								        	$scope.errors = data;
								        });
							    	}
								}
							},
							templateUrl: '/templates/partials/addressManually.html',
							parent: angular.element(document.body),
							targetEvent: dObj.ev,
							clickOutsideToClose:true,
							fullscreen:true
						});
		
					};
		
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
			                        $http.delete("address/"+key)
			                            .success(function(response) {
			                                if(response.success){
			                                	if($scope.delivery && $scope.delivery.address.key == key){
			                                		$scope.delivery.address = {};
			                                	}
			                                    $mdDialog.hide();			                                    
			                                    $scope.listUserAddress(false);
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
		
					$scope.setSelectedAddress = function(key){

						if(angular.isDefined($scope.delivery)){
							$scope.delivery.address = {};
							$scope.delivery.address.key = key;
							$scope.delivery.address.detail = $scope.addresses[key];
						}
						
					}
				}]
	};
}])
.directive('ngSpinnerBar', ['$rootScope',function($rootScope) {
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
					$('#sectionarea').removeAttr('style');
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
	}])
.directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        //scope: true,   // optionally create a child scope
        link: function (scope, element, attrs) {
            var model = $parse(attrs.focusMe);
            scope.$watch(model, function (value) {
                
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                    });
                }
            });
            // to address @blesh's comment, set attribute value to 'false'
            // on blur event:
            element.bind('blur', function () {
                
                //scope.$apply(model.assign(scope, false));
            });
        }
    };
}])
.directive('fileModel', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;
			
			element.bind('change', function(e){
				scope.$apply(function(){
					modelSetter(scope, element[0].files[0]);
					if(attrs.fileSelected)
						scope.$eval(attrs.fileSelected, {$file: element[0].files[0]});
				});
			});            
		}
	};
}]);