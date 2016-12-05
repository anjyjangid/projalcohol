/***
GLobal Directives
***/

// Route State Load Spinner(used on page or content load)
MetronicApp.directive('ngSpinnerBar', ['$rootScope',
	function($rootScope) {
		return {
			link: function(scope, element, attrs) {
				// by defult hide the spinner bar
				element.addClass('hide'); // hide spinner bar by default

				// display the spinner bar whenever the route changes(the content part started loading)
				$rootScope.$on('$stateChangeStart', function() {
					element.removeClass('hide'); // show spinner bar
				});

				// hide the spinner bar on rounte change success(after the content loaded)
				$rootScope.$on('$stateChangeSuccess', function() {
					element.addClass('hide'); // hide spinner bar
					$('body').removeClass('page-on-load'); // remove page loading indicator
					Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu
				   
					// auto scorll to page top
					setTimeout(function () {
						Metronic.scrollTop(); // scroll to the top on content load
					}, $rootScope.settings.layout.pageAutoScrollOnLoad);     
				});

				// handle errors
				$rootScope.$on('$stateNotFound', function() {
					element.addClass('hide'); // hide spinner bar
				});

				// handle errors
				$rootScope.$on('$stateChangeError', function() {
					element.addClass('hide'); // hide spinner bar
				});
			}
		};
	}
])

.directive('packageDetail',[function(){

	return {		
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/adminviews/views/orders/order/partydetail.html';
		},
		replace : true,
		scope: {
			type:'=',
			id:'=',
		},
		link: function (scope, element, attrs, ngModel) {

			scope.$watch('scope',function(newValue,oldValue){
				console.log(newValue);
				if(newValue!=oldValue){
					reset();
				}

			},true);


			function reset(){

console.log("asdasd");

			}
		}
		// controller: "PackageDetailController"
	};

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
		'<div class="input-group">'+
		'	<div class="spinner-buttons input-group-btn">'+
		'		<button ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" type="button" class="btn spinner-down red"><span class="md-click-circle md-click-animate"></span>'+
		'		<i class="fa fa-minus"></i>'+
		'		</button>'+
		'	</div>'+		
		'	<span class="spinner-input form-control" ng-bind="remainQty || val"></span>'+
		'	<div class="spinner-buttons input-group-btn">'+
		'		<button ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" type="button" class="btn spinner-up blue"><span class="md-click-circle md-click-animate"></span>'+
		'		<i class="fa fa-plus"></i>'+
		'		</button>'+
		'	</div>'+
		'</div>'

		// '<div class="input-group bootstrap-touchspin" ng-class={vertical:!verticalButtons}>' +
		// '  <span class="input-group-btn" ng-show="verticalButtons">' +
		// '    <button class="btn btn-default bootstrap-touchspin-down" ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()">-</button>' +
		// '  </span>' +
		// '  <span class="input-group-addon bootstrap-touchspin-prefix" ng-show="prefix" ng-bind="prefix"></span>' +
		// '  <span class="addmore-count" ng-bind="val"></span>'+
		
		// '  <span class="input-group-addon" ng-show="postfix" ng-bind="postfix"></span>' +
		// '  <span class="input-group-btn" ng-if="verticalButtons">' +
		// '    <button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()">+</button>' +
		// '  </span>' +

		// '  <span class="input-group-btn-vertical" ng-if="!verticalButtons">'+
		// '		<button class="btn btn-default bootstrap-touchspin-up" ng-mousedown="startSpinUp()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-plus"></i></button>'+
		// '		<button class="btn btn-default bootstrap-touchspin-down"  ng-mousedown="startSpinDown()" ng-mouseup="stopSpin()" type="button"><i class="glyphicon glyphicon-minus"></i></button>'+
		// '	</span>'+
		// '</div>'		
	};

}])

// Handle global LINK click
MetronicApp.directive('a', function() {

	return {
		restrict: 'E',
		link: function(scope, elem, attrs) {
			if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
				elem.on('click', function(e) {
					e.preventDefault(); // prevent link click for above criteria
				});
			}
		}
	};
});

// Handle Dropdown Hover Plugin Integration
MetronicApp.directive('dropdownMenuHover', function () {
  return {
	link: function (scope, elem) {
	  elem.dropdownHover();
	}
  };  
});


MetronicApp.directive('formFilter', function ($timeout) {
	var reqPromise;
	return {
		restrict: 'C',
		link: function (scope, element) {

			element.bind("keypress", function(event) {

				if(event.which === 13) {			

					triggerReq();// $(".filter-submit").trigger('click');
					//event.preventDefault();

				}

			});

			element.bind("change", function(event) {
			
				triggerReq();// $(".filter-submit").trigger('click');
		
			});

			function triggerReq() {
				if(reqPromise) $timeout.cancel(reqPromise);
				reqPromise = $timeout(function(){
					$(".filter-submit").trigger('click');
				}, 500);
			}
		}
	};
});



MetronicApp.directive('fileModel', ['$parse', function ($parse) {
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

MetronicApp.directive('errSrc', function() {
  return {
	link: function(scope, element, attrs) {
	  element.bind('error', function() {
		if (attrs.src != attrs.errSrc) {
		  attrs.$set('src', attrs.errSrc);
		}
	  });
	}
  }
});

MetronicApp.directive('ckeditor', ['$timeout', '$q', function ($timeout, $q) {
		
		return {
			restrict: 'AC',
			require: ['ngModel', '^?form'],
			scope: false,
			link: function (scope, element, attrs, ctrls) {

				var ngModel = ctrls[0];
				var form = ctrls[1] || null;
				var EMPTY_HTML = '<p></p>',
					isTextarea = element[0].tagName.toLowerCase() === 'textarea',
					data = [],
					isReady = false;

				if (!isTextarea) {
					element.attr('contenteditable', true);
				}

				var onLoad = function () {
					
					var options = {
						toolbar: 'full',
						toolbar_full: [ //jshint ignore:line
							{
								name: 'basicstyles',
								items: ['Bold', 'Italic', 'Strike', 'Underline']
							},
							{name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote']},
							{name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
							{name: 'links', items: ['Link', 'Unlink', 'Anchor']},
							{name: 'tools', items: ['SpellChecker', 'Maximize']},
							'/',
							{
								name: 'styles',
								items: ['Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat']
							},
							{name: 'insert', items: ['Image', 'Table', 'SpecialChar']},
							{name: 'forms', items: ['Outdent', 'Indent']},
							{name: 'clipboard', items: ['Undo', 'Redo']},
							{name: 'document', items: ['PageBreak', 'Source']}
						],
						disableNativeSpellChecker: false,
						uiColor: '#FAFAFA',
						height: '400px',
						width: '100%',

						allowedContent:true,
						language: 'en',
						uiColor: '#cfcfcf',
						strinsert_button_label:'Content Block',
						strinsert_button_title:'Insert Content Block',
						strinsert_button_voice:'Insert Content Block',                        
						//filebrowserImageBrowseUrl:'/adminapi/global/browsegraphics',
						filebrowserUploadUrl:'/adminapi/global/uploadgraphics'
					};
					options = angular.extend(options, scope[attrs.ckeditor]);

					var instance = (isTextarea) ? CKEDITOR.replace(element[0], options) : CKEDITOR.inline(element[0], options),
						configLoaderDef = $q.defer();

					element.bind('$destroy', function () {
						if (instance && CKEDITOR.instances[instance.name]) {
							CKEDITOR.instances[instance.name].destroy();
						}
					});
					var setModelData = function (setPristine) {
						var data = instance.getData();
						if (data === '') {
							data = null;
						}
						$timeout(function () { // for key up event
							if (setPristine !== true || data !== ngModel.$viewValue) {
								ngModel.$setViewValue(data);
							}

							if (setPristine === true && form) {
								form.$setPristine();
							}
						}, 0);
					}, onUpdateModelData = function (setPristine) {
						if (!data.length) {
							return;
						}

						var item = data.pop() || EMPTY_HTML;
						isReady = false;
						instance.setData(item, function () {
							setModelData(setPristine);
							isReady = true;
						});
					};

					instance.on('pasteState',   setModelData);
					instance.on('change', setModelData);
					instance.on('blur', setModelData);
					//instance.on('key',          setModelData); // for source view

					instance.on('instanceReady', function () {
						scope.$broadcast('ckeditor.ready');
						scope.$apply(function () {
							onUpdateModelData(true);
						});

						instance.document.on('keyup', setModelData);
					});
					instance.on('customConfigLoaded', function () {
						configLoaderDef.resolve();
					});

					//$timeout(function(){
						ngModel.$render = function () {                        
							data.push(ngModel.$viewValue);
							if (isReady) {
								onUpdateModelData();
							}
						};
					//});
				};

				if (CKEDITOR.status === 'loaded') {
					loaded = true;
				}
				if (loaded) {                    
					onLoad();
				} else {

					$defer.promise.then(onLoad);
				}
			}
		};
	}]);

MetronicApp.directive('pluginUniform', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attributes) {
			
			// Because we are deferring the application of the Uniform plugin, 
			// this will help us keep track of whether or not the plugin has been
			// applied.
			var uniformedElement = null;

			// We don't want to link-up the Uniform plugin right away as it will
			// query the DOM (Document Object Model) layout which will cause the 
			// browser to repaint which will, in turn, lead to unexpected and poor 
			// behaviors like forcing a scroll of the page. Since we have to watch
			// for ngModel value changes anyway, we'll defer our Uniform plugin
			// instantiation until after the first $watch() has fired.
			scope.$watch( attributes.ngModel, handleModelChange );

			// When the scope is destroyed, we have to teardown our jQuery plugin
			// to in order to make sure that it releases memory.
			scope.$on( "$destroy", handleDestroy );


			// ---
			// PRIVATE METHODS.
			// ---


			// I clean up the directive when the scope is destroyed.
			function handleDestroy() {

				// If the Uniform plugin has not yet been applied, there's nothing
				// that we have to explicitly teardown.
				if ( ! uniformedElement ) {

					return;

				}

				uniformedElement.uniform.restore( uniformedElement );
				
			}


			// I handle changes in the ngModel value, translating it into an 
			// update to the Uniform plugin.
			function handleModelChange( newValue, oldValue ) {
				
				// If we try to call render right away, two things will go wrong:
				// first, we won't give the ngValue directive time to pipe the 
				// correct value into ngModle; and second, it will force an 
				// undesirable repaint of the browser. As such, we'll perform the
				// Uniform synchronization at a later point in the $digest.
				scope.$evalAsync( synchronizeUniform );
				
			}


			// I synchronize Uniform with the underlying form element.
			function synchronizeUniform() {

				// Since we are executing this at a later point in the $digest
				// life-cycle, we need to ensure that the scope hasn't been 
				// destroyed in the interim period. While this is unlikely (if 
				// not impossible - I haven't poured over the details of the $digest
				// in this context) it's still a good idea as it embraces the 
				// nature of the asynchronous control flow.
				// --
				// NOTE: During the $destroy event, scope is detached from the 
				// scope tree and the parent scope is nullified. This is why we
				// are checking for the absence of a parent scope to indicate 
				// destruction of the directive.
				if ( ! scope.$parent ) {

					return;

				}

				// If Uniform has not yet been integrated, apply it to the element.
				if ( ! uniformedElement ) {

					return( uniformedElement = element.uniform() );

				}

				// Otherwise, update the existing instance.
				uniformedElement.uniform.update( uniformedElement );    

			}

		}
	};
});

MetronicApp.directive('orderProductDetail', function() {
	return {		
		restrict : "E",
		replace: true,
		templateUrl: function(elem, attr){
			return '/adminviews/views/orders/order/productdetail.html';
		},
		scope: {
			product:'=',
		},
		controller: "OrderProductDetailController"
	};
});