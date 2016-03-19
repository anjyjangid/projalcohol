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

	

	$scope.uploadFiles = function(){
		var fileObj = {};

		for(var i in $scope.imageFiles){
			fileObj["file_"+i] = $scope.imageFiles[i].thumb;
		}

		fileUpload.uploadFileToUrl(fileObj, data, uploadUrl)
		.success(function(response) {
			console.log(response);
			$location.path("categories/list");

		}).error(function(data, status, headers) {            
			Metronic.alert({
				type: 'danger',
				icon: 'warning',
				message: data,
				container: '.portlet-body',
				place: 'prepend'
			});
		});
	}



}]);

MetronicApp.controller('ProductAddController',['$scope', '$location','fileUpload','productModel', function($scope,$location,fileUpload,productModel) {

	$scope.imageFiles = [{coverimage:true}];

	$scope.product = {		
		chilled:'1',
		categories:[]		
	};	

	productModel.getCategories().success(function(data){
		$scope.categories = data;
	});	

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

	$scope.imageRemove = function(i){		
		$scope.imageFiles.splice(i, 1);
	}

}]);


MetronicApp.controller('ProductEditController',['$scope', '$location','$stateParams','fileUpload','productModel', function($scope,$location,$stateParams,fileUpload,productModel) {

	$scope.imageFiles = [{}];

	$scope.categories = [];

	productModel.getProduct($stateParams.productid).success(function(data){
		$scope.product = data;	
		$scope.imageFiles = data.imageFiles;
	});

	productModel.getCategories().success(function(data){
		$scope.categories = data;		
	});	

	$scope.isChecked = function(id){

		var r = false;

		for(var c in $scope.product.categories){
			if($scope.product.categories[c] == id){
				r = true;
			}
		}

		return r;
	}

	$scope.store = function(){

		var data = $scope.product;
		var url = 'product/update/'+$stateParams.productid;
		data.images = $scope.imageFiles;		
		//POST DATA WITH FILES
		productModel.storeProduct(data,url).success(function(response){
			$location.path("product/list");
		}).error(function(data, status, headers){						
			$scope.errors = data;			
		});
	}

	$scope.imageRemove = function(i){		
		$scope.imageFiles.splice(i, 1);
	}

	$scope.coverUpdate = function(s){
		console.log(s);
		for(var ci in $scope.imageFiles){
			$scope.imageFiles[ci].coverimage = 0;
		}

		$scope.imageFiles[s].coverimage = 1;

	}

}]);

MetronicApp.directive('myChange', function() {
  return function(scope, element, attributes) {
    
    element.bind('change', function() {            
      
      var checked = $(element).prop("checked"),
      container = $(element).closest("li"),
      siblings = container.siblings();
      container.find('input[type="checkbox"]').prop({         
          checked: checked
      });

	  function checkSiblings(el) {
	      var parent = el.parent().parent(),
	          all = true,
	          parentcheck=parent.children("label");
	      el.siblings().each(function () {
	          return all = ($(this).find('input[type="checkbox"]').prop("checked") === checked);
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