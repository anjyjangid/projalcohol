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

		//this.$products = [];

		var _self = this;

		var products = alcoholCart.getProducts();
		var promotions = alcoholCart.getPromotions();
		var loyalty = alcoholCart.getLoyaltyProducts();

		angular.forEach(products, function(product, key) {

			isProExist = _self.getProductById(product._id);

			if(isProExist === false && product.quantity>0){

				var newItem = new GiftingProduct(
												product._id,
												product.quantity,
												product.product.name,
												product.product.imageFiles,
												product.product.slug,
												true
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
													promotion.product._slug,
													false
												);

				_self.$products.push(newItem);

			}else{

				isProExist._quantity++;

			}

		});

		angular.forEach(loyalty, function(product, key) {

			isProExist = _self.getProductById(product._id);

			if(isProExist === false){

				var newItem = new GiftingProduct(
													product._id,
													product.quantity,
													product.product.name,
													product.product.imageFiles,
													product.product.slug,
													true
												);

				_self.$products.push(newItem);

			}else{

				isProExist._quantity+=product.quantity;

			}

		});

		angular.forEach(this.$products,function(pro){

			var isInGift = alcoholCart.isProductInGift(pro._id);
			if(isInGift!==false){
				pro._quantity = pro._quantity - isInGift.quantity;
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
		var attachedPro = [];

		angular.forEach(products,function(product,key){

			if(product._inGift>0){

				attachedPro.push({

					_id : product._id,
					quantity:parseInt(product._inGift)

				});
			}

		})
		return attachedPro;
	}

	this.validateGift = function(){

	}

	this.addUpdateGift = function(giftData){

		var defer = $q.defer();

		giftData['id'] = this.getCurrentGift()._id;

		giftData['type'] = 'giftattach';
		if(this.currentGift.type!=0){

			giftData['type'] = 'giftpackaging';
			giftData['products'] = this.getGiftAttachedProduct();

		}


		$http.put("/cart/gift/"+alcoholCart.getCartKey(),giftData).then(

			function(successRes){

				isUpdated = false;
				if(giftData._uid){
					isUpdated = true;
					alcoholCart.removeGift(giftData._uid);
				}

				alcoholCart.addGift(successRes.data.gift,isUpdated);
				defer.resolve(successRes.data.gift);

			},
			function(errorRes){
				defer.reject(errorRes);
			}

		)

		return defer.promise;
	}

	this.addGiftCard = function(gift){

		var defer = $q.defer();
		var cartKey = alcoholCart.getCartKey();

		$http.post("/cart/giftcard/"+cartKey,{
			type: 'giftcard',
			id:gift._id,
			recipient : gift.recipient
		}).then(

			function(successRes){

				alcoholCart.addGiftCard(successRes.data.data);

				defer.resolve(successRes);

			},
			function(errorRes){
				defer.reject(errorRes);
			}

		)

		return defer.promise;
	}

	this.updateGiftCard = function(uid){

		var giftObj = alcoholCart.getGiftCardByUid(uid);

		if(giftObj===false){

			$rootScope.$broadcast('alcoholCart:notify', "Gift card not found !");
			return false;

		}

		recipient = giftObj.getRecipient();

		var defer = $q.defer();

		$http.put("/cart/giftcard/"+uid,{
			type: 'giftcard',
			recipient : recipient
		}).then(

			function(successRes){

				$rootScope.$broadcast('alcoholCart:updated',{msg:"Gift Card Updated"});
				defer.resolve(successRes);

			},
			function(errorRes){
				defer.reject(errorRes);
			}

		)

		return defer.promise;
	}	

}]);

AlcoholDelivery.service("ClaimGiftCard",['$http', '$q', 'UserService', '$rootScope', function ($http, $q, UserService, $rootScope) {

	return {

		init : function (token){			
			var _self = this;
			_self.store(token);

			return $q(function(resolve,reject){

				if(UserService.getIfUser()){
					_self.claim().then(
						function(successRes){
							resolve(successRes);
						},
						function(rejectRes){
							reject(rejectRes);
						}
					);
				}
				else{

					$rootScope.$broadcast('alcoholCart:notify',"Please login or signup to claim gift card",3000);
					
					reject();
				}

			})

		},

		store : function (token) {

			localStorage.setItem("gifttoken",token);
		},

		claim : function () {

			var response = {
				"token":false
			};

			return $q(function(resolve,reject){

				var token = localStorage.getItem("gifttoken",token);

				if(token == null){
					reject(response);
				}else{
					response.token = token;

					$http.post("user/giftcard/"+response.token,{}).then(

						function(successRes){
							
							$rootScope.$broadcast('alcoholWishlist:change', {message:'Hurry! credits added to your account'});

							resolve(successRes.data);
						},
						function(rejectRes){

							setTimeout(function() {							
								$rootScope.$broadcast('alcoholWishlist:change', {message:rejectRes.data.message});
							}, 1000);

							reject(rejectRes);
						}

					);
				}

			});

		}

	}
}]);

AlcoholDelivery.service('ProductService',['$http','$q','AlcoholProduct','CreditCertificate',function($http,$q,AlcoholProduct,CreditCertificate){

	this.prepareProductObjs = function(data, type) {

		if(!type) type = 0;

		var products = [];

		angular.forEach(data, function(product,key) {
			var newProduct = new AlcoholProduct(0, product);
			products.push(newProduct);
		});

		return products;
	}

	this.isProductAvailable = function () {
		
	}

	this.getProducts = function(params){

		var defer = $q.defer();

		var defaultParams = {

			type : 0, //0=>store,1=>loyalty,2=>promotion,3=>package
			filter : null,
			sort : 'new_desc',
			parent : null,
			subParent : null,

		}

		angular.extend(defaultParams,params) // this will overwrite passed params to default

		$http.get("fetchProducts",{params : defaultParams}).then(

			function(successRes){

				var products = [];

				angular.forEach(successRes.data,function(product,key){

					var newProduct = new AlcoholProduct(defaultParams.type,product);
					this.push(newProduct);

				},products);

				defer.resolve(products);

			},
			function(errorRes){

				defer.reject(errorRes.data);

			}

		)

		return defer.promise;
	}

	this.getProduct = function(params){

		var defer = $q.defer();

		var defaultParams = {

			type : 0, //0=>store,1=>loyalty,2=>promotion,3=>package

		}

		angular.extend(defaultParams,params) // this will overwrite passed params to default

		$http.get("getproductdetail",{params : defaultParams}).then(

			function(successRes){

				var newProduct = new AlcoholProduct(defaultParams.type,successRes.data);

				defer.resolve(newProduct);

			},
			function(errorRes){

				defer.reject(errorRes.data);

			}

		)

		return defer.promise;
	}

	this.getDontMiss = function(cartKey){

		var defer = $q.defer();

		$http.get("suggestion/dontmiss/"+cartKey).then(

			function(response){

				var products = [];
				angular.forEach(response.data,function(product,key){

					var newProduct = new AlcoholProduct(0,product);
					this.push(newProduct);

				},products);

				defer.resolve(products);

			},
			function(errorRes){

				defer.reject(errorRes.data);

			}

		)

		return defer.promise;
	}

	this.getAlsoBought = function(product,cartKey){

		var defer = $q.defer();

		$http.get("product/alsobought/"+cartKey+"/"+product).then(

			function(response){

				var products = [];

				angular.forEach(response.data.products,function(product,key){

					var newProduct = new AlcoholProduct(0,product);
					this.push(newProduct);

				},products);

				defer.resolve(products);

			},
			function(errorRes){

				defer.reject(errorRes.data);

			}

		)

		return defer.promise;
	}

	this.getCreditCertificates = function(params){

		var defer = $q.defer();

		var defaultParams = {

			filter : null,
			sort : 'new_desc',

		}

		angular.extend(defaultParams,params) // this will overwrite passed params to default

		$http.get("loyaltystore/credits",{params : defaultParams}).then(

			function(successRes){

				var certificates = [];

				angular.forEach(successRes.data,function(cc,key){

					var newCertificate = new CreditCertificate(cc);
					this.push(newCertificate);

				},certificates);


				defer.resolve(certificates);

			},
			function(errorRes){

				defer.reject(errorRes.data);

			}

		)

		return defer.promise;
	}

}]);

AlcoholDelivery.service('cartValidate',['alcoholCart', '$state', '$q', '$mdToast', '$document', 'appConfig', '$http'
			,function (alcoholCart, $state, $q, $mdToast, $document, appConfig, $http) {

	this.processValidators = function () {

		if(alcoholCart.$validations.cart.workingHrs.status===true){

			$mdToast.show({

					controller:function($scope){

						var workingTime = appConfig.getWorkingTimeString();
						
						$scope.to = workingTime.to;
						$scope.from = workingTime.from;

						$scope.closeToast = function(){
								$mdToast.hide();
							}
					},
					templateUrl: '/templates/toast-tpl/dependency-notify.html',
					//parent : $document[0].querySelector('#cart-summary-icon'),
					position: 'bottom right',
					hideDelay:10000

				});

			alcoholCart.$validations.cart.workingHrs.status = false;

		}

		return true;
	}
	this.mainResolve = true;

	this.stepsName = [
			"cart",
			"address",
			"delivery",
			"payment",
			"review"
		];

	this.init = function(main) {

		var _self = this;
		return $q(function(resolve,reject){

			var i = 0;

			$http.get("cart/products-lapsed-time/"+alcoholCart.getCartKey()).then(
				function(res){

					alcoholCart.setProductsAvailability(res.data);

				},
				function(err){
					console.log(err);
				}
			)

			while(i<_self.stepsName.length){

				isValid = _self[_self.stepsName[i]+'Validate']();
				if(isValid!==true){
					break;
				}
				i++;
			}
			resolve();

		});

	}

	this.check = function(step) {

		var _self = this;
		return $q(function(resolve,reject){

			var isValid = _self.isAllValidTill(step);

			if(isValid===true){

				_self[step+'Validate']().then(
					function () {

						resolve(alcoholCart.$validations[step].isValid);

					}
				);

			}else{

				$state.go('mainLayout.checkout.'+isValid);
				reject();
			}

		})

	}

	this.isAllValidTill = function (step) {
		var inValidStep = true;
		var keyStepChecked = false;
		
		angular.forEach(alcoholCart.$validations,function (value,key) {

			if(key==step){
				keyStepChecked = true;
			}

			if(value.isValid!==true && inValidStep===true && keyStepChecked===false){
				inValidStep = key;
			}

		})
		
		return inValidStep;
	}

	this.cartValidate = function(){

		return $q(function(resolve,reject){

			var isValid = true;
			if(alcoholCart.getDeliveryType()==0 && !appConfig.isServerUnderWorkingTime()){
				alcoholCart.$validations.cart.workingHrs.status = true;
				isValid = false;
			}

			alcoholCart.$validations.cart.isValid = isValid;
			resolve();

		});

	}

	this.addressValidate = function(){
		return $q(function(resolve,reject){
			resolve();
		})
	}
	this.deliveryValidate = function(){
		return $q(function(resolve,reject){
			resolve();
		})
	}
	this.paymentValidate = function(){
		return $q(function(resolve,reject){
			resolve();
		})
	}
	this.reviewValidate = function(){
		return $q(function(resolve,reject){
			resolve();
		})
	}



}])