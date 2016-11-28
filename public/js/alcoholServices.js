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

AlcoholDelivery.service("ClaimGiftCard",['$http', '$q', 'UserService', '$mdToast', function ($http, $q, UserService, $mdToast) {

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
					$mdToast.show(

						$mdToast.simple()
							.textContent("Please login or signup to claim gift card")
							.highlightAction(false)
							.position("top right fixed")
							.hideDelay(4000)
					);

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

	this.getProducts = function(params){

		var defer = $q.defer();

		var defaultParams = {

			type : 0, //0=>store,1=>loyalty,2=>promotion,3=>package
			filter : null,
			sort : 'new_asc',
			parent : null,

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

	this.getDontMiss = function(){

		var defer = $q.defer();

		$http.get("suggestion/dontmiss").then(

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

	this.getAlsoBought = function(product){

		var defer = $q.defer();

		$http.get("product/alsobought/"+product).then(

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
			sort : 'new_asc',

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

AlcoholDelivery.factory('AlcoholProduct',[
			'$rootScope','$state','$filter','$log','$timeout','$q','catPricing','alcoholCart','UserService',
	function($rootScope,$state,$filter, $log, $timeout, $q, catPricing, alcoholCart, UserService){

	var product = function(type,product){
	
		this._id = product._id.$id || product._id;

		this.type = type;

		if(this.type == 0){

			this.setPricingParams(
				product.categories,
				product.express_delivery_bulk,
				product.regular_express_delivery
			);

			if(angular.isDefined(product.nameSales) && angular.isArray(product.nameSales) && product.nameSales.length){
				this.setNameSale(product);
			}

			if(angular.isDefined(product.proSales) && angular.isObject(product.proSales)){
				this.setSale(product);
			}

			if(angular.isDefined(product.parentCategory)){
				this.setParentDetail(product.parentCategory);
			}

			if(angular.isDefined(product.childCategory)){
				this.setChildDetail(product.childCategory);
			}			

		}

		this.setSettings(product);

		this.setPrice(product); // must before setAddBtnState

		this.setAddBtnState(product);

		if(this.error === true){
			return false;
		}

		this.setDefaults(product);

		if(product.wishlist){
		//if wishlist product passed
			this.wishlist = product.wishlist;
		}
		//this.setDetailLink();

	}

	

	product.prototype.setSettings = function(p){

		switch(this.type){

			case 1:{
				this.isLoyaltyStoreProduct = true;
				var isInCart = alcoholCart.getLoyaltyProductById(this._id);
			}
			break;

			default : {
				var isInCart = alcoholCart.getProductById(this._id);
			}
		}

		this.isInCart = false;
		this.servechilled=p.chilled;
		this.qChilled = 0;
		this.qNChilled = 0;

		if(isInCart!==false){

			this.isInCart = true;
			this.servechilled = isInCart.getLastServedAs();
			this.qChilled = isInCart.getRQuantity('chilled');
			this.qNChilled = isInCart.getRQuantity('nonchilled');

		}

		this.tquantity = this.qChilled + this.qNChilled;

	}

	product.prototype.setNameSale = function(p){

		var nameSale = p.nameSales.pop();

		this.nameSale = nameSale.listingTitle;
		this.nameDetailSale = nameSale.detailTitle;

		if(angular.isDefined(nameSale.coverImage))
			this.saleImage = nameSale.coverImage.source;

	}

	product.prototype.setSale = function(p){

		var pSale = p.proSales;

		this.sale = {
			quantity : pSale.conditionQuantity,
			type : pSale.actionType,
			title : pSale.listingTitle,
			detailTitle : pSale.detailTitle,
			actionProductId:pSale.actionProductId,
		};

		this.sale.isSingle = (pSale.conditionQuantity==1 && pSale.actionProductId.length==0)?true:false;

		if(angular.isDefined(pSale.coverImage))
			this.sale.coverImage = pSale.coverImage.source;

		if(pSale.actionType==2){
			this.sale.discount = {
				value : pSale.discountValue,
				type : pSale.discountType
			}
		}

		if(pSale.actionType==1){
			this.sale.discount = {
				quantity : pSale.giftQuantity
			}
		}

		var saleProduct = "";

		if(angular.isDefined(pSale.saleProduct) && pSale.saleProduct.length){
			saleProduct = pSale.saleProduct.pop();
		}else{
			saleProduct = p;
		}

		this.sale.discount.product = {
			name : saleProduct.name,
			imageFiles : saleProduct.imageFiles,
			slug : saleProduct.slug
		}

	}

	/**
	*	function to get total quantity is set for current product object
	*	return SUM of chilled and non chilled quantity
	**/
	product.prototype.getTotalQty = function(){
		return parseInt(this.qChilled) + parseInt(this.qNChilled);
	}

	product.prototype.getTotalQtyInCart = function(){

		var isInCart = alcoholCart.getProductById(this._id);

		if(isInCart!==false)
		return isInCart.getRQuantity('chilled') + isInCart.getRQuantity('nonchilled');

		return 0;

	}



	product.prototype.setAddBtnState = function(p){

		if( typeof p === 'undefined' ){
			var p = this;
		}

		var productAvailQty = parseInt(p.quantity);

		this.addBtnAllowed = true;

		if(productAvailQty<1){

			if(p.outOfStockType===1){

				this.addBtnAllowed = false;

			}

		}

		switch(this.type){

			case 1:{

				var notSufficient = false;

				var userData = UserService.getIfUser();

				if(userData!==false){

					var userloyaltyPoints = userData.loyaltyPoints || 0;

					var pointsInCart = alcoholCart.getLoyaltyPointsInCart();				  				   

					var userloyaltyPointsDue = userloyaltyPoints - pointsInCart;

					var point = parseFloat(userloyaltyPointsDue);

					var pointsRequired = this.loyaltyValue.point;

					if(point < pointsRequired && !this.isInCart){
						notSufficient = true;
					}
				}

				this.notSufficient = notSufficient;

			}
			break;
		}

	}

	product.prototype.setDetailLink = function(){

		var href = "javascript:void(0)";
		switch(this.type){

			case 1:{
				href = mainLayout.product({product:productInfo.slug})
			}
			break;
			case 1:{

			}
			break;

		}

		this.href = href;

		return href;

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

		var _product = this;

		switch(this.type){
			case 1:
				if(typeof p.loyaltyValueType !== 'undefined'){

					_product.loyaltyValue = {
						type : parseInt(p.loyaltyValueType),
						point : p.loyaltyValuePoint || 0,
						price : p.loyaltyValuePrice || 0,
					};

				}
			break;
			case 2:

			break;
			default:{

				if (p.price){

					var basePrice = parseFloat(p.price)/1;
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
					var quantity = this.getTotalQty();
					var price = unitPrice;

					this.discountedUnitPrice = price/quantity;

					this.price = price;
					
					this.bulkApplicable = false;

					if(this.sale && this.sale.isSingle){

						if(this.sale.discount.type == 1){//FIXED AMOUNT SALE
							this.price = this.price - this.sale.discount.value;
						}
						if(this.sale.discount.type == 2){//% AMOUNT SALE
							this.price = this.price - (this.price * this.sale.discount.value/100);
						}
						this.price = this.price.toFixed(2);

					}else{

						this.bulkApplicable = true;
						angular.forEach(bulkArr, function(bulk,key){

							if(bulk.type==1){
								bulk.price = basePrice + (basePrice * bulk.value/100);
							}else{
								bulk.price = basePrice + bulk.value;
							}

							bulk.price = bulk.price.toFixed(2);

						})

					}

				}
				else {
					$log.error('Each Product Required Price');
				}
			}

		}

	};

	product.prototype.getCurrentUnitPrice = function () {

		var price = this.price;

		if(this.bulkApplicable){

			var qty = this.getTotalQty();
			var bulkArr = this.bulkPricing;

			angular.forEach(bulkArr, function(bulk){

				if(qty>=bulk.from_qty && qty<=bulk.to_qty){

					price = bulk.price;
				}

			})
		}
		return price.toFixed(2);

	}

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

		this.isLoyalty = p.isLoyalty;
		this.loyaltyValueType = p.loyaltyValueType;
		this.loyaltyValuePoint = p.loyaltyValuePoint;
		this.loyaltyValuePrice = p.loyaltyValuePrice;

	}

	product.prototype.addToCart = function() {

		var _product = this;

		var defer = $q.defer();

		if(typeof _product.proUpdateTimeOut!=="undefined"){

			$timeout.cancel(_product.proUpdateTimeOut);

		}

		_product.proUpdateTimeOut = $timeout(function(){

			var quantity = {
					chilled : parseInt(_product.qChilled),
					nonChilled : parseInt(_product.qNChilled)
				}

			if(_product.isLoyaltyStoreProduct){

				if(_product.notSufficient){

					defer.reject({'notSufficient':true});

				}

				alcoholCart.setLoyaltyPointsInCart();

				alcoholCart.addLoyaltyProduct(_product._id,quantity,_product.servechilled).then(

					function(successRes){

						switch(successRes.code){
								case 100:

									$timeout(function(){
										$mdToast.show({
											controller:function($scope){

												$scope.qChilled = 0;
												$scope.qNchilled = 0;

												$scope.closeToast = function(){
													$mdToast.hide();
												}
											},
											templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
											parent : $element,
											position: 'top center',
											hideDelay:10000
										});
									},1000);

								break;
								case 101:

									$timeout(function(){

										$mdToast.show({
											controller:function($scope){

												$scope.qChilled = 0;
												$scope.qNchilled = 0;

												$scope.closeToast = function(){
													$mdToast.hide();
												}
											},
											templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
											parent : $element,
											position: 'top center',
											hideDelay:10000
										});

									},1000);

								break;

							}

					},
					function(errorRes){

						if(errorRes.code){

							var code = parseInt(errorRes.code);

							switch(code){

								case 401:{

									$rootScope.$broadcast('showLogin');

								}
								break;

							}

						}

						if(errorRes.quantity){

							_product.qChilled = errorRes.quantity.chilled | 0;
							_product.qNchilled = errorRes.quantity.nonchilled | 0;

						}else{

							_product.qChilled = 0;
							_product.qNchilled = 0;

						}

					}

				);

			}else{

				alcoholCart.addItem(_product._id,quantity,_product.servechilled).then(

					function(successRes){

						if(successRes.success){

							switch(successRes.code){
								case 100:

									$timeout(function(){
									$mdToast.show({
										controller:function($scope){

											$scope.qChilled = 0;
											$scope.qNchilled = 0;

											$scope.closeToast = function(){
												$mdToast.hide();
											}
										},
										templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
										parent : $element,
										position: 'top center',
										hideDelay:10000
									});
									},1000);

								break;
								case 101:

									$timeout(function(){
									$mdToast.show({
										controller:function($scope){

											$scope.qChilled = 0;
											$scope.qNchilled = 0;

											$scope.closeToast = function(){
												$mdToast.hide();
											}
										},
										templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
										parent : $element,
										position: 'top center',
										hideDelay:10000
									});
									},1000);

								break;

							}

							if(_product.isInCart===false){
								_product.isInCart = alcoholCart.getProductById(_product._id);
							}


						}

					},
					function(errorRes){
						//
					}

				);
			}

			if(_product.quantitycustom==0){
				$scope.isInCart = false;
				$scope.addMoreCustom = false;
				this.quantitycustom = 1;
			}

		},1500)

	return defer.promise;
		};

		product.prototype.hrefDetail = function(){
			$state.go('mainLayout.product', {'product': this.slug});
		};

		product.prototype.setParentDetail = function(p){
			this.parentCategory = p;
		};

		product.prototype.setChildDetail = function(p){
			this.childCategory = p;
		};

	return product;

}]);

AlcoholDelivery.factory('CreditCertificate',[
			'alcoholCart','$q', '$timeout', 'UserService',
	function(alcoholCart, $q, $timeout, UserService){

	var certificate = function(data){

		this.setQuantity(data);
		this.setLoyalty(data.loyalty);
		this.setValue(data.value);
		this.setCommonSetings();
		this.setAddBtnState();

	}

	certificate.prototype.setQuantity = function(credit){

		isInCart = alcoholCart.getLoyaltyCardByValue(credit.value);

		if(isInCart===false){
			this.qNChilled = 0;
		}else{
			this.qNChilled = isInCart.quantity;
		}

	};

	certificate.prototype.getQuantity = function(){

		return parseInt(this.qNChilled);

	}

	certificate.prototype.setCommonSetings = function(){

		this.servechilled = false;
		this.isLoyaltyStoreProduct = true;

	}

	certificate.prototype.setLoyalty = function(loyalty){

		if (loyalty)  this.loyalty = parseInt(loyalty);
		else {
			$log.error('Loyalty must be provided');
		}

	};

	certificate.prototype.setValue = function(value){

		if (value)  this.value = parseFloat(value);
		else {
			$log.error('Value must be provided');
		}

	};

	certificate.prototype.addToCart = function(){

		var defer = $q.defer();

		var _certificate = this;


		if(typeof _certificate.updateTimeOut!=="undefined"){

			$timeout.cancel(_certificate.updateTimeOut);

		}

		_certificate.updateTimeOut = $timeout(function(){

			if(_certificate.notSufficient){

				defer.reject({'notSufficient':true});

			}

			alcoholCart.addCreditCertificate(_certificate.value,_certificate.qNChilled).then(

				function(successRes){

					switch(successRes.code){
							case 100:

								$timeout(function(){
									$mdToast.show({
										controller:function($scope){

											$scope.qChilled = 0;
											$scope.qNchilled = 0;

											$scope.closeToast = function(){
												$mdToast.hide();
											}
										},
										templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
										parent : $element,
										position: 'top center',
										hideDelay:10000
									});
								},1000);

							break;
							case 101:

								$timeout(function(){

									$mdToast.show({
										controller:function($scope){

											$scope.qChilled = 0;
											$scope.qNchilled = 0;

											$scope.closeToast = function(){
												$mdToast.hide();
											}
										},
										templateUrl: '/templates/toast-tpl/notify-quantity-na.html',
										parent : $element,
										position: 'top center',
										hideDelay:10000
									});

								},1000);

							break;

						}

					_certificate.qNChilled = successRes.data.card.quantity || 0;

				},
				function(errorRes){

					_certificate.qNChilled = errorRes.quantity || 0;
				}

			);
		},500)

		return defer.promise;
	};

	certificate.prototype.setAddBtnState = function(p){

		if( typeof p === 'undefined' ){
			var p = this;
		}

		var productAvailQty = p.getQuantity();

		this.addBtnAllowed = true;

		var notSufficient = false;

		var user = UserService.getIfUser();

		if(user!==false){

			var userloyaltyPoints = user.loyaltyPoints || 0;

			var pointsInCart = alcoholCart.getLoyaltyPointsInCart() || 0;

			var userloyaltyPointsDue = userloyaltyPoints - pointsInCart;

			var point = parseFloat(userloyaltyPointsDue);

			var pointsRequired = parseInt(this.value);

			if(point < pointsRequired && !this.isInCart){
				notSufficient = true;
			}

		}

		this.notSufficient = notSufficient;

	}

	return certificate;

}]);
