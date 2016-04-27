'use strict';

MetronicApp.controller('CustomerController',['$rootScope', '$scope', '$timeout','$http','fileUpload','productModel', function($rootScope, $scope, $timeout,$http,fileUpload,productModel) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_products')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  

		$scope.product = {		
			chilled:'1',
			categories:[],
			isFeatured:'0',
			bulkDisable:0,
			imageFiles:[{coverimage:1}],
			advance_order:{},
			regular_express_delivery:{},
			advance_order_bulk:{},
			express_delivery_bulk:{},	
			price:null			
		};
		
	});


	$scope.categories = [];		


	productModel.getCategories().success(function(data){
		$scope.categories = data;
		$scope.cd = [];
		var allparent = $scope.childOf(data,0);

		for(var c in allparent){			
			$scope.cd.push({
				id:[allparent[c]._id],
				name:allparent[c].cat_title,
				unique:allparent[c]._id,
				advance_order:allparent[c].advance_order,
				regular_express_delivery:allparent[c].regular_express_delivery,
				advance_order_bulk:allparent[c].advance_order_bulk,
				express_delivery_bulk:allparent[c].express_delivery_bulk,
			});
			var child = $scope.childOf(data,allparent[c]._id);
			for(var cc in child){
				$scope.cd.push({
					id:[allparent[c]._id,child[cc]._id],
					name:allparent[c].cat_title+' > '+child[cc].cat_title,
					unique:allparent[c]._id+'|'+child[cc]._id,
					advance_order:child[cc].advance_order,
					regular_express_delivery:child[cc].regular_express_delivery,
					advance_order_bulk:child[cc].advance_order_bulk,
					express_delivery_bulk:child[cc].express_delivery_bulk,	
				});
			}
		}
		//var unique = $scope.product.categories.join('|');
		//var k = $scope.getKey($scope.cd,unique);		
		//$scope.product.categories = $scope.cd[k].id;
	});

	productModel.getSettings().success(function(data){		
		$scope.globalPricing = angular.copy(data);
		$scope.pricing = angular.copy(data);	
	});

	productModel.getDealers().success(function(data){				
		$scope.dealerlist = data;	
	});



	$scope.errors = {};
	
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

	/*$scope.selectCategory = function(id,eve){
		var i = $scope.product.categories.indexOf(id);
		if(i>-1)
			$scope.product.categories.splice(i, 1);
		else
			$scope.product.categories.push(id);		
	}*/	

	$scope.imageRemove = function(i){				
		$scope.product.imageFiles.splice(i, 1);
	}

	$scope.formatNumber = function(i) {	    
	    return i.toFixed(2);	    	    
	}

	$scope.getKey = function(categories,val){		
		var r = null;
		angular.forEach(categories, function(value, key) {
			if(val == value.unique){
				r = key;
			}
		});
		return r;
	}



}]);

MetronicApp.controller('CustomerAddController',['$scope', '$location','$stateParams','fileUpload','productModel', function($scope,$location,$stateParams,fileUpload,productModel) {

	if($stateParams.productid){
		
		productModel.getProduct($stateParams.productid).success(function(data){
			
			$scope.product = data;	

			var unique = $scope.product.categories.join('|');
			var k = $scope.getKey($scope.cd,unique);			

			if(k)
				$scope.product.categories = $scope.cd[k].id;
			else
				$scope.product.categories = [];

			if(!$scope.product.advance_order)
				$scope.product.advance_order = {};

			if(!$scope.product.regular_express_delivery)
				$scope.product.regular_express_delivery = {};

			if(!$scope.product.advance_order_bulk)
				$scope.product.advance_order_bulk = {};

			if(!$scope.product.express_delivery_bulk)
				$scope.product.express_delivery_bulk = {};		

		});	
	}	

	$scope.store = function(){

		var url = 'product/store';

		if($stateParams.productid){
			url = 'product/update/'+$stateParams.productid;
		}	
		//POST DATA WITH FILES
		productModel.storeProduct($scope.product,url).success(function(response){						
			$location.path("product/list");
		}).error(function(data, status, headers){			
			$scope.errors = data;			
		});
	};	

	$scope.imageRemove = function(i){		
		$scope.product.imageFiles.splice(i, 1);
	};

	$scope.coverUpdate = function(s){		
		for(var ci in $scope.product.imageFiles){
			$scope.product.imageFiles[ci].coverimage = 0;
		}
		$scope.product.imageFiles[s].coverimage = 1;
	};

	$scope.edittier = function(val,price,t){		
		if(t == 1){
			$scope.product[val] = angular.copy(price);
		}else{
			$scope.product[val] = {};
		}
	}

	$scope.selectCategory = function(){
		
		var tiers = ['advance_order','regular_express_delivery','advance_order_bulk','express_delivery_bulk'];

		var unique = $scope.product.categories.join('|');
		
		var k = $scope.getKey($scope.cd,unique);		

		var selected = angular.copy($scope.cd[k]);
		
		for(var o in tiers){
			var kname = tiers[o];
			var exist = angular.copy(selected[kname]);
			if(exist){								
				$scope.pricing.settings[kname] = exist;
			}else{				
				$scope.pricing.settings[kname] = angular.copy($scope.globalPricing.settings[kname]);
			}
		}
	}

}]);


MetronicApp.controller('ProductEditController',['$scope', '$location','$stateParams','fileUpload','productModel', function($scope,$location,$stateParams,fileUpload,productModel) {

	productModel.getProduct($stateParams.productid).success(function(data){
		$scope.product = data;				
	});

	$scope.discountRemove = function(i){				
		$scope.product.bulkDiscount.splice(i, 1);
	};

	$scope.imageRemove = function(i){		
		$scope.product.imageFiles.splice(i, 1);
	};

	$scope.isChecked = function(id){		

		var r = false;

		if(!$scope.product.categories) return false;

		for(var c in $scope.categories){
			if($scope.product.categories[c] == id){
				r = true;
			}
		}

		return r;
	}

	$scope.store = function(){

		var data = $scope.product;
		var url = 'product/update/'+$stateParams.productid;
		//POST DATA WITH FILES
		productModel.storeProduct(data,url).success(function(response){
			$location.path("product/list");
		}).error(function(data, status, headers){						
			$scope.errors = data;			
		});
	}

	$scope.coverUpdate = function(s){		
		for(var ci in $scope.product.imageFiles){
			$scope.product.imageFiles[ci].coverimage = 0;
		}
		$scope.product.imageFiles[s].coverimage = 1;
	}

}]);

MetronicApp.directive('myChange', function() {
  return function(scope, element, attributes) {
    
    element.bind('change', function() {            
      
      var checked = $(element).prop("checked"),
      container = $(element).closest("li"),
      siblings = container.siblings();
      /*container.find('input[type="checkbox"]').prop({         
          checked: checked
      });*/

	  function checkSiblings(el) {
	      var parent = el.parent().parent(),
          all = true,
          parentcheck=parent.children("label");

	      el.siblings().each(function () {
	          return all = ($(this).find('input[type="checkbox"]').is(":checked") === checked);
	      });

	      if (all && checked) {
	          parentcheck.children('input[type="checkbox"]').prop({	              
	              checked: checked
	          });
	          checkSiblings(parent);
	      } else if (all && !checked) {
	          parentcheck.children('input[type="checkbox"]').prop("checked", checked);
	          parentcheck.children('input[type="checkbox"]').prop("indeterminate", (parent.find('input[type="checkbox"]:checked').length > 0));
	          checkSiblings(parent);
	      } else {
	         parentcheck.children('input[type="checkbox"]').prop({	              
	              checked: true
	         });
	      }	      
	  }

	  checkSiblings(container);

	  var selectcaty = [];

	  $('#checkable input:checked').each(function(){	  			  	
	  		selectcaty.push($(this).attr('my-change'));
	  });  
	  
	  scope.$apply(function(){
           scope.product.categories = selectcaty;
      });

    });
  };
});

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