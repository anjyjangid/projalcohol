'use strict';

MetronicApp.controller('ProductController',['$rootScope', '$scope', '$timeout','$http','fileUpload','productModel', function($rootScope, $scope, $timeout,$http,fileUpload,productModel) {

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
			imageFiles:[{coverimage:'1'}],
			//advance_order:{},
			regular_express_delivery:{},
			//advance_order_bulk:{},
			express_delivery_bulk:{},	
			price:null,
			outOfStockType:2,
			availabilityDays:2,
			availabilityTime:990,
			deliveryType:0,
			isLoyalty:0,
			loyaltyType : 0,
			suggestions : [],
			dealerData:[{}],
			store:{}
		};
		



	});


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
				cid:allparent[c]._id
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
					cid:child[cc]._id
				});
			}
		}
		
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



	// Suggestion Product Start

	$scope.addItem = function(p){

		delete $scope.errors.products;

		p.added = true;
		p.quantity = 1;			

		$scope.product.suggestions.push(angular.copy(p));			

	};

	$scope.searchItem = function($event){

		var qry = $event.currentTarget.value;
		if(qry.length>=3){
			$scope.searching = true;
			productModel.searchItem(qry).success(function(response){
				$scope.itemlist = response;
				$scope.searching = false;
			});
		}else{
			$scope.itemlist = [];
		}
	};
	
	$scope.removeProduct = function(index){
		$scope.product.suggestions.splice(index,1);
	}

	$scope.checkItem = function(){

		if(!$scope.itemlist) return [];	

		return $scope.itemlist.filter(function(item){

			angular.forEach($scope.product.suggestions, function (pro) {
				if  (pro._id === item._id) {
					item.added = true;
				}
			});

			return item;

		});

	}

	$scope.clearSearch = function(cg){
		$scope.currentGroup = cg;
		$scope.searchbox = '';
		$scope.itemlist = [];
	}

	// Suggestion Product End

}]);

MetronicApp.controller('ProductAddController',['$rootScope', '$scope', '$location','$stateParams','$timeout','fileUpload','productModel', function($rootScope, $scope,$location,$stateParams,$timeout,fileUpload,productModel) {

	
	/*$scope.$on('$viewContentLoaded', function() {
		$scope.selectCategory();
	});*/

	if($stateParams.productid){
		
		productModel.getProduct($stateParams.productid).success(function(data){
			
			angular.extend($scope.product,data);

			var unique = $scope.product.categories.join('|');
			
			var k = $scope.getKey($scope.cd,unique);			
			
			if(k!=null)
				$scope.product.categories = $scope.cd[k].id;
			else
				$scope.product.categories = [];

			if(!$scope.product.regular_express_delivery)
				$scope.product.regular_express_delivery = {};

			if(!$scope.product.express_delivery_bulk)
				$scope.product.express_delivery_bulk = {};		
			
			$scope.selectCategory();
		});	
	}	

	$scope.store = function(){

		if($stateParams.productid){

			productModel.updateProduct($scope.product,$stateParams.productid).success(function(response){						
				$location.path("products/list");
			}).error(function(data, status, headers){			
				$scope.errors = data;			
			});

		}else{
			productModel.storeProduct($scope.product).success(function(response){						
				$location.path("products/list");
			}).error(function(data, status, headers){			
				$scope.errors = data;			
			});
		}	
		
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
		
		var tiers = ['regular_express_delivery','express_delivery_bulk'];

		var unique = '';

		if($scope.product.categories)
			unique = $scope.product.categories.join('|');
		
		var k = $scope.getKey($scope.cd,unique);		

		var selected = angular.copy($scope.cd[k]);
		
		for(var o in tiers){
			var kname = tiers[o];
			//var exist = angular.copy(selected[kname]);
			$scope.pricing.settings[kname] = angular.copy($scope.globalPricing.settings[kname]);			
			if(selected){
				var ctids = selected['id'];
				for(var ctid in ctids){
					var t = $scope.customTier(ctids[ctid]);								
					var exist = angular.copy(t[0][kname]);
					if(exist){								
						$scope.pricing.settings[kname] = exist;
					}
				}			
			}
		}
	}

	$scope.customTier = function(ctid){
		return $scope.cd.filter(function(category){
			return (category.cid == ctid);
		});
	}

	$scope.getTimeOptions = function(){
		return $rootScope.timerange;
	};

	$scope.outOfStockType = [
		{id:1,label:'Notify when available'},
		{id:2,label:'Available after'},
	];

	$scope.removeDealer = function(index,dealerId){

		if($scope.product.store.defaultDealerId == dealerId){
			$scope.product.store.defaultDealerId = '';
		}

		$scope.product.dealerData.splice(index,1);

	}

	$scope.setDefault = function(dId){
		if(dId){
			$scope.product.store.defaultDealerId = dId;
		}
	}

	$scope.setCover = function(index){

		angular.forEach($scope.product.imageFiles,function(val,key){

			if(key!=index){
				delete val.coverimage;
			}

		});

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

MetronicApp.controller('SharedInventoryController',[
	'$rootScope', '$scope', '$timeout','$http','fileUpload','productModel', 
	function($rootScope, $scope, $timeout,$http,fileUpload,productModel) {
	

}]);