'use strict';

AlcoholDelivery.controller('ProductsController', ['$scope', '$rootScope','$http','$stateParams', function($scope, $rootScope,$http,$stateParams){

	$scope.ProductsController = {};
	
	$category = $stateParams.categorySlug;	

    $http({
	    url: "/search", 
	    method: "GET",
	    params: {

	    	category: "asdas",

	    }
 	}).success(function(response){


	});

}]);


AlcoholDelivery.controller('ProductDetailController', ['$scope', '$rootScope','$http','$stateParams', function($scope, $rootScope,$http,$stateParams){

	$scope.ProductDetailController = {};
	
	$category = $stateParams.categorySlug;

    $http({
	    url: "/search", 
	    method: "GET",
	    params: {

	    	category: "asdas",

	    }
 	}).success(function(response){


	});

}]);