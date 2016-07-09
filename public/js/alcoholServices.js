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

AlcoholDelivery.service('alcoholGifting', ['$rootScope', '$q', '$http', '$mdToast', 'alcoholCart', 'GiftingProduct', function ($rootScope, $q, $http, $mdToast, alcoholCart, GiftingProduct) {

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
	};

	this.getCurrentGift = function(){
		return this.currentGift;
	}

	this.getGiftAttachedProduct = function(){

		var products = this.getProducts();
		var attachedPro = {};

		angular.forEach(products,function(product,key){
			if(product._inGift>0)
			attachedPro[product._id] = parseInt(product._inGift);
		})
		return attachedPro;
	}
	this.validateGift = function(){

	}

	this.addUpdateGift = function(){

		var defer = $q.defer();

		var gift = this.getCurrentGift();
		

		$http.post("/cart/gift",{
			
			id:gift._id,
			products:this.getGiftAttachedProduct()

		}).then(

			function(successRes){
				
				alcoholCart.addGiftCard(successRes.data);

				defer.resolve(successRes);

			},
			function(errorRes){
				defer.reject(errorRes);
			}

		)

		return defer.promise;
	}

	this.addUpdateGiftCard = function(gift){

		var defer = $q.defer();	

		$http.post("/cart/giftcard",{
			type: 'giftcard',
			id:gift._id,
			recipient : gift.recipient
		}).then(

			function(successRes){
				defer.resolve(successRes);
			},
			function(errorRes){
				defer.reject(errorRes);
			}

		)

		return defer.promise;
	}

	
	

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
