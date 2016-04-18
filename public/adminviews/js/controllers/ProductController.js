'use strict';

MetronicApp.controller('ProductsController',['$rootScope', '$scope', '$timeout','$http','fileUpload','productModel', function($rootScope, $scope, $timeout,$http,fileUpload,productModel) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_products')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  
		
	});

	$scope.categories = [];

	$scope.product = {
		chilled:'1',
		categories:[],
		isFeatured:'0',
		bulkDisable:false,
		imageFiles:[{coverimage:1}],
		advance_order:{},
		regular_express_delivery:{},
		advance_order_bulk:{},
		express_delivery_bulk:{},
		price:null
	};

	productModel.getCategories().success(function(data){
		$scope.categories = data;
		$scope.cd = [];
		var allparent = $scope.childOf(data,0);

		for(var c in allparent){			
			$scope.cd.push({id:[data[c]._id],name:data[c].cat_title,unique:data[c]._id});
			var child = $scope.childOf(data,allparent[c]._id);
			for(var cc in child){
				$scope.cd.push({id:[allparent[c]._id,child[cc]._id],name:allparent[c].cat_title+' > '+child[cc].cat_title,unique:data[c]._id+'|'+child[cc]._id});
			}
		}

		var unique = $scope.product.categories.join('|');

		var k = $scope.getKey($scope.cd,unique);
		
		//$scope.product.categories = $scope.cd[k].id;
	});

	productModel.getSettings().success(function(data){
		$scope.pricing = data;	
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

	$scope.selectCategory = function(id,eve){
		var i = $scope.product.categories.indexOf(id);
		if(i>-1)
			$scope.product.categories.splice(i, 1);
		else
			$scope.product.categories.push(id);		
	}	

	$scope.imageRemove = function(i){				
		$scope.product.imageFiles.splice(i, 1);
	}

	$scope.formatNumber = function(i) {
	    return i.toFixed(2);	    
	}

	$scope.edittier = function(val,price,t){		
		if(t == 1){
			$scope.product[val] = angular.copy(price);
		}else{
			$scope.product[val] = {};
		}
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

MetronicApp.controller('ProductAddController',['$scope', '$location','fileUpload','productModel', function($scope,$location,fileUpload,productModel) {

	//$scope.imageFiles = [{coverimage:true}];

	$scope.store = function(){

		var data = $scope.product;

		var url = 'product/store';
		data.images = $scope.imageFiles;

		//POST DATA WITH FILES
		productModel.storeProduct(data,url).success(function(response){
			$location.path("product/list");
		}).error(function(data, status, headers){			
			$scope.errors = data;			
		});
	}	

	$scope.discountRemove = function(i){				
		$scope.product.bulkDiscount.splice(i, 1);
	};

}]);


MetronicApp.controller('ProductEditController',['$scope', '$location','$stateParams','fileUpload','productModel', function($scope,$location,$stateParams,fileUpload,productModel) {

	productModel.getProduct($stateParams.productid).success(function(data){
		$scope.product = data;	
		if(!$scope.product.bulkDiscount){
			$scope.product.bulkDiscount = [];
		}	
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
        link: function(scope, element, attrs) {
            element.uniform();
            /*if (!element.parents(".checker").length) {
                element.uniform();
            }*/

        }
    };
});