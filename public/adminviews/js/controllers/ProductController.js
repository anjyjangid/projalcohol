'use strict';

MetronicApp.controller('ProductsController',['$rootScope', '$scope', '$timeout','$http','fileUpload','productModel', function($rootScope, $scope, $timeout,$http,fileUpload,productModel) {

	$scope.$on('$viewContentLoaded', function() {   
		Metronic.initAjax(); // initialize core components
		Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_products')); // set profile link active in sidebar menu         
		
		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;  
	});

}]);

MetronicApp.controller('ProductAddController',['$scope','fileUpload','productModel', function($scope,fileUpload,productModel) {

	$scope.categories = [];

	$scope.errors = {};

	$scope.imageFiles = [{coverimage:true}];

	$scope.product = {		
		chilled:'1',
		categories:[]		
	};	

	productModel.getCategories().success(function(data){
		$scope.categories = data;
	});

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
		$scope.imageFiles.splice(i, 1);
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

	$scope.save = function(){
		productModel.saveProduct({general:$scope.general, meta:$scope.meta}).success(function(response){
			console.log(response);
		}).error(function(response){
			console.log(response);
		});
	}

	$scope.store = function(){

		var data = $scope.product;

		data.images = $scope.imageFiles;
		
		//POST DATA WITH FILES
		productModel.storeProduct(data).success(function(response){
			//console.log(response);
		}).error(function(data, status, headers){			
			$scope.errors = data;			
		});
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