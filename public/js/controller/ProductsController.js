'use strict';

AlcoholDelivery.controller('ProductsController', ['$scope', '$rootScope','$http','$stateParams', function($scope, $rootScope,$http,$stateParams){

	$scope.ProductsController = {};
	
	$category = $stateParams.categorySlug;

	console.log($stateParams.subcategorySlug);

    $http({
	    url: "/search", 
	    method: "GET",
	    params: {

	    	category: "asdas",

	    }
 	}).success(function(response){


	});

}]);