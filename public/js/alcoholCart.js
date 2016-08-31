AlcoholDelivery.service('alcoholCart', [
			'$rootScope', '$window', '$http', '$q', '$mdToast', 'alcoholCartItem', 'alcoholCartLoyaltyItem', 'alcoholCartPackage','promotionsService','alcoholCartPromotion', 'alcoholCartGiftCard', 'alcoholCartGift', 
	function ($rootScope, $window, $http, $q, $mdToast, alcoholCartItem, alcoholCartLoyaltyItem, alcoholCartPackage, promotionsService, alcoholCartPromotion, alcoholCartGiftCard, alcoholCartGift) {

	this.init = function(){
		
		this.$cart = {
			
			products : {},
			loyalty : {},
			packages : [],
			promotions :[],
			nonchilled : false,
			delivery : {

				type : null,
				charges : null,
				address : null,
				contact : null,
				instruction : null,
				leaveatdoor : false,
				instructions : null,

			},
			service : {
				express : {
					status : false,
					charges : null
				},
				smoke : {
					status : false,
					charges : null
				},
				delivery : {
					free : false,
					charges : null,
					mincart : null,
				},
			},
			discount : {
				nonchilled : {
					status : false,
					exemption : null
				}
			},
			timeslot : {
					datekey:false,
					slotkey:false,
					slug:"",
					slotslug:""
				},
		};
	};

	this.addItem = function (id, quantity, serveAs) {

		var defer = $q.defer();

		var inCart = this.getProductById(id);
		var _self = this;
		var deliveryKey = _self.getCartKey();

		if(typeof id.$id !== 'undefined'){ id = id.$id}

		$http.put("/cart/"+deliveryKey, {
				"id":id,
				"quantity":quantity,
				"chilled":serveAs,
				"type":"product",
			},{

		}).error(function(data, status, headers) {

			defer.reject(data);

		}).success(function(response) {

			if(response.success){

				var resProduct = response.product;

				if(inCart){				

					if(resProduct.quantity==0){

						_self.removeItemById(id);

					}else{

						inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
						inCart.setTQuantity(resProduct.quantity);
						inCart.setPrice(resProduct);

						inCart.setRMaxQuantity(resProduct);

					}									

				}else{				
					
		    		var newItem = new alcoholCartItem(id, resProduct);
					_self.$cart.products[id] = newItem;
					
				}

				if(resProduct.product.change!==0){
					if(resProduct.product.change>0){
						$rootScope.$broadcast('alcoholCart:updated',{msg:"Items added to cart",quantity:Math.abs(resProduct.product.change)});
					}else{
						$rootScope.$broadcast('alcoholCart:updated',{msg:"Items removed from cart",quantity:Math.abs(resProduct.product.change)});
					}
				}

			}

			defer.resolve(response);

		});

		return defer.promise
	};

	this.addLoyaltyProduct = function (id, quantity, serveAs) {

		var defer = $q.defer();

		var inCart = this.getLoyaltyProductById(id);
		var _self = this;
		var deliveryKey = _self.getCartKey();

		if(typeof id.$id !== 'undefined'){ id = id.$id}

		$http.put("/cart/loyalty/"+deliveryKey, {
				"id":id,
				"quantity":quantity,
				"chilled":serveAs
			},{

		}).error(function(data, status, headers) {

			defer.reject(data);

		}).success(function(response) {

			if(response.success){

				var resProduct = response.product;

				if(inCart){				

					if(resProduct.quantity==0){

						//_self.removeItemById(id);

					}else{
					
						inCart.setTQuantity(resProduct.quantity);
						inCart.setPrice(resProduct);

					}									

				}else{
					
		    		var newItem = new alcoholCartLoyaltyItem(id,resProduct);
					_self.$cart.loyalty[id] = newItem;

				}



				if(response.change!==0){

					if(response.change>0){

						$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty product added to cart",quantity:Math.abs(response.change)});

					}else{

						$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty product removed from cart",quantity:Math.abs(response.change)});

					}
				}

			}

			defer.resolve(response);

		});

		return defer.promise
	};

	this.addBulk = function(products){

		var defer = $q.defer();
		var _self = this;
		$http.put('cart/bulk',products)
				.success(function(response){

					if(response.success){					

						angular.forEach(response.data.products, function (product, index) {
							
							var id = product.product._id;
							var inCart = _self.getProductById(id);

							if(inCart){

								inCart.setRQuantity(product.chilled.quantity,product.nonchilled.quantity);
								inCart.setTQuantity(product.quantity);
								inCart.setPrice(product);

								inCart.setRMaxQuantity(product);

							}else{				
								
					    		var newItem = new alcoholCartItem(id, product);
								_self.$cart.products[id] = newItem;
								
							}

						});

						defer.resolve("added success fully");

					}

					defer.reject("something went wrong");

				})
				.error(function(data, status, headers){

					defer.reject("something went wrong");

				})

		return defer.promise;
		
	};

	this.repeatLastOrder = function(){

		var defer = $q.defer();
		var _self = this;

		$http.post('cart/repeatlast')
				.success(function(response){

					if(response.success){					

						angular.forEach(response.data.products, function (product, index) {
							
							var id = product.product._id;
							var inCart = _self.getProductById(id);

							if(inCart){

								inCart.setRQuantity(product.chilled.quantity,product.nonchilled.quantity);
								inCart.setTQuantity(product.quantity);
								inCart.setPrice(product);

								inCart.setRMaxQuantity(product);

							}else{				
								
					    		var newItem = new alcoholCartItem(id, product);
								_self.$cart.products[id] = newItem;
								
							}

						});

						defer.resolve("added success fully");

					}

					defer.reject("something went wrong");

				})
				.error(function(data, status, headers){

					defer.reject("something went wrong");

				})

		return defer.promise;
		
	};

	this.addPackage = function (id,detail) {

		var _self = this;
		var deliveryKey = _self.getCartKey();		
		
		var d = $q.defer();

		var products = [];
		angular.forEach(detail.packageItems,function(item,key){
			angular.forEach(item.products,function(product,key){
				if(product.cartquantity > 0){

					var tempPro = {
						_id:product._id,
						quantity : product.cartquantity
					};
					products.push(tempPro);
				}
			})
		});		

		$http.post("/cart/package/"+deliveryKey, {
				"id":id,
				"package":{products:products},
				"type":"package",
			},{

		}).error(function(data, status, headers) {


		}).success(function(response) {

			if(!response.success){
				
				switch(response.errorCode){
					case "100":
						//$cart.product.quantitycustom = response.data.quantity;
					break;
				}

				d.reject('oh no an error! try again');

			}else{
				
				var inCart = _self.getPackageByUniqueId(response.key);

				if(inCart){

					_self.removePackage(response.key);

				}

				var newPackage = new alcoholCartPackage(id, response.key, detail);
		    	_self.$cart.packages.push(newPackage);

		    	if(inCart){
		    		$rootScope.$broadcast('alcoholCart:updated',{msg:"Package updated"});
		    	}else{
		    		$rootScope.$broadcast('alcoholCart:updated',{msg:"Package added to cart"});
		    	}

				d.resolve(response);

			}
		});

		return d.promise;		

	};

	this.addPromo = function(promoId,productId,$event){

		var _self = this;	

		var deliveryKey = _self.getCartKey();
		
		var d = $q.defer();

		if(!this.isEligibleForPromotion(promoId)){

			$mdToast.show({
				controller:function($scope){

				},
				templateUrl: '/templates/toast-tpl/notify-promo-nq.html',
				parent : $event.currentTarget.parentElement,
				position: 'top center',
				hideDelay:2000
			});
			
			return false;
		}

		$http.put("/cart/promotion/"+deliveryKey, {
				"promoId":promoId,
				"id":productId,
			},{

		}).error(function(data, status, headers) {


		}).success(function(response) {

			if(!response.success){
				
				switch(response.errorCode){
					case "100":
						//$cart.product.quantitycustom = response.data.quantity;
					break;
				}

				d.reject('oh no an error! try again');

			}else{							
				
				var isExist = promotionsService.isExist(promoId,productId);

				if(isExist===false){
					
					d.reject(data);

				}else{

					var cart = _self.getCart();
					angular.forEach(cart.promotions, function (promotion, index) {

						if(promotion._id===promoId)
						var locPromotion = cart.promotions.splice(index, 1)[0] || {};						

					});

					var oPromotion = new alcoholCartPromotion(isExist.promotion,isExist.product);
					_self.$cart.promotions.push(oPromotion);

					_self.setPromotionsInCart();

					$rootScope.$broadcast('alcoholCart:promotionAdded', "Promotion added to cart");

				}							

				d.resolve(response);

			}
		});

		return d.promise;

	};

	this.isEligibleForPromotion = function(promoId){

		var cartSubTotal = this.getSubTotal();
		var isEligible = promotionsService.isEligible(promoId,cartSubTotal);

		return isEligible;

	}

	this.setPromotionsInCart = function(){

		_oCart = this;
		angular.forEach(promotionsService.$promotions,function(promotion){

			if(_oCart.getPromotionById(promotion._id)!==false ){
				promotion.inCart = true;
			}else{
				promotion.inCart = false;
			}
		
		});	

	}

		this.getPromotionById = function(promoId){

			var promotions = this.getCart().promotions;
			var build = false;
			
			angular.forEach(promotions, function (promotion) {
				if  (promotion._id === promoId) {
					build = promotion;
				}
			});
			return build;
		}

		this.getProductById = function (productId){

			var products = this.getCart().products;
			var build = false;

			if(typeof products[productId] !== 'undefined'){
				build = products[productId];
			}
			
			return build;
		};

		this.getProductInCartById = function(productId){

			var products = this.getProducts();
			var promotions = this.getPromotions();
			var loyalty = this.getLoyaltyProducts();

			var build = false;
			
			if(typeof products[productId] !== 'undefined'){
				build = products[productId];
			}

			if(build!==false){return build;}

			angular.forEach(promotions, function(promotion, key) {
				
				if(promotion.product._id == productId){
					var product = {
						imageFiles : [
							{
								coverimage:1,
								source:promotion.product._image
							}
						],
						slug : promotion.product._slug,
						name: promotion.product._title
					}
					build = {product:product};
				}

			});

			if(build!==false){return build;}
			
			if(typeof loyalty[productId] !== 'undefined'){
				build = products[productId];
			}

			if(build!==false){return build;}

		}

		this.getGiftCardByUid = function (uId){

			var cards = this.getCart().giftCards;
			var build = false;

			angular.forEach(cards, function (card) {
				
				if (card.getUniqueId() == uId) {
					build = card;
				}
			});
			return build;
		};	

		this.getLoyaltyProductById = function (productId){

			var products = this.getCart().loyalty;
			var build = false;

			if(typeof products[productId] !== 'undefined'){
				build = products[productId];
			}
			
			return build;
		};


		this.getPackageByUniqueId = function(packageUniqueId){

			var packages = this.getCart().packages;
			var build = false;
			
			angular.forEach(packages, function (package) {
				if  (package.getUniqueId() === packageUniqueId) {
					build = package;
				}
			});
			return build;

		};

		this.setCart = function (cart) {
			// this.$cart = cart;
			return this.getCart();
		};

		this.getCart = function(){
			return this.$cart;
		};

		this.setCartChilled = function(status){

			if(typeof status !=="undefined"){

				this.$cart.nonchilled = status;
				this.$cart.discount.nonchilled.status = status;
			}

			this.deployCart();
		
		}

		this.setDiscount = function(){

			var discount = 0;

			if(this.$cart.nonchilled){

				discount += this.$cart.discount.nonchilled.exemption;

			}

			return +parseFloat(discount).toFixed(2);

		}	

		this.getDiscount = function(){
			return this.setDiscount();
		}

		this.setAllServicesCharges = function(){		

			var allServicesCharges = 0;

			var service = this.$cart.service;

			if(service.express.status){
				allServicesCharges+= service.express.charges;
			}
			if(service.smoke.status){
				allServicesCharges+= service.smoke.charges;				
			}		
			
			service.total = allServicesCharges;

			return +parseFloat(allServicesCharges).toFixed(2);
		};

		this.getAllServicesCharges = function(){
			return this.setAllServicesCharges();
		}

		this.setCartSettings = function($settings){

			angular.merge(this.$cart,$settings);
			
		};

		this.getCartSettings = function(){

			var temp = angular.copy(this.$cart);

			delete temp.products;
			delete temp.packages;

			return temp;
		};

		this.getProducts = function(){
			return this.getCart().products;
		};

		this.getLoyaltyProducts = function(){
			return this.getCart().loyalty;
		};

		this.getLoyaltyPointsInCart = function(){

			var lp = this.getLoyaltyProducts();
			var points = 0;
			angular.forEach(lp, function(product,key){
				points = points + parseInt(product.loyaltyValue.point);
			});

			return points;

		}		

		this.getPackages = function(){
			return this.getCart().packages;
		};

		this.getPromotions = function(){
			return this.getCart().promotions;
		};

		this.getTotalItems = function(){

			var count = 0;
			var items = this.getProducts();
			angular.forEach(items, function (item) {
				count += item.getQuantity();
			});

			return count;

		};

		this.resetTimeslot = function(){

			this.$cart.timeslot = {
						datekey:false,
						slotkey:false,
						slug:"",
						slotslug:""
					}
		}

		this.getTotalPackages = function () {
			
			return this.getCart().packages.length
		};

		this.getTotalUniqueItems = function () {
			
			if(typeof this.getCart() === "undefined"){
				return 0;
			}

			var cart = this.getCart();

			var count = Object.keys(cart.products).length;

			count+= Object.keys(cart.loyalty).length;

			count+= cart.packages.length;

			count+= cart.giftCards.length;

			return count;
		};

		this.setSubTotal =function(){
			
			var total = 0;
			var cart = this.getCart();

			angular.forEach(cart.products, function (product) {
				total += parseFloat(product.getTotal());
			});

			angular.forEach(cart.packages, function (package) {
				total += parseFloat(package.getTotal());
			});		

			angular.forEach(cart.giftCards, function (giftCard) {
				total += parseFloat(giftCard.getPrice());
			});

			promotionsService.setEligibility(total);
			
			this.removeNonEligiblePromotions(total);

			angular.forEach(cart.promotions, function (promotion) {
				total += parseFloat(promotion.getPrice());
			});

			return +parseFloat(total).toFixed(2);

		}

		this.getSubTotal = function(){
			
			return this.$cart.payment.subtotal = this.setSubTotal();

		};

		this.setCartTotal = function(){

			var cartTotal = 0;
			
			cartTotal+= parseFloat(this.getSubTotal());

			cartTotal+= parseFloat(this.getAllServicesCharges());

			cartTotal+= parseFloat(this.getDeliveryCharges());

			cartTotal-= parseFloat(this.getDiscount());
						
			
			return +parseFloat(cartTotal).toFixed(2);

		};

		this.getCartTotal = function(){

			var cartTotal = this.setCartTotal();
			this.$cart.payment.total = cartTotal;
			return cartTotal;			

		};

		this.setDeliveryCharges =function(){
			
			var delivery = this.$cart.service.delivery;

			var subTotal = parseFloat(this.getSubTotal());

			if(subTotal>=parseFloat(delivery.mincart)){
				
				this.$cart.service.delivery.free = true;
				this.$cart.delivery.charges = 0;

			}else{

				this.$cart.service.delivery.free = false;
				this.$cart.delivery.charges = parseFloat(this.$cart.service.delivery.charges).toFixed(2);

			}
			
			return this.$cart.delivery.charges;

		}

		this.getDeliveryCharges = function(){
			
			return this.setDeliveryCharges();

		};

		this.totalCost = function () {
			return +parseFloat(this.getSubTotal() + this.getShipping() + this.getTax()).toFixed(2);
		};

		this.removeItem = function (index) {
			var item = this.$cart.items.splice(index, 1)[0] || {};
			$rootScope.$broadcast('alcoholCart:itemRemoved', item);			

		};

		this.removeItemById = function (id) {

			var item;
			var cart = this.getCart();
			angular.forEach(cart.products, function (product, index) {
				if(index === id) {

					delete cart.products[index];
					item = product || {};
					
				}	
			});
			//this.setCart(cart);
			$rootScope.$broadcast('alcoholCart:itemRemoved', item);
			
		};

		this.removePackage = function (id,fromServerSide) {

			var locPackage;
			var cart = this.getCart();
			
			angular.forEach(cart.packages, function (package, index) {

				if(package.getUniqueId() === id) {

					var locPackage = cart.packages.splice(index, 1)[0] || {};

				}	
			});
			
			$rootScope.$broadcast('alcoholCart:itemRemoved', locPackage);
			
		};

		this.removePromotion = function (id) {

			var locPromotion;
			var cart = this.getCart();
			var _self = this;
			var d = $q.defer();

			angular.forEach(cart.promotions, function (promotion, index) {

				if(promotion._id === id) {

					$http.delete("cart/promotion/"+id).then(

						function(successRes){
							
							var locPromotion = cart.promotions.splice(index, 1)[0] || {};

							$rootScope.$broadcast('alcoholCart:promotionRemoved', "Promotion removed from cart");

							_self.setPromotionsInCart();

							d.resolve(successRes);

						},
						function(errorRes){

							d.reject(errorRes);

						}

					);

				}
			});
			
			return d.promise;

		};
		
		this.removeNonEligiblePromotions = function(subTotal){

			var promotions = this.getCart().promotions;

			angular.forEach(promotions, function (promotion,key) {

				var isEligible = promotionsService.isEligible(promotion._id,subTotal);

				if(isEligible===false){

					var toast = $mdToast.simple()
						.textContent("Promotion Product removed from your cart due to non eligilibility")
						.highlightAction(false)
						.position("top right");
					$mdToast.show(toast);

					promotions.splice(key, 1)[0] || {};

				}
				
			});

		}

		this.setSmokeStatus = function(status){

			var status = Boolean(status);

			this.$cart.service.smoke.status = status;
			
			if(!status){
				this.removeSmoke();
			}

			this.deployCart();

		}

		this.addSmoke = function(detail){

			var smoke = this.$cart.service.smoke;
			if(!smoke.status){

				var toast = $mdToast.simple()
					.textContent("Activate need smoke")
					.action('OK')
					.highlightAction(false)
					.position("top right");

				$mdToast.show(toast).then(function(response) {
					if ( response == 'ok' ) {
						this.setSmokeStatus(true);
					}
				});
			}

			if(typeof detail==="undefined" || detail==""){

				var toast = $mdToast.simple()
					.textContent("Please provide smoke detail")
					
					.highlightAction(false)
					.position("top right fixed smokedetail")
					.hideDelay(2000);

				$mdToast.show(toast);

			}else{

				smoke.detail = detail;

			}

			this.deployCart();

		}

		this.removeSmoke = function(){

			this.$cart.service.smoke.detail = "";

		}

		this.empty = function () {

			this.$cart.products = {};
			$window.localStorage.removeItem('deliverykey');
		};
		
		this.isEmpty = function () {
			
			return (getTotalUniqueItems() > 0 ? false : true);

		};

		this.toObject = function() {

			if (this.getProducts().length === 0) return false;

			var items = [];
			angular.forEach(this.getProducts(), function(item){
				items.push (item.toObject());
			});

			return {
				shipping: this.getShipping(),
				tax: this.getTax(),
				taxRate: this.getTaxRate(),
				subTotal: this.getSubTotal(),
				totalCost: this.totalCost(),
				items:items
			}
		};

		this.setServices = function(fnCallBack){

			var _self = this;

			if(typeof fnCallBack !== 'function') fnCallBack = function(){};
			
			$http.get("cart/services").then(function(response){

				_self.$cart.service.express.charges = response.data.express;
				_self.$cart.service.smoke.charges = response.data.smoke;

				_self.$cart.service.delivery.charges = response.data.delivery;
				_self.$cart.service.delivery.mincart = response.data.mincart;

				_self.$cart.discount.nonchilled.exemption = response.data.chilled;
				
				fnCallBack();

			})

		};	

		this.setDeliveryType = function(status){
			
			var _self = this;
			if(typeof status !=="undefined"){
				
				this.$cart.delivery.type = status;

				if(status==1){
					this.$cart.service.express.status = false;	
				}

			}

			var products = this.getCart().products;
			angular.forEach(products, function (product,key) {

				if(product.onlyForAdvance && _self.$cart.delivery.type==0){
					product.setNonAvailability(true);
				}else{
					product.setNonAvailability(false);
				}

			});

			this.deployCart();
		}

		this.checkAvailability = function(){

			var d = $q.defer();

			$http.get("cart/availability/"+cartKey,{

	        }).error(function(data, status, headers) {

	        	d.reject(data);

	        }).success(function(response) {	        		      

	        	d.resolve(response);

	        });

			return d.promise;

		}

		this.setProductsAvailability = function(){

			var products = this.getProducts();
			var packages = this.getPackages();
			var promotions = this.getPromotions();

			angular.forEach(products, function (item,key) {



			});

			// angular.forEach(packages, function (package,key) {
				
			// 	(cartproduct.onlyForAdvance && cart.delivery.type==0) || cartproduct.isNotAvailable

			// });

			// angular.forEach(promotions, function (promotion,key) {

			// 	(cartproduct.onlyForAdvance && cart.delivery.type==0) || cartproduct.isNotAvailable			
				
			// });

			
			
		}

		this.setExpressStatus = function(status){

			if(typeof status !=="undefined"){

				this.$cart.service.express.status = status;

			}

			this.deployCart();
		}

		this.updateChilledStatus = function(id,type){
			
			var product = this.getProductById(id);

			product[type+'Status'] = !product[type+'Status'];
						
			var deliveryKey = this.getCartKey();

			$http.put("/cart/chilledstatus/"+deliveryKey, {
					"id":id,
					"chilled":product.qChilledStatus,
					"nonchilled":product.qNChilledStatus
				},{

			}).error(function(data, status, headers) {

			}).success(function(response) {

			});

		}

		this.addGiftCard = function(giftData){

			var isFound = this.getGiftCardByUniqueId(giftData._uid);

			if(isFound===false){
			
				var giftCard = new alcoholCartGiftCard(giftData);
				this.$cart.giftCards.push(giftCard);

			}


		};

		this.removeCard = function (id,fromServerSide) {

			var locPackage;
			var cart = this.getCart();
			
			var d = $q.defer();

			angular.forEach(cart.giftCards, function (giftcard, index) {

				if(giftcard.getUniqueId() === id) {				

					if(typeof fromServerSide !== 'undefined' && fromServerSide){

						$http.delete("cart/card/"+id).then(

							function(successRes){
								
								var locCard = cart.giftCards.splice(index, 1)[0] || {};

								// $rootScope.$broadcast('alcoholCart:cardRemoved', "GiftCard removed from cart");
								
								d.resolve(successRes);

							},
							function(errorRes){

								d.reject(errorRes);

							}

						);
					}

				}	
			});
			
			// $rootScope.$broadcast('alcoholCart:itemRemoved', locCard);
			return d.promise;

		};

		this.removeGift = function (uid,fromServerSide) {

			var cart = this.getCart();
			
			var d = $q.defer();

			angular.forEach(cart.gifts, function (gift, index) {
				
				if(gift.getUniqueId() == uid) {

					if(typeof fromServerSide !== 'undefined' && fromServerSide){

						$http.delete("cart/gift/"+uid).then(

							function(successRes){
								
								var locGift = cart.gifts.splice(index, 1)[0] || {};

								$rootScope.$broadcast('alcoholCart:giftRemoved', "Gift removed from cart");
								
								d.resolve(successRes);

							},
							function(errorRes){

								d.reject(errorRes);

							}

						);
					}

				}	
			});
			
			// $rootScope.$broadcast('alcoholCart:itemRemoved', locCard);
			return d.promise;

		};

		this.getGiftCardByUniqueId = function(uid){

			var giftCards = this.getGiftCards();
			var build = false;
			
			angular.forEach(giftCards, function (giftCard) {

				if (giftCard.getUniqueId() === cardUniqueId) {
					build = giftCard;
				}

			});
			return build;
		}

		this.getGiftCards = function(){

			var cards = this.getCart().giftCards || [];
			
			return cards;
		}

		this.addGift = function(giftData){

			var isFound = false;
			if(typeof giftData._uid === 'undefined'){
				var isFound = this.getGiftByUniqueId(giftData._uid);
			}

			if(isFound===false){

				if(typeof giftData !== 'object'){
					return false;
				}

				var gift = new alcoholCartGift(giftData);

				this.$cart.gifts = this.$cart.gifts || [];
				this.$cart.gifts.push(gift);

			}


		};

		this.getGiftByUniqueId = function(uid){

			var gifts = this.getGifts();
			var build = false;
			
			angular.forEach(gifts, function (gift) {

				if (gift.getUniqueId() === uid) {
					build = gift;
				}

			});
			return build;
		}

		this.getGifts = function(){

			var gifts = this.getCart().gifts || [];
			
			return gifts;
		}

		this.getCartKey = function(){

			var deliverykey = localStorage.getItem("deliverykey");
			if(deliverykey===null || typeof deliverykey==="undefined"){
				deliverykey = $rootScope.deliverykey;
			}

			if(deliverykey===null || typeof deliverykey==="undefined"){
				return false;
			}

			return deliverykey;

		}

		// this.setNonChilledStatus(){

		// 	$cart.nonchilled = true;

		// }

		this.setCartKey = function(cartKey){

			localStorage.setItem("deliverykey",cartKey)
			$rootScope.deliverykey = cartKey;

			return cartKey;
		}

		this.$restore = function(storedCart){

			var _self = this;

			_self.init();

			var products = {};
			var loyalty = {};
			var packages = [];
			var promotions = [];
			var giftCards = [];
			var gifts = [];



			angular.copy(storedCart.products,products);
			angular.copy(storedCart.packages,packages);
			angular.copy(storedCart.promotions,promotions);
			angular.copy(storedCart.giftCards,giftCards);
			angular.copy(storedCart.gifts,gifts);
			angular.copy(storedCart.loyalty,loyalty);

			storedCart.products = {};
			storedCart.loyalty = {};
			storedCart.packages = [];
			storedCart.promotions = [];
			storedCart.giftCards = [];
			storedCart.gifts = [];


			angular.merge(_self.$cart,storedCart);

			_self.setCartKey(storedCart._id);

			angular.forEach(products, function (item,key) {

				if(typeof item !== 'object'){
					return false;
				}
				
				var newItem = new alcoholCartItem(key, item);
				_self.$cart.products[key] = newItem;
				
			});

			angular.forEach(loyalty, function (item,key) {

				if(typeof item !== 'object'){
					return false;
				}
				
				var newItem = new alcoholCartLoyaltyItem(key,item);
				_self.$cart.loyalty[key] = newItem;
				
			});

			angular.forEach(packages, function (package,key) {

				var newPackage = new alcoholCartPackage(package._id,package._unique,package);
				_self.$cart.packages.push(newPackage);
				
			});				

			angular.forEach(promotions, function (promotion,key) {

				var isExist = promotionsService.isExist(promotion.promoId,promotion.productId);

				var isEligible = promotionsService.isEligible(promotion.promoId,_self.getSubTotal());

				if(isExist.promotion===false){

					var toast = $mdToast.simple()
						.textContent("Promotion added in your cart is no longer available")						
						.highlightAction(false)
						.position("top right");
					$mdToast.show(toast);
				
				}else if(isEligible===false){

					var toast = $mdToast.simple()
						.textContent("Promotion Product removed from your cart due to non eligilibility")
						.highlightAction(false)
						.position("top right");
					$mdToast.show(toast);

				}else if(isExist.product === false){

					var toast = $mdToast.simple()
						.textContent("Not Available : Promotion Product removed from your cart")
						.highlightAction(false)
						.position("top right");
					$mdToast.show(toast);

				}else{

					var oPromotion = new alcoholCartPromotion(isExist.promotion,isExist.product);
					
					_self.$cart.promotions.push(oPromotion);

				}			
				
			});

			angular.forEach(giftCards, function (giftCard,key) {

				var giftCard = new alcoholCartGiftCard(giftCard);
				_self.$cart.giftCards.push(giftCard);
				
			});

			angular.forEach(gifts, function (gift,key) {

				var newGift = new alcoholCartGift(gift);
				_self.$cart.gifts.push(newGift);
				
			});

			_self.setPromotionsInCart();

		};

		this.deployCart = function(){

			var cart = {};
			var cartKey = this.getCartKey();

			angular.copy(this.getCart(),cart);
			
			delete cart.packages;
			delete cart.products;
			delete cart._id;
			delete cart.created_at;
			delete cart.updated_at;
			delete cart.user;

			var d = $q.defer();

			$http.put("deploycart/"+cartKey, cart,{

	        }).error(function(data, status, headers) {

	        	d.reject(data);

	        }).success(function(response) {	        		      

	        	d.resolve(response);

	        });	
				
			return d.promise;

		}

		this.freezCart = function(){

			var d = $q.defer();

			this.deployCart().then(
				
				function(successRes){

					$http.get("freezcart").error(function(data, status, headers) {

			        	d.reject(data);

			        }).success(function(response) {	        		      

			        	d.resolve(response);

			        });	
				},
				function(errorRes){}
			);

			return d.promise;

		}

		this.$save = function () {
			
			var that=this;

			store.set(this.getCart(),function(){

			});

		}

		this.validate = function(step){
			return false;
		}

	}]);


AlcoholDelivery.factory('alcoholCartItem', ['$rootScope', '$log', function ($rootScope, $log){
		
		var item = function (id, data) {		

			this.setId(id);

			this.setRQuantity(data.chilled.quantity,data.nonchilled.quantity);			

			this.setRChilledStatus(data.chilled.status,data.nonchilled.status);
			this.setTQuantity(data.quantity);
			this.setPrice(data);			
			this.setLastServedAs(data.lastServedChilled);
			this.setProduct(data);

			this.setRMaxQuantity(data.product);

		};

		item.prototype.setId = function(id){
			if (id)  this._id = id;
			else {
				$log.error('An ID must be provided');
			}
		};

		item.prototype.getId = function(){
			return this._id;
		};

		item.prototype.setLastServedAs = function(servedAs){
			return this.servedAs = servedAs;
		}

		item.prototype.getLastServedAs = function(){
			return this.servedAs;
		}

		item.prototype.setName = function(name){
			if (name)  this._name = name;
			else {
				$log.error('A name must be provided');
			}
		};
		item.prototype.getName = function(){
			return this._name;
		};

		item.prototype.setPrice = function(product){

			var original = product.product;

			var originalPrice = parseFloat(original.price);

			var unitPrice = originalPrice;

			var quantity = this.getQuantity();

			var advancePricing = original.regular_express_delivery;
			
			if(advancePricing.type==1){

				unitPrice +=  parseFloat(originalPrice * advancePricing.value/100);

			}else{

				unitPrice += parseFloat(advancePricing.value);
				
			}

			price = unitPrice;
			price = parseFloat(price.toFixed(2));

			this.unitPrice = price;

			var bulkArr = original.express_delivery_bulk.bulk;

			for(i=0;i<bulkArr.length;i++){

				var bulk = bulkArr[i];

				if(quantity >= bulk.from_qty && quantity<=bulk.to_qty){

					if(bulk.type==1){

						price = quantity * (originalPrice + (originalPrice * bulk.value/100));

					}else{

						price = quantity * (originalPrice + bulk.value);

					}
					
					price = parseFloat(price.toFixed(2));
				}

			}

			this.discountedUnitPrice = price/quantity;
			
			return this.price = price;
			
		};

		item.prototype.getPrice = function(){
			return parseFloat(this.price);
		};

		item.prototype.setRQuantity = function(cQuantity,ncQuantity){
			this.qChilled = cQuantity;
			this.qNChilled = ncQuantity
		}

		item.prototype.setRMaxQuantity = function(product){

			if(product.quantity==0 && product.outOfStockType==2){
				product.quantity = product.maxQuantity;
			}
			
			this.qChilledMax = product.maxQuantity - this.qNChilled;
			this.qNChilledMax = product.maxQuantity - this.qChilled;

		}

		item.prototype.setRChilledStatus = function(cLastStatus,ncLastStatus){

			var status = {
					"chilled":true,
					"nonchilled":false
				}

			this.qChilledStatus = status[cLastStatus];
			this.qNChilledStatus = status[ncLastStatus];		

		}

		item.prototype.getRQuantity = function(type){

			if(type=='chilled'){
				return this.qChilled;
			}

			return this.qNChilled;
		}

		item.prototype.setTQuantity = function(quantity){

			var quantityInt = parseInt(quantity);
			return this.quantity = quantityInt;

		};

		item.prototype.getQuantity = function(){
			return this.quantity;
		};

		item.prototype.setProduct = function(data){

			this.onlyForAdvance = false;
			if(data.product.quantity==0 && data.product.outOfStockType==2){

				this.onlyForAdvance = true;
			}		

			if (data.product) this.product = data.product;
		};

		item.prototype.setNonAvailability = function(status){
			return this.isNotAvailable = Boolean(status);
		}

		item.prototype.getData = function(){
			if (this.product) return this.product;
			else $log.info('This item has no product detail');
		};

		item.prototype.getTotal = function(){
			return +parseFloat(this.getPrice()).toFixed(2);
		};

		item.prototype.toObject = function() {
			return {
				id: this.getId(),
				name: this.getName(),
				price: this.getPrice(),
				quantity: this.getQuantity(),
				data: this.getData(),
				total: this.getTotal()
			}
		};

		return item;

	}]);

AlcoholDelivery.factory('alcoholCartLoyaltyItem', ['$log', function ($log){
		
		var lProduct = function (id, proObj) {

			this.setId(id);

			this.setRQuantity(proObj.chilled.quantity,proObj.nonchilled.quantity);

			this.setRChilledStatus(proObj.chilled.status,proObj.nonchilled.status);
			this.setTQuantity(proObj.quantity);
			this.setPrice(proObj.product);
			this.setLastServedAs(proObj.lastServedChilled);
			this.setProduct(proObj);

			this.setRMaxQuantity(proObj.product);

		};

		lProduct.prototype.setId = function(id){
			if (id)  this._id = id;
			else {
				$log.error('An ID must be provided');
			}
		};

		lProduct.prototype.getId = function(){
			return this._id;
		};

		lProduct.prototype.setLastServedAs = function(servedAs){
			return this.servedAs = servedAs;
		}

		lProduct.prototype.getLastServedAs = function(){
			return this.servedAs;
		}

		lProduct.prototype.setName = function(name){
			if (name)  this._name = name;
			else {
				$log.error('A name must be provided');
			}
		};
		lProduct.prototype.getName = function(){
			return this._name;
		};

		lProduct.prototype.setPrice = function(p){

			var qty = this.getQuantity();

			this.loyaltyValue = {
				type : parseInt(p.loyaltyValueType),
				point : p.loyaltyValuePoint || 0,
				price : p.loyaltyValuePrice || 0,
			};

			this.loyaltyValue.point*= parseInt(qty);
			this.loyaltyValue.price*= parseFloat(qty);

		};

		lProduct.prototype.getPrice = function(){			
			return this.loyaltyValue;
		};

		lProduct.prototype.setRQuantity = function(cQuantity,ncQuantity){
			this.qChilled = cQuantity;
			this.qNChilled = ncQuantity
		}

		lProduct.prototype.setRMaxQuantity = function(product){

			if(product.quantity==0 && product.outOfStockType==2){
				product.quantity = product.maxQuantity;
			}
			
			this.qChilledMax = product.maxQuantity - this.qNChilled;
			this.qNChilledMax = product.maxQuantity - this.qChilled;

		}

		lProduct.prototype.setRChilledStatus = function(cLastStatus,ncLastStatus){

			var status = {
					"chilled":true,
					"nonchilled":false
				}

			this.qChilledStatus = status[cLastStatus];
			this.qNChilledStatus = status[ncLastStatus];		

		}

		lProduct.prototype.getRQuantity = function(type){

			if(type=='chilled'){
				return this.qChilled;
			}

			return this.qNChilled;
		}

		lProduct.prototype.setTQuantity = function(quantity){

			var quantityInt = parseInt(quantity);
			return this.quantity = quantityInt;

		};

		lProduct.prototype.getQuantity = function(){
			return this.quantity;
		};

		lProduct.prototype.setProduct = function(data){

			this.onlyForAdvance = false;
			if(data.product.quantity==0 && data.product.outOfStockType==2){

				this.onlyForAdvance = true;
			}		

			if (data.product) this.product = data.product;
		};

		lProduct.prototype.setNonAvailability = function(status){
			return this.isNotAvailable = Boolean(status);
		}

		lProduct.prototype.getData = function(){
			if (this.product) return this.product;
			else $log.info('This lProduct has no product detail');
		};

		lProduct.prototype.getTotal = function(){
			return +parseFloat(this.getPrice()).toFixed(2);
		};
		
		return lProduct;

	}]);

AlcoholDelivery.factory('alcoholCartPackage', ['$rootScope', '$log', function ($rootScope, $log){

		var package = function (id, uniqueId, data) {

			this.setId(id);		
			this.setUniqueId(uniqueId);
			this.setName(data.title);
			this.setQuantity(data.packageQuantity);
			this.setPrice(data.packagePrice);
			this.setOriginal(data);

		};

		package.prototype.setId = function(id){
			if (id)  this._id = id;
			else {
				$log.error('An ID must be provided');
			}
		};

		package.prototype.getId = function(){
			return this._id;
		};

		package.prototype.setUniqueId = function(uniqueId){
			if (uniqueId){
				this._uniqueId = uniqueId;				
			}
			else {
				$log.error('An Unique Id must be provided');
			}
		};

		package.prototype.getUniqueId = function(){
			return this._uniqueId;
		};
		
		package.prototype.setName = function(name){
			if (name)  this._name = name;
			else {
				$log.error('A name must be provided');
			}
		};
		package.prototype.getName = function(){
			return this._name;
		};		
		
		package.prototype.setOriginal = function(data){
			if (data) {
				this.original = data;
				this.original.unique = this.getUniqueId();
			}
		};

		package.prototype.getOriginal = function(){
			if (this.original) return this.original;
			else $log.info('This package has no original detail');
		};
		
		package.prototype.setQuantity = function(quantity){
			this._maxquantity = 100;
			if (quantity) this._quantity = parseInt(quantity);

		};

		package.prototype.getQuantity = function(){
			if (this._quantity) return parseInt(this._quantity);
			else $log.info('This package quantity has some issue');
		};

		package.prototype.setPrice = function(price){

			var unitPrice = parseFloat(price);

			var quantity = this.getQuantity();
							
			price = quantity * unitPrice;
			price = parseFloat(price.toFixed(2));
					
			return this._price = price;	
			
		};

		package.prototype.getPrice = function(){
			return parseFloat(this._price);
		};

		package.prototype.getTotal = function(){
			return +parseFloat(this.getPrice()).toFixed(2);
		};

		return package;

	}]);

AlcoholDelivery.factory('alcoholCartGiftCard',[function(){

	var giftCard = function(cardData){

		this.setUniqueId(cardData._uid);
		this.setId(cardData._id);
		this.setRecipient(cardData.recipient);

	}

	giftCard.prototype.getUniqueId = function(){		
		return this._uid.$id;
	}

	giftCard.prototype.setUniqueId = function(uid){
		this._uid = uid;
		return this._uid;
	}

	giftCard.prototype.getId = function(){		
		return this._id;
	}

	giftCard.prototype.setId = function(id){
		this._id = id;
		return this._id;
	}

	giftCard.prototype.getPrice = function(){

		var giftPrice = parseInt(this.recipient.quantity) * parseFloat(this.recipient.price);
		return giftPrice;

	}

	giftCard.prototype.setRecipient = function(recipient){
		this.recipient = recipient;
	}

	giftCard.prototype.getRecipient = function(){
		return this.recipient;
	}

	

	giftCard.prototype.remove = function(){

	}
	
	return giftCard;

}]);

AlcoholDelivery.factory('alcoholCartGift',["$log", "giftProduct",function($log, giftProduct){

	var gift = function(giftData){

		this.setUniqueId(giftData._uid);
		this.setId(giftData._id);

		this.gsTitle(giftData.title);
		this.gsSubTitle(giftData.subTitle);		
		this.gsDescription(giftData.description);
		this.gsLimit(giftData.limit);
		this.gsPrice(giftData.price);
		this.setImageLink(giftData.image);
		

		this.setRecipient(giftData.recipient);

		if(typeof giftData.products !== 'undefined'){
			this.setProducts(giftData.products);
		}

	}

	gift.prototype.getUniqueId = function(){		
		return this._uid.$id;
	}

	gift.prototype.setUniqueId = function(uid){
		this._uid = uid;
		return this._uid;
	}

	gift.prototype.getId = function(){		
		return this._id;
	}

	gift.prototype.setId = function(id){
		this._id = id;
		return this._id;
	}

	gift.prototype.gsTitle = function(title){
		
		if (title)  this.title = title;

		if(this.title) {
			return this.title;
		}

		$log.error('Title must be provided');
	}

	gift.prototype.gsSubTitle = function(subTitle){
		
		if (subTitle)  this.subTitle = subTitle;

		if(this.subTitle) {
			return this.subTitle;
		}

		$log.error('Sub Title must be provided');		
		
	}

	gift.prototype.gsDescription = function(desc){
		
		if (desc)  this.desc = desc;

		if(this.desc) {
			return parseInt(this.desc);
		}
		
		$log.error('Description must be provided');
		
	}

	gift.prototype.gsLimit = function(limit){
		
		if (limit)  this.limit = limit;

		if(this.limit) {
			return parseInt(this.limit);
		}
		
		$log.error('Limit must be provided');
	}

	gift.prototype.getProductAttachedCount = function(){

		var products = this.getProducts();
		var productQty = 0;

		angular.forEach(products , function(product,key){
			
			productQty = productQty + parseInt(product.quantity);	

		});

		return productQty;
	}

	gift.prototype.gsPrice = function(price){

		if(price) this.price = parseFloat(price);

		if(this.price){
			return parseFloat(this.price);
		}

		$log.error('Price must be provided');

	}

	gift.prototype.setRecipient = function(recipient){
		this.recipient = recipient;
	}

	gift.prototype.setProducts = function(products){

		var _self = this;
		_self.products = [];

		if (products){

			// this.products = products;

			angular.forEach(products, function(product,index){

				var productObj = new giftProduct(product,_self.getUniqueId());				
				this.push(productObj);

			},this.products)

		}
		else {
			$log.error('Products must be provided');
		}
		
	}

	gift.prototype.getProducts = function(){

		return this.products;

	}

	gift.prototype.setImageLink = function(image){

		if(image){
			this.imageLink = "gifts/i/"+image;
		}else{
			this.imageLink = "asset/i/defaultImage.png";			
		}
		
		return this.imageLink;
		
	}

	gift.prototype.remove = function(){

	}

	return gift;

}]);

AlcoholDelivery.factory('giftProduct', ['$rootScope', '$q', '$http', '$log', function ($rootScope, $q, $http, $log){
		
		var giftProductObj = function (giftProduct,giftUid) {

			this.setId(giftProduct._id);
			this.setGiftUid(giftUid);
			this.setQuantity(giftProduct.quantity);

		};				

		giftProductObj.prototype.setId = function(id){
			if (id)  this._id = id;
			else {
				$log.error('An ID must be provided');
			}
		};

		giftProductObj.prototype.getId = function(){
			return this._id;
		};

		giftProductObj.prototype.setGiftUid = function(uid){
			if (uid)  this.giftUid = uid;
			else {
				$log.error('An ID must be provided');
			}
		};

		giftProductObj.prototype.getGiftUid = function(){
			return this.giftUid;
		};

		giftProductObj.prototype.setQuantity = function(quantity){
			return this.quantity = parseInt(quantity);
		}

		giftProductObj.prototype.getQuantity = function(){
			return parseInt(this.quantity);
		}		

		giftProductObj.prototype.setName = function(name){
			if (name)  this._name = name;
			else {
				$log.error('A name must be provided');
			}
		};

		giftProductObj.prototype.getName = function(){
			return this._name;
		};	

		giftProductObj.prototype.setProduct = function(data){

			this.onlyForAdvance = false;
			if(data.product.quantity==0 && data.product.outOfStockType==2){

				this.onlyForAdvance = true;
			}		

			if (data.product) this.product = data.product;
		};

		return giftProductObj;

	}]);

AlcoholDelivery.factory('alcoholCartPromotion',['$log','$filter',function($log,$filter){

	var oPromotion = function(promotion,product){

		this.setPromotion(promotion);		
		this.setProduct(product);
		this.setPrice(product);

	}

	oPromotion.prototype.setPromotion = function(promo){

		this._id = promo._id;
		this._title = promo.title;
		this._price = parseFloat(promo.price);	

	}
	oPromotion.prototype.setProduct = function(product){

		this.product = {

			_id : product._id,			
			_sku : product.sku,
			_title : product.name,
			_description : product.description,
			_shortDescription : product.shortDescription,
			_image : $filter('getProductThumb')(product.imageFiles),
			_slug : product.slug,

		}
		
	}

	oPromotion.prototype.setPrice = function(product){		
		if(parseInt(product.promo.type)===0) {
			this.product._price = 0;
		}else{
			this.product._price = parseFloat(product.promo.price);
		}
	}

	oPromotion.prototype.getPrice = function(){
		return parseFloat(this.product._price);
	}
	
	return oPromotion;
}]);

AlcoholDelivery.service('store', ['$rootScope','$window','$http','alcoholCart','promotionsService','$q', function ($rootScope,$window,$http,alcoholCart,promotionsService,$q) {

		return {

			init : function (){

				var d = $q.defer();
				if(typeof(Storage) !== "undefined"){

					var deliverykey = alcoholCart.getCartKey();

					if(deliverykey===false){
						deliverykey = "";
					}

					promotionsService.init().then(

						function(){

							$http.get("cart/"+deliverykey).success(function(response){

								alcoholCart.$restore(response.cart);
								d.resolve("every thing all right");

							})

						},function(){

						}
					);
					

				}else{

					alert("Browser is not compatible");
					d.reject('oh no an error! try again');

				}

				return d.promise;

			},

			orderPlaced : function(){

				delete $rootScope.deliverykey;
				localStorage.removeItem("deliverykey");
				this.init();

			},

			set: function (val,fnCallBack) {

				CartSession.GetDeliveryKey().then(

					function(response){

						$http.put("deploycart", val,{

				        }).error(function(data, status, headers) {

				        }).success(function(response) {

				        	if(typeof fnCallBack !== 'function') fnCallBack = function(){};

				        	fnCallBack();

				        });				       

					}

				)
			}
		}
	}]);


AlcoholDelivery.service("promotionsService",["$http","$log","$q",function($http,$log,$q){

	this.init = function(){

		var _self = this;
		var defer = $q.defer();

		//ProductService.getPromotions()
		$http.get("super/promotions").then(

			function(succRes){
				
				_self.$promotions = succRes.data;

				defer.resolve(_self.$promotions);
			},
			function(errRes){

				defer.reject('oh no an error! try again');

			}
		)


		return defer.promise;
	}

	this.isExist = function(promoId,productId){

		var promoExist = false;
		var promoProExist = false;

		angular.forEach(this.$promotions,function(promotion){

			if(promotion._id===promoId) {

				promoExist = {};

				angular.copy(promotion,promoExist);

				angular.forEach(promotion.products,function(product){
					
					if(product._id===productId){
						
						promoProExist = angular.copy(product);

					}

				});

			}

		})

		return {
			promotion : promoExist,
			product : promoProExist
		}
	}

	this.isEligible = function(promoId,cartPrice){

		var eligible = false;
		cartPrice = parseFloat(cartPrice);

		angular.forEach(this.$promotions,function(promotion){
			if(promotion._id===promoId && parseFloat(promotion.price)<=cartPrice) {
				eligible = true;
			}
		})

		return eligible;

	}

	this.setEligibility = function(subTotal){

		var subTotal = parseFloat(subTotal);
		
		var nearest = true;
		
		angular.forEach(this.$promotions,function(promotion){

			promotion.eligible = {

				already :false,
				required : 0,

			};		

			var promoPrice = parseFloat(promotion.price);

			if(promoPrice<=subTotal) {

				promotion.eligible.already = true;
				promotion.eligible.nearest = false;
 
			}else{

				promotion.eligible.nearest = nearest;
				promotion.eligible.required = parseFloat(promoPrice - subTotal).toFixed(2);
				nearest = false;
				
			}

		});

	}
	
}]);