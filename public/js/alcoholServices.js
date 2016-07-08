AlcoholDelivery.service('SocialSharingService', ['$rootScope', '$window', '$http', '$q', '$mdToast', function ($rootScope, $window, $http, $q, $mdToast) {

	this.shareFb = function(shareData){

		var _self = this;
		var defer = $q.defer();

		var shareParams = {

			method: 'feed',
			picture : "http://54.169.107.156/images/ad_logo.png",
			href: "http://54.169.107.156",
			name:"Alcoholdelivery Fb Order Sharing",
			caption : "Alcoholdelivery",
			description:"Hello Friends i have made a purchase on alcoholdelivery",
			// message: 'Message you want to show',
			// link: 'http://link-you-want-to-show',

		};
		
		shareParams = angular.merge({}, shareParams, shareData);		

		var retStatus = {
			'sharing':false,
			'points':false,
			'message':'Something went wrong'
		}

		FB.ui(shareParams, function(response){

			if (response && !response.error_message) {

				retStatus.sharing = true;

				_self.provideLoyalty('order','facebook',shareData['key']).then(

					function(){

						retStatus.points = true;
						defer.resolve(retStatus);

					},
					function(){

						defer.reject(retStatus);

					}
				);			

			} else {

				defer.reject(retStatus);

			}

		});

		return defer.promise;
	}

	this.shareTwitter = function(shareData){

		var _self = this;
		var defer = $q.defer();		

		var retStatus = {
			'sharing':false,
			'points':false,
			'message':'Something went wrong'
		}

		retStatus.sharing = true;

		_self.provideLoyalty('order','twitter',shareData['key']).then(

			function(){

				retStatus.points = true;
				defer.resolve(retStatus);

			},
			function(){

				defer.reject(retStatus);

			}
		);

		return defer.promise;
	}
	
	this.shareGoogle = function(shareData){

		var _self = this;
		var defer = $q.defer();		

		var retStatus = {
			'sharing':false,
			'points':false,
			'message':'Something went wrong'
		}

		retStatus.sharing = true;

		_self.provideLoyalty('order','google',shareData['key']).then(

			function(){

				retStatus.points = true;
				defer.resolve(retStatus);

			},
			function(){

				defer.reject(retStatus);

			}
		);

		return defer.promise;
	}

	this.provideLoyalty = function(type,on,key){

		var defer = $q.defer();

		var params = {
			type:type,
			on:on,
			key:key
		}

		$http.put("loyalty/sharing",params).then(

			function(response){

				defer.resolve("added success fully");

			},
			function(errorRes){
				defer.reject("added success fully");
			}

		)

		return defer.promise;

	}


}]);

AlcoholDelivery.service('alcoholGifting', ['$rootScope', '$q', '$mdToast', 'alcoholCart', 'GiftingProduct', function ($rootScope, $q, $mdToast, alcoholCart, GiftingProduct) {

	this.currentGift = null;
	this.$products = [];

	this.getProducts = function(){

		var _self = this;			

		var products = alcoholCart.getProducts();
		var promotions = alcoholCart.getPromotions();

		angular.forEach(products, function(product, key) {
			
			isProExist = _self.getProductById(product._id);

			if(isProExist === false){
				var newItem = new GiftingProduct(
											product._id, 
											product.quantity,
											product.product.name,
											product.product.imageFiles,
											product.product.slug
										);

				_self.$products.push(newItem);
			}

		});

		angular.forEach(promotions, function(promotion, key) {

			isProExist = _self.getProductById(promotion.product._id);

			if(isProExist === false){

				var newItem = new GiftingProduct(
													promotion.product._id,
													1,
													promotion.product._title,
													promotion.product._image,
													promotion.product._slug

												);
				
				_self.$products.push(newItem);

			}else{

				isProExist._quantity++;

			}

		});


		return this.$products;
	}

	this.getProductById = function (id){

		var products = this.$products;
		var build = false;

		angular.forEach(products, function (product) {

			if (product._id === id) {
				build = product;
			}

		});
		return build;

	};

	this.setCurrentGift = function(gift){
		this.currentGift = gift;
		this.currentGift.products = [];
	};

	this.getAttachedQuantity = function(){

	}

	// this.attach = function(proId,quantity){

	// 	var retObj = {
	// 		found : false,
	// 		message : "Something webt wrong",
	// 	};

	// 	var product = this.getProductById(proId);
		
	// 	if(product===false){

	// 		retObj.message = "Product not found in cart";

	// 	}

	// 	retObj.found = true;

	// 	if(!this.isAttached(proId)){
	// 		this.currentGift.products.push(product);
	// 	}

	// 	return retObj;

	// }

	// this.isAttached = function(proId){

	// 	var products = this.currentGift.products;
	// 	var isFound = false;
	// 	angular.forEach(products, function(val,key){

	// 		if(val._id==proId && !isFound){
	// 			isFound = true;
	// 		}
			
	// 	});
		
	// 	return isFound;
	// }




}]);

AlcoholDelivery.factory('GiftingProduct',['$filter',function($filter){

	var giftProduct = function(id,quantity,title,images,slug){

		this._id = id;
		this._quantity = parseInt(quantity);
		this._maxQuantity = parseInt(quantity);
		this._title = title;
		this._image = $filter('getProductThumb')(images);
		this._slug = slug;
		this._inGift = 0;

	}
	return giftProduct;

}]);
