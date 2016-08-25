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

				if(parseInt(product.qChilled)>0){

					var newItem = new GiftingProduct(
												product._id,
												product.qChilled,
												product.product.name,											
												product.product.imageFiles,
												product.product.slug,
												true
											);

					_self.$products.push(newItem);

				}

				if(parseInt(product.qNChilled)>0){

					var newItem = new GiftingProduct(
												product._id, 
												product.qNChilled,
												product.product.name,											
												product.product.imageFiles,
												product.product.slug,
												false
											);

					_self.$products.push(newItem);

				}
				
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

				//attachedPro = attachedPro[product._id] || {};
				var state = 'chilled';
				if(!product._stateChilled){
					state = 'nonchilled'
				}

				attachedPro.push({

					_id : product._id,
					state: state,
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
		giftData['type'] = 'giftpackaging';
		giftData['products'] = this.getGiftAttachedProduct();

		$http.post("/cart/gift",giftData).then(

			function(successRes){
				
				alcoholCart.addGift(successRes.data.gift);

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

		$http.post("/cart/giftcard",{
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

AlcoholDelivery.service("ClaimGiftCard",['$http', '$q', 'UserService', '$mdToast', function ($http, $q, UserService, $mdToast) {

	return {

		init : function (token){

			var _self = this;
			_self.store(token);

			return $q(function(resolve,reject){

				UserService.GetUser().then(

					function(resolveRes){
						
						if(typeof resolveRes.auth !== 'undefined' && resolveRes.auth=== false){

							$mdToast.show(

								$mdToast.simple()
									.textContent("Please login or signup to claim gift card")
									.highlightAction(false)
									.position("top right fixed")
									.hideDelay(4000)
							);
							
							reject();

						}

						_self.claim().then(
							function(successRes){
								resolve(successRes);
							},
							function(rejectRes){
								reject(rejectRes);
							}
						);
						
					},
					function(rejectRes){
						reject(rejectRes);
					}

				);		

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

				if(!token){
					reject(response);
				}

				response.token = token;

				$http.post("user/giftcard/"+response.token,{}).then(

					function(successRes){

						$mdToast.simple()
									.textContent("Hurry! credits added to your account")
									.highlightAction(false)
									.position("top right fixed")
									.hideDelay(4000)

						resolve(successRes.data);
					},
					function(rejectRes){
						setTimeout(function() {
							$mdToast.simple()
									.textContent("rejectRes.message")
									.highlightAction(false)
									.position("top right fixed")
									.hideDelay(4000)	
						}, 1000);
						
						reject(rejectRes);
					}

				);

			});

		}

	}
}]);

AlcoholDelivery.factory('GiftingProduct',['$filter',function($filter){

	var giftProduct = function(id, quantity, title, images, slug, state){

		this._id = id;
		this._quantity = parseInt(quantity);
		this._maxQuantity = parseInt(quantity);
		this._title = title;
		this._image = $filter('getProductThumb')(images);
		this._slug = slug;
		this._inGift = 0;
		this._stateChilled = state;


	}
	return giftProduct;

}]);

AlcoholDelivery.service('ProductService',['$http','$q','AlcoholProduct',function($http,$q,AlcoholProduct){
	
	this.getProducts = function(params){

		var defer = $q.defer();

		var defaultParams = {

			type : 0, //0=>store,1=>loyalty,2=>promotion,3=>package
			filter : null,
			sort : 'new_asc',
			parent : null,

		}

		angular.extend(defaultParams,params) // this will overwrite passed params to default

		$http.get("fetchProduct",{params : defaultParams}).then(

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

}]);

AlcoholDelivery.factory('AlcoholProduct',['$filter','$log','catPricing','alcoholCart',function($filter,$log,catPricing,alcoholCart){

	var product = function(type,product){

		this._id = product._id.$id;

		this.type = type;

		if(this.type == 0){

			this.setPricingParams(
				product.categories,
				product.express_delivery_bulk,
				product.regular_express_delivery
			);

		}

		this.setSettings(product);

		if(this.error === true){
			return false;
		}

		this.setPrice(product);

		this.setDefaults(product);

	}

	product.prototype.setSettings = function(p){

		var isInCart = alcoholCart.getProductById(this._id);

		this.servechilled=p.chilled;

		if(isInCart!==false){

			this.servechilled = isInCart.getLastServedAs();

		}

	}

	product.prototype.setPricingParams = function(categories,bulkPricing,singlePricing){
		
		var categoryKey = [];
		var catData = [];
		angular.copy(categories,categoryKey);

		categoryKey = categoryKey.pop();
		catData = catPricing.categoryPricing[categoryKey];

		if(typeof catData==='undefined'){
			this.error = true;
			return false;
		}
		
		if(typeof bulkPricing === 'undefined'){
			this.bulkPricing = catData.express_delivery_bulk.bulk
		}else{
			this.bulkPricing = bulkPricing.bulk;
		}

		if(typeof singlePricing === 'undefined'){
			this.singlePricing = catData.regular_express_delivery
		}else{
			this.singlePricing = singlePricing;
		}
				
	}

	product.prototype.setPrice = function(p){

		switch(this.type){
			case 1:
				if(typeof p.loyaltyValueType !== 'undefined'){

					this.loyaltyValue = {
						type : parseInt(p.loyaltyValueType),
						point : p.loyaltyValuePoint || 0,
						price : p.loyaltyValuePrice || 0,
					};

				}
			break;
			default:{
				if (p.price){

					var basePrice = parseFloat(p.price)/2.2;
					var unitPrice = basePrice;

					var singlePricing = this.singlePricing;
					singlePricing.type = parseInt(singlePricing.type);
					
					if(singlePricing.type===1){

						unitPrice +=  parseFloat(basePrice * singlePricing.value/100);

					}else{

						unitPrice += parseFloat(singlePricing.value);
						
					}
					
					this.unitPrice = parseFloat(unitPrice.toFixed(2));			

					var bulkArr = this.bulkPricing;
					var quantity = 1;
					var price = unitPrice;
					for(i=0;i<bulkArr.length;i++){

						var bulk = bulkArr[i];

						if(quantity >= bulk.from_qty && quantity<=bulk.to_qty){

							if(bulk.type==1){

								price = quantity * (basePrice + (basePrice * bulk.value/100));

							}else{

								price = quantity * (basePrice + bulk.value);

							}
							
							price = parseFloat(price.toFixed(2));
						}

					}

					this.discountedUnitPrice = price/quantity;
					
					this.price = price;

				}
				else {
					$log.error('Each Product Required Price');
				}
			}

		}

		

	};

	product.prototype.setDefaults = function(p){

		this.availabilityDays = p.availabilityDays;
		this.availabilityTime = p.availabilityTime;
		this.categories = p.categories;
		this.chilled = p.chilled;
		this.description = p.description;
		this.imageFiles = p.imageFiles;	
		this.name = p.name;
		this.outOfStockType = p.outOfStockType;
		this.quantity = p.quantity;
		this.shortDescription = p.shortDescription;
		this.sku = p.sku;
		this.slug = p.slug;

	}

	product.prototype.addToCart = function(pObj){
		pObj
	}

	return product;

}]);