AlcoholDelivery.service('alcoholCart', [
			'$log','$rootScope', '$window', '$document', '$http', '$state', '$q', '$mdToast', '$mdDialog', '$filter', 
			'$timeout', '$interval', '$cookies','appConfig', 'sweetAlert', 
			'alcoholCartItem', 'alcoholCartLoyaltyItem', 
			'alcoholCartPackage','promotionsService','alcoholCartPromotion', 
			'alcoholCartGiftCard', 'alcoholCartGift', 
			'alcoholCartSale', 'alcoholCartCreditCard','UserService'
	,function ($log, $rootScope, $window, $document, $http, $state, $q, $mdToast, $mdDialog, $filter, 
			$timeout, $interval, $cookies, appConfig, sweetAlert, 
			alcoholCartItem, alcoholCartLoyaltyItem, 
			alcoholCartPackage, promotionsService, alcoholCartPromotion, 
			alcoholCartGiftCard, alcoholCartGift,
			alcoholCartSale, alcoholCartCreditCard, UserService) {

	var _self = this;
	
	this.expressDisable = false;
	this.deliveryApplicable = true;
	this.productsStats = {};
	this.highestShortLapsed = 0;

	this.init = function(){
		
		this.$cart = {
			
			products : {},
			sales : [],
			loyalty : {},
			loyaltyCards : {},
			packages : [],
			promotions :[],
			nonchilled : false,
			delivery : {

				type : 1,
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
			}

		};
		this.$coupon = {
			couponInput:true,
			couponOutput:false,
			applied:false,
			message:"",
			coupon : ""
		};
		this.$validations = {

			"cart": {

				'workingHrs':{
					status:false,
					message:"1 Hr delivery is not allowed"
				}

			},
			"address": {

				'allowed':{
					status:true,
					message:"unable to deliver on selected address"
				}

			}

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
			"type":"product"
		})
		.error(function(data, status, headers) {

			defer.reject(data);

		})
		.success(function(response) {

			var resProduct = response.product;
			var sales = response.sales;
			var proRemaining = response.proRemaining;

			if(inCart){

				if(resProduct.quantity==0){

					_self.removeItemById(id);

				}else{

					inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
					inCart.setTQuantity(resProduct.remainingQty);
					inCart.setRemainingQty(resProduct.remainingQty);
					inCart.setPrice(resProduct);

				}									

			}else{				
				
	    		var newItem = new alcoholCartItem(id, resProduct);
				_self.$cart.products[id] = newItem;
				
			}

			_self.setAllProductsRemainingQty(proRemaining);
			_self.setAllSales(sales);
			

			if(resProduct.product.change!==0){

				if(resProduct.product.change>0){
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Items added to cart",quantity:Math.abs(resProduct.product.change)});
				}else{
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Items removed from cart",quantity:Math.abs(resProduct.product.change)});
				}
				
			}

			_self.validateContainerGift();

			defer.resolve(response);

		});

		return defer.promise;

	};

	this.setAllProductsRemainingQty = function(data){
		_self = this;
		angular.forEach(data, function (value,key) {

			var p = _self.getProductById(key);

			if(p!==false){
				p.setRemainingQty(value);
			}

		})
	}

	this.setAllSales = function (sales) {

		var _self = this;
		_self.$cart.sales = [];
		angular.forEach(sales, function (sale,index) {

			var id = sale._id.$id;

			var isExist = _self.getSaleById(id);

			if(isExist === false){

				var saleDetail = "";

				angular.forEach(sale.products, function(sPro){

					var temp = _self.getProductById(sPro._id);
					
					sPro.product = {
						name : temp.product.name,
						slug : temp.product.slug,
						chilled : temp.product.chilled,
						price : temp.unitPrice,
						image : $filter('getProductThumb')(temp.product.imageFiles)
					}

					saleDetail = temp.sale;
				});
				
				angular.forEach(sale.action, function(sPro){

					var temp = _self.getProductById(sPro._id);

					sPro.product = {
						name : temp.product.name,
						slug : temp.product.slug,
						chilled : temp.product.chilled,
						price : temp.unitPrice,
						image : $filter('getProductThumb')(temp.product.imageFiles)
					}

				});	

				var newSale = new alcoholCartSale(sale,saleDetail);
				_self.$cart.sales.push(newSale);

			}else{

			}


		});

		this.resetProductsPrice();

	}

	this.resetProductsPrice = function (){

		var products = this.getProducts();
		angular.forEach(products, function(product, key) {
			product.setPrice();
		});

	}

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
			}).error(function(data, status, headers) {

			defer.reject(data);

		}).success(function(response) {

			var resProduct = response.product;

			if(inCart){

				if(resProduct.quantity==0){

					_self.removeLoyaltyProductById(id);

				}else{

					inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
					inCart.setTQuantity(resProduct.quantity);
					inCart.setPrice(resProduct.product);

				}

			}else{
				
				var newItem = new alcoholCartLoyaltyItem(id,resProduct);
				_self.$cart.loyalty[id] = newItem;

			}

			if(response.change!==0){

				if(response.change>0){

					$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty product added to cart",quantity:Math.abs(response.change)});

				}else{

					if(response.change==0){

						$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty product updated"});

					}else{

						$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty product removed from cart",quantity:Math.abs(response.change)});

					}

					

				}
			}

			defer.resolve(response);

		});

		return defer.promise
	};	

	this.getApplicablePostalCodes = function(){
		return this.getCart().applicablePostalCodes || [];
	};

	this.addCreditCertificate = function(id, quantity){

		var defer = $q.defer();
		var _self = this;

		var deliveryKey = _self.getCartKey();

		$http.put("/cart/loyalty/credit/"+deliveryKey, {
				"id":parseInt(id),
				"quantity":parseInt(quantity)
		}).then(

			function(response){

				var resProduct = response.data.card;
				var inCart =  _self.getLoyaltyCardByValue(id);

				if(inCart){

					if(resProduct.quantity==0){

						_self.removeItemById(id);

					}else{

						inCart.setQuantity(resProduct.quantity);
						inCart.setPoints(resProduct.points);

					}

				}else{
					
					var newItem = new alcoholCartCreditCard(id,resProduct);
					_self.$cart.loyaltyCards[id] = newItem;

				}


				if(response.data.change>0){

					$rootScope.$broadcast('alcoholCart:updated',{msg:"CreditCard added to cart",quantity:Math.abs(response.data.change)});

				}else{

					$rootScope.$broadcast('alcoholCart:updated',{msg:"CreditCard removed from cart",quantity:Math.abs(response.data.change)});

				}
							
				defer.resolve(response);

			},
			function(errRes){
				

				$rootScope.$broadcast('alcoholCart:notify',errRes.data.message);
				defer.reject({quantity:errRes.data.quantity});

			}
		)

		return defer.promise;

	}

	this.addBulk = function(products){

		var defer = $q.defer();
		var cartKey = this.getCartKey();
		var _self = this;

		$http.put('cart/bulk/'+cartKey,products)
				.success(function(response){

					var sales = response.sales;

					angular.forEach(response.products, function (resProduct, index) {
						
						var id = mongoIdToStr(resProduct.product._id);

						var inCart = _self.getProductById(id);

						if(inCart){

							if(resProduct.quantity==0){

								_self.removeItemById(id);

							}else{

								inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
								inCart.setTQuantity(resProduct.remainingQty);
								inCart.setRemainingQty(resProduct.remainingQty);
								inCart.setPrice(resProduct);

							}									

						}else{				
							
				    		var newItem = new alcoholCartItem(id, resProduct);
							_self.$cart.products[id] = newItem;
							
						}

					});

					//_self.setAllProductsRemainingQty(proRemaining);
					_self.setAllSales(sales);

					defer.resolve("added success fully");

				})
				.error(function(data, status, headers){

					defer.reject("something went wrong");

				})

		return defer.promise;
		
	};

	this.repeatLastOrder = function(){

		var defer = $q.defer();
		var _self = this;

		$http.post('cart/repeatlast', {cartKey: _self.getCartKey()})
				.success(function(response){

					var sales = response.sales;

					angular.forEach(response.products, function (resProduct, index) {
						
						var id = mongoIdToStr(resProduct.product._id);

						var inCart = _self.getProductById(id);

						if(inCart){

							if(resProduct.quantity==0){

								_self.removeItemById(id);

							}else{

								inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
								inCart.setTQuantity(resProduct.remainingQty);
								inCart.setRemainingQty(resProduct.remainingQty);
								inCart.setPrice(resProduct);

							}									

						}else{				
							
				    		var newItem = new alcoholCartItem(id, resProduct);
							_self.$cart.products[id] = newItem;
							
						}

					});

					//_self.setAllProductsRemainingQty(proRemaining);
					_self.setAllSales(sales);

					defer.resolve("added success fully");

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
				"products":products,
				"quantity" : parseInt(detail.packageQuantity),
				"price" : parseFloat(detail.packagePrice),
				"savings" : parseFloat(detail.packageSavings)

		}).error(function(data, status, headers) {

			$rootScope.$broadcast('alcoholCart:updated',{msg:"Something went wrong"});

		}).success(function(response) {			
			
			var inCart = _self.getPackageByUniqueId(response.key);

			detail.products = products;

			var newPackage = new alcoholCartPackage(id, response.key, detail);

	    	_self.$cart.packages.push(newPackage);

	    	$rootScope.$broadcast('alcoholCart:updated',{msg:"Package added to cart",quantity:detail.packageQuantity});
	    	
			d.resolve(response);
			
		});

		return d.promise;		

	};

	this.updatePackage = function(uid, detail){

		var _self = this;

		var deliveryKey = _self.getCartKey();
		
		var defer = $q.defer();

		var products = [];

		var data = {};

		var proInCart = this.getPackageByUniqueId(uid);

		if(detail){

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

			data = {

				"products":products,
				"quantity" : parseInt(detail.packageQuantity),
				"price" : parseFloat(detail.packagePrice),
				"savings" : parseFloat(detail.packageSavings)
			}

		}
		else{

			data = {
				"quantity" : parseInt(proInCart._quantity)
			}

		}


		if(data.quantity<1){

			this.removePackage(uid,true).then(

				function(response){

					defer.resolve(response);

				},
				function(errorRes){

					defer.reject(errorRes);

				}
			)

		}else{

			$http.put("/cart/package/"+uid+'/'+deliveryKey, data).error(function(data, status, headers) {

				$rootScope.$broadcast('alcoholCart:updated',{msg:"Something went wrong"});
				defer.reject(data);

			}).success(function(response) {

				var oldQtyt = proInCart.getOldQuantity();
				var changeInQty = data.quantity - oldQtyt;

				proInCart.setQuantity(data.quantity);

				if(detail){
					console.log(data);
					proInCart.setProducts(data.products);
					proInCart.setSaving(data.saving);
					proInCart.setPrice(data.price);
					proInCart.setOriginal(detail);
					proInCart.setPackageItems();


		    		$rootScope.$broadcast('alcoholCart:updated',{msg:"Package Updated"});

				}else{
					//proInCart.setSaving();
					proInCart.setPrice();

					if(changeInQty>0){

						$rootScope.$broadcast('alcoholCart:updated',{msg:"Package(s) added to cart",quantity:Math.abs(changeInQty)});

					}else{

						$rootScope.$broadcast('alcoholCart:updated',{msg:"Package(s) removed from cart",quantity:Math.abs(changeInQty)});
					}

				}	

				defer.resolve(response);
				
			});

		}

		

		return defer.promise;		

	}

	this.addPromo = function(promoId,productId,chilled,$event){

		var _self = this;	

		var deliveryKey = _self.getCartKey();
		
		var d = $q.defer();

		if(!this.isEligibleForPromotion(promoId)){

			$mdToast.show({
				/*controller:function($scope){},*/
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
				"chilled":chilled
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

					var oPromotion = new alcoholCartPromotion(isExist.promotion,isExist.product,chilled);
					_self.$cart.promotions.push(oPromotion);

					_self.setPromotionsInCart();


					$timeout(function() {

						var ele = $("#promo-"+oPromotion._price);
						$('html, body').stop().animate({
							scrollTop: ele.offset().top - 200
						}, 1000,

						function(){
							$(ele).pulsate({
								color: "#b21aff",
								repeat: 3,
								glow: true
							});
						});



					},200);

					

					$rootScope.$broadcast('alcoholCart:notify',"Promotion added to cart",2000);

				}							

				d.resolve(response);

			}
		});

		return d.promise;

	};

	this.resetAsPerRule = function(){

		if(this.isAnyGiftPackagingInCart()){
			this.disableExpressDelivery(true);
		}else{
			this.disableExpressDelivery(false);
		}

		this.setDeliveryApplicable();

	}

	this.isAnyGiftPackagingInCart = function(){
		
		var gifts = this.getGifts();
		
		for(i=0;i<gifts.length;i++){

			var gift = gifts[i];		
			if(gift.isContainer()===true){
				return true;
			}

		}

		return false;

	}

	this.isPhysicalProductExist = function(){

		var pros = this.getProductsCountInCart();

		var isExist = Object.keys(pros).length;

		if(isExist>0){
			return true;		
		}else{
			var packages = this.getPackages();
			if(packages.length>0){
				return true;
			}
		}
		return false

	}

	this.isEligibleForPromotion = function(promoId){

		var cartSubTotal = this.getSubTotal();
		var isEligible = promotionsService.isEligible(promoId,cartSubTotal);

		return isEligible;

	}

	this.validateContainerGift = function(){

		var cGifts = this.getGifts();
		var proInCartCount = this.getProductsCountInCart();
		
		angular.forEach(cGifts,function(cGift,i){

			angular.forEach(cGift.products,function(product,index){

				var key = product.getId();
				
				if(typeof proInCartCount[key] !== 'undefined'){

					var qtyInCart = proInCartCount[key];
					var qtyInGift = product.getQuantity();

					if(qtyInCart > 0){

						if(qtyInCart<qtyInGift){							
							product.setQuantity(qtyInCart);
						}
						proInCartCount[key]-=qtyInGift;


						return;

					}

				}

				cGifts[i].products.splice(index, 1)[0]

			})

			if(typeof cGifts[i].products!=="undefined" && cGifts[i].products.length<1){
				cGifts.splice(i, 1)[0]
			}

		})

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

		this.getSaleById = function(saleId){
			
			var sales = this.getCart().sales;
			var build = false;

			angular.forEach(sales, function (sale) {
				if  (sale._id.$id === saleId) {
					build = sale;
				}
			});
			return build;

		}

		this.isEligibleNonChilled = function(){

			var products = this.getProducts();
			// var packages = this.getPackages();
			// var promotions = this.getPromotions();
			var isEligible = false;
			angular.forEach(products, function (item,key) {
				if(item.getChilledAllowed()){
					
					isEligible = true;
					return false;
				}
				if(isEligible)
					return false;

			});

			if(!isEligible)
			this.$cart.nonchilled = false;
			return isEligible;
			
		}
		this.getProductInCartById = function(productId){

			var products = this.getProducts();
			var promotions = this.getPromotions();
			var loyalty = this.getLoyaltyProducts();
			var packages = this.getPackages();

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
				build = loyalty[productId];
			}
			
			if(build!==false){return build;}

			angular.forEach(packages, function(package, key) {
				
				angular.forEach(package._products, function(product, key) {

					if(product._id == productId){
						build = {product:product};
					}

				})	

			});

			if(build!==false){return build;}

		}


		this.getProductsCountInCart = function(){

			var products = this.getProducts();
			var promotions = this.getPromotions();
			var loyalty = this.getLoyaltyProducts();
			var packages = this.getPackages();

			var prosInCart = {};

			angular.forEach(products, function(product, key) {
				prosInCart[key] = product.getQuantity();
			});

			angular.forEach(promotions, function(promotion) {
				var key = promotion._id;
				if(typeof prosInCart[key] === 'undefined'){

					prosInCart[key] = 1;

				}else{

					prosInCart[key]++;

				}

			});

			
			angular.forEach(loyalty, function(product, key) {

				if(typeof prosInCart[key] === 'undefined'){

					prosInCart[key] = product.getQuantity();

				}else{

					prosInCart[key] = parseInt(prosInCart[key]) + parseInt(product.getQuantity());

				}
			});


			angular.forEach(packages, function(package) {

				var packageQty = package.getQuantity();

				angular.forEach(package._products, function(product) {

					var proQty = packageQty * product.quantity;
					var key = product._id;

					if(typeof prosInCart[key] === 'undefined'){

						prosInCart[key] = proQty;

					}else{

						prosInCart[key] = parseInt(prosInCart[key]) + parseInt(proQty);

					}

				})

			});
			
			return prosInCart;

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

		this.getLoyaltyCardByValue = function(value){

			var loyaltyCards = this.getCart().loyaltyCards || [];
			var build = false;
			
			angular.forEach(loyaltyCards, function (creditCard) {
				
				if (creditCard.getValue() == value) {
					build = creditCard;
				}
			});
			return build;

		};

		this.getLoyaltyProductById = function (productId){

			if(angular.isDefined(productId.$id)){ productId = productId.$id}

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

			var isEligible = this.isEligibleNonChilled();
			
			if(!isEligible){

				sweetAlert.swal({
								type:'warning',
								title: "There are no chilled items in your cart.",
								text : "Chilled items are usually beers, champagnes and white wines",
								customClass: 'swal-wide',
								timer: 4000,
								showConfirmButton:false,
							});				

				return false;
			}

			if(typeof status !=="undefined"){

				this.$cart.nonchilled = status;
				this.$cart.discount.nonchilled.status = status;				
			}

			this.deployCart().then(
				function(res){

					if(!status){
						$rootScope.$broadcast('alcoholCart:notify',"Non-Chilled condition deactivated");
					}else{
						$rootScope.$broadcast('alcoholCart:notify',"Non-Chilled condition activated");
					}

				}
			);
		
		}

		// this.setDiscount = function(){

		// 	var discount = 0;

		// 	this.isEligibleNonChilled();

		// 	if(this.$cart.nonchilled){

		// 		discount += parseFloat(this.$cart.discount.nonchilled.exemption);

		// 	}

		// 	if(this.$cart.credits){

		// 		discount += parseFloat(this.$cart.discount.credits);

		// 	}

		// 	return +parseFloat(discount).toFixed(2);

		// }	

		this.getDiscount = function(type){

			var discount = 0, nonChilledDiscount = 0;

			this.isEligibleNonChilled();

			if(angular.isDefined(type)){

				if(type==='nonchilled' && this.$cart.nonchilled){

					nonChilledDiscount = parseFloat(this.$cart.discount.nonchilled.exemption);

					discount+=nonChilledDiscount;

				}

			}else{

				if(this.$cart.nonchilled){

					nonChilledDiscount = parseFloat(this.$cart.discount.nonchilled.exemption);

					discount+=nonChilledDiscount;

				}

			}

			if(type==='nonchilled'){
					
				return nonChilledDiscount.toFixed(2);
			}

			if(this.$cart.credits){

				var creditsDiscount = parseFloat(this.$cart.discount.credits);
				if(type==='credits'){
					return creditsDiscount.toFixed(2);
				}

				discount+=creditsDiscount;

			}

			return +parseFloat(discount).toFixed(2);
		}

		this.setCreditDiscount = function(discountVal){
			this.$cart.credits = discountVal;
			this.$cart.discount.credits = discountVal;
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

		this.getSales = function(){
			return this.getCart().sales  || [];
		}	

		this.getLoyaltyProducts = function(){
			return this.getCart().loyalty || {};
		};

		this.getLoyaltyCreditCertificates = function(){
			return this.getCart().loyaltyCards || {};
		}

		this.getLoyaltyCards = function(){
			return this.getCart().loyaltyCards;
		};

		this.getLoyaltyPointsInCart = function(){

			var lp = this.getLoyaltyProducts();
			var lCC = this.getLoyaltyCreditCertificates();
			var points = 0;

			angular.forEach(lp, function(product,key){
				points = points + parseInt(product.loyaltyValue.point);
			});

			angular.forEach(lCC, function(product,key){
				points = points + product.getLoyaltyPoints();
			});

			return parseInt(points);

		}

		this.setLoyaltyPointsInCart = function(){

			var pointsUsedInCart = this.getLoyaltyPointsInCart();

			var pointsInUserAccount = parseInt(UserService.currentUser.loyaltyPoints);

			this.availableLoyaltyPoints = pointsInUserAccount - pointsUsedInCart;

			return this.availableLoyaltyPoints;
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

			count = 0;

			angular.forEach(cart.products, function (product) {
				if(product.getQuantity()>0){
					count++;
				}
			});

			count+= Object.keys(cart.sales).length;

			count+= Object.keys(cart.loyalty).length;

			count+= cart.packages.length;

			count+= cart.gifts.length;

			count+= cart.giftCards.length;

			count+= Object.keys(cart.loyaltyCards).length;

			return count;
		};

		this.setSubTotal =function(){
			
			var total = 0;
			var cart = this.getCart();

			angular.forEach(cart.products, function (product) {

				if(product.getQuantity()>0){
					total += parseFloat(product.getRemainQtyPrice());
				}
			});

			angular.forEach(this.getLoyaltyProducts(), function (product) {

				total += (parseFloat(product.loyaltyValue.price)).toFixed(2);

			});

			angular.forEach(cart.packages, function (package) {
				total += parseFloat(package.getTotal());
			});		

			
			angular.forEach(cart.giftCards, function (giftCard) {
				total += parseFloat(giftCard.getPrice());
			});
			
			angular.forEach(cart.gifts, function (gifts) {
				total += parseFloat(gifts.gsPrice());
			});
			
			promotionsService.setEligibility(total);			

			angular.forEach(cart.sales, function (sale) {
				total += parseFloat(sale.getPrice());
			});

			if(typeof this.nonEligiblePromotionsCheck!=="undefined"){
				$timeout.cancel(this.nonEligiblePromotionsCheck);
			}
			
			var totalWithoutPromotion = total;

			this.nonEligiblePromotionsCheck = $timeout(function() {

				_self.removeNonEligiblePromotions(totalWithoutPromotion);
				_self.resetAsPerRule();

			}, 250, false);

			angular.forEach(cart.promotions, function (promotion) {
				total += parseFloat(promotion.getPrice());
			});

			if(_self.$coupon.applied == true){
				_self.setCouponPrice(_self.$coupon.coupon,total);
			}

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

			cartTotal-= parseFloat(this.getDiscount('nonchilled'));			

			cartTotal-= parseFloat(this.getCouponDiscount());

			var service = this.$cart.service;
			var _self = this;
			
			_self.$cart.otherCharges = {};

			this.$cart.payment.totalWithoutSur = cartTotal;

			if(this.$cart.service.tempsurcharge && this.$cart.delivery.type==0 && angular.isDefined(service.surcharge)){

				if(angular.isDefined(service.surcharge.holiday)) {

					if(angular.isDefined(service.surcharge.holiday.value) && service.surcharge.holiday.value>0) {

						var amt = 0;
						if(service.surcharge.holiday.type==1){
							amt = (cartTotal * service.surcharge.holiday.value)/100;
						}else{
							amt = service.surcharge.holiday.value;
						}


						_self.$cart.otherCharges = {
							"label" : service.surcharge.holiday.label,
							"value" : amt.toFixed(2),
						}
						cartTotal = cartTotal + amt.toFixed(2)
						//charges.push(currCharge);

					}

				}

			}
			
			cartTotal-= parseFloat(this.getDiscount('credits'));

			


			return parseFloat(cartTotal).toFixed(2);

		};

		this.getCartTotalExceptCoupon = function(){

			var cartTotal = 0;

			cartTotal+= parseFloat(this.getSubTotal());

			cartTotal+= parseFloat(this.getAllServicesCharges());

			cartTotal+= parseFloat(this.getDeliveryCharges());

			cartTotal-= parseFloat(this.getDiscount());

			return parseFloat(cartTotal).toFixed(2);

		}

		this.getCartTotal = function(){

			var cartTotal = this.setCartTotal();
			this.$cart.payment.total = cartTotal;
			return cartTotal;

		};

		this.setSurcharges = function () {

			var service = this.$cart.service;
			var charges = false;

			var cartTotal = this.setCartTotal();

			if(angular.isDefined(service.surcharge)){

				if(angular.isDefined(service.surcharge.holiday)) {

					if(angular.isDefined(service.surcharge.holiday.value) && service.surcharge.holiday.value>0) {

						var amt = 0;
						if(service.surcharge.holiday.type==1){
							amt = (cartTotal * service.surcharge.holiday.value)/100;
						}else{
							amt = service.surcharge.holiday.value;
						}

						charges = {
							"label" : service.surcharge.holiday.label,
							"value" : amt.toFixed(2),
						}
						
						//charges.push(currCharge);

					}

				}

			}

			if(charges!==false){
				cartTotal+= charges.value;
			}



			return {'charges':charges,'cartTotal':cartTotal};
		}

		this.getSurcharges = function () {
			return this.setSurcharges();
		}

		this.getCartTotalWithSurcharges = function () {

			//var cartTotal = this.setCartTotal();
			var surcharges = this.getSurcharges();

			// angular.forEach(surcharges,function (charge) {
			// 	cartTotal+= charge.value;
			// })
			
			return surcharges.cartTotal;

		}

		this.getDelivery = function(){
			return this.$cart.service.delivery;
		}

		this.isDeliveryAdvance = function () {

			return this.$cart.delivery.type==1;

		}

		this.getRemainToFreeDelivery = function(type){

			var delivery = this.getDelivery();

			var subTotal = parseFloat(this.getSubTotal());

			if(subTotal>=parseFloat(delivery.mincart)){
				this.remainToFreeDelivery = 0;
				this.remainToFreeDeliveryPer = 100;
			}else{
				this.remainToFreeDelivery = delivery.mincart - subTotal;
				this.remainToFreeDeliveryPer = subTotal*100/delivery.mincart;
			}

			if(type=='percentage'){

				return this.remainToFreeDeliveryPer.toFixed(2);

			}
			return this.remainToFreeDelivery.toFixed(2);
		}

		this.setDeliveryCharges =function(){
			
			var delivery = this.getDelivery();

			var subTotal = parseFloat(this.getSubTotal());

			if(!this.deliveryApplicable || subTotal>=parseFloat(delivery.mincart)){
				
				delivery.free = true;
				this.$cart.delivery.charges = 0;				

			}else{

				delivery.free = false;
				this.$cart.delivery.charges = parseFloat(delivery.charges).toFixed(2);				

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


		this.removeProduct = function (id,chilled) {

			var defer = $q.defer();
			var deliveryKey = this.getCartKey();
			var _self = this;

			$http.delete("cart/product/"+deliveryKey+'/'+id+'/'+chilled).then(

				function(response){

					response = response.data;

					var inCart = _self.getProductById(id);

					if(response.removeCode==200){

						var resProduct = response.product;

						inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
						inCart.setTQuantity(resProduct.quantity);
						inCart.setRemainingQty(resProduct.remainingQty);

						inCart.setPrice();

					}else{
						_self.removeItemById(id);
					}

					if(response.change>0){
						
						$rootScope.$broadcast('alcoholCart:updated',{msg:"Items removed from cart",quantity:Math.abs(response.change)});
						
					}

					if(typeof(_self.$cart.couponData) !== "undefined"){
						_self.setCouponPrice(_self.$cart.couponData);
					}
					_self.validateContainerGift();

					defer.resolve(response);

				},
				function(errorRes){

					defer.reject(errorRes);

				}
			);

			return defer.promise;		
			
		};

		this.removeItemById = function (id,notify) {

			var item;
			var cart = this.getCart();
			angular.forEach(cart.products, function (product, index) {
				if(index === id) {

					delete cart.products[index];
					item = product || {};

				}
			});

			var showNotification = notify || true;

			if(showNotification){
				$rootScope.$broadcast('alcoholCart:itemRemoved', item);
			}
			
		};

		this.removeLoyaltyProductById = function (id,notify) {

			var item;
			var lProducts = this.getLoyaltyProducts();
			var cart = this.getCart();

			angular.forEach(lProducts, function (lProduct, index) {
				if(index === id) {

					delete cart.loyalty[index];
					item = lProduct || {};

				}
			});

			var showNotification = true;

			if(angular.isDefined(notify) && notify===false)
			showNotification = false;

			if(showNotification){
				//$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty product removed from cart"});
			}
			
		};

		this.removeLoyaltyCardByValue = function (id,notify) {

			var item;
			var lCards = this.getLoyaltyCards();
			var cart = this.getCart();

			angular.forEach(lCards, function (lCard, value) {
				if(value === id) {

					delete cart.loyaltyCards[value];
					item = lCard || {};

				}
			});

			var showNotification = true;

			if(angular.isDefined(notify) && notify===false)
			showNotification = false;

			if(showNotification){
				$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty card removed from cart"});
			}
			
		};

		this.removePackage = function (id,fromServerSide) {

			var defer = $q.defer();
			var locPackage;
			var cart = this.getCart();
			var deliveryKey = this.getCartKey();
			var _self = this;

			$http.delete("cart/package/"+id+'/'+deliveryKey).then(

				function(response){

					angular.forEach(cart.packages, function (package, index) {

						if(package.getUniqueId() === id) {

							var locPackage = cart.packages.splice(index, 1)[0] || {};

							$rootScope.$broadcast('alcoholCart:updated',{msg:"Package Removed from cart",quantity:1});

						}

					});	

					defer.resolve(response);

				},
				function(errorRes){

					defer.reject(errorRes);

				}

			);
		
			return defer.promise;					
			
		};

		this.removeLoyaltyProduct = function (id,chilled) {

			var defer = $q.defer();
			var deliveryKey = this.getCartKey();
			var _self = this;

			$http.delete("cart/loyalty/"+deliveryKey+'/'+id+'/'+chilled).then(

				function(response){

					response = response.data;

					var inCart = _self.getLoyaltyProductById(id);

					var qtyChilled = inCart.getRQuantity('chilled');
					var qtyNonChilled = inCart.getRQuantity('nonchilled');
					var qtyBefore = qtyChilled+qtyNonChilled;

					if(chilled){
						qtyChilled = 0;
					}else{
						qtyNonChilled = 0;
					}

					var qtyAfter = qtyChilled+qtyNonChilled;
					
					if(qtyAfter>0){
						inCart.setRQuantity(qtyChilled,qtyNonChilled);
						inCart.setTQuantity(qtyAfter);
					}else{
						var diff = qtyBefore - qtyAfter;
						_self.removeLoyaltyProductById(id,false);

						$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty product removed from cart",quantity:Math.abs(diff)});
					}
										
					_self.validateContainerGift();

					defer.resolve(response);

				},
				function(errorRes){

					defer.reject(errorRes);

				}
			);

			return defer.promise;		
			
		};

		this.removeLoyaltyCard = function (id) {

			var defer = $q.defer();
			var deliveryKey = this.getCartKey();
			var _self = this;

			$http.delete("cart/loyaltycard/"+deliveryKey+'/'+id).then(

				function(response){					

					var inCart = _self.getLoyaltyCardByValue(id);

					_self.removeLoyaltyCardByValue(id);

					$rootScope.$broadcast('alcoholCart:updated',{msg:"Loyalty card removed from cart",quantity:Math.abs(inCart.quantity)});					

					defer.resolve(response);

				},
				function(errorRes){

					defer.reject(errorRes);

				}
			);

			return defer.promise;		
			
		};
		

		this.removeSale = function (id) {

			var defer = $q.defer();
			var locSale;			
			var cart = this.getCart();
			var deliveryKey = this.getCartKey();
			var _self = this;

			$http.delete("cart/sale/"+deliveryKey+'/'+id).then(

				function(response){
					
					response = response.data;
					
					_self.removeSaleAndSetProducts(id);

					_self.validateContainerGift();
					$rootScope.$broadcast('alcoholCart:saleRemoved', locSale);

					defer.resolve(response);

				},
				function(errorRes){

					defer.reject(errorRes);

				}
			);

			return defer.promise;		
			
		};

		this.removeSaleAndSetProducts = function(id){
			
			var item;
			var cart = this.getCart();
			var _self = this;

			angular.forEach(cart.sales, function (sale, index) {

				if(sale.getId().$id === id) {
					 
					sale['action'] = sale['action'] || [];

					var products = [].concat(sale['products'] , sale['action'])

					var toRemove = {};

					angular.forEach(products, function(sPro){

						if(!angular.isDefined(toRemove[sPro._id])){
							toRemove[sPro._id] = 0;
						}

						toRemove[sPro._id]+= sPro.quantity;

					});

					angular.forEach(toRemove, function( value, key ) {

						var product = _self.getProductById(key);

						var qtyChilled = parseInt(product.qChilled);
						var qtyNonChilled = parseInt(product.qNChilled);

						if(qtyChilled>value){

							qtyChilled-=value;
							value = 0;

						}else{

							value-= qtyChilled;
							qtyChilled=0;

						}

						if(value > 0){							

							if(qtyNonChilled>value){

								qtyNonChilled-=value;
								value = 0;

							}else{

								value-= qtyNonChilled;
								qtyNonChilled=0;

							}

						}

						var totalProQty = qtyChilled+qtyNonChilled;
						
						if(totalProQty<1){
							_self.removeItemById(product.getId());
						}else{
							product.setRQuantity(qtyChilled,qtyNonChilled);
						}

					});

					var locPackage = cart.sales.splice(index, 1)[0] || {};
					item = sale || {};

				}

			});			

			$rootScope.$broadcast('alcoholCart:updated',{msg:"Sale Removed from cart"});
			
		}

		this.removePromotion = function (id) {

			var locPromotion;
			var cart = this.getCart();
			var _self = this;
			var d = $q.defer();
			var deliveryKey = this.getCartKey();

			angular.forEach(cart.promotions, function (promotion, index) {

				if(promotion._id === id) {

					$http.delete("cart/promotion/"+deliveryKey+"/"+id).then(

						function(successRes){

							var locPromotion = cart.promotions.splice(index, 1)[0] || {};

							$rootScope.$broadcast('alcoholCart:notify',"Promotion removed from cart");

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

					_self.removePromotion(promotion._id).then(
						
						// function(successRes){							
						// 	promotions.splice(key, 1)[0] || {};
						// },
						// function(errorRes){
						// 	console.log("okok");
						// }

					);					

				}
				
			});

		}

		this.reSet = function () {
			$state.go("mainLayout.checkout.cart", {}, {reload: true});
		}

		this.getSmokeStatus = function(){

			try {
				return this.$cart.service.smoke.status;
			}
			catch ( e ) {
				this.reSet();
			}

		}

		this.getSmokeDetail = function(){

			try {

				if(!this.$cart.service.smoke.detail){
					return false;
				}
				return this.$cart.service.smoke.detail;
			}
			catch ( e ) {
				this.reSet();
			}


		}


		this.setSmokeStatus = function(status){

			var _self = this;
			var status = Boolean(status);

			if(typeof status !=="undefined"){
				
				_self.$cart.service.smoke.status = status;
				if(!status){
					_self.removeSmoke();
				}				
			}

			this.toggleSmokeAndExpress("smoke").then(
				function (successRes) {
					_self.deployCart();
				},
				function (errorRes) {

				}
			)

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
				$rootScope.$broadcast('alcoholCart:updated',{msg:"Smoke added to cart"});
			}

			this.deployCart();

		}

		this.removeSmoke = function(){

			this.$cart.service.smoke.detail = "";
			
			$rootScope.$broadcast('alcoholCart:updated',{msg:"Smoke removed from cart"});

			this.deployCart();
		}

		this.empty = function () {

			this.$cart.products = {};
			//$window.localStorage.removeItem('deliverykey');
			$cookies.remove('deliverykey');
		};
		
		this.isEmpty = function () {
			
			return (this.getTotalUniqueItems() > 0 ? false : true);

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

		this.disableExpressDelivery = function(status){

			if(typeof status !== "boolean"){
				status = true;
			}

			if(status){
				this.$cart.service.express.status = false;
			}

			this.expressDisable = status;

		}

		this.setDeliveryApplicable = function () {
			
			if(this.isPhysicalProductExist()){
				this.deliveryApplicable = true;
			}else{
				this.deliveryApplicable = false;
			}

		}
		
		this.getDeliveryType = function () {
			return this.$cart.delivery.type;
		}

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

		// this.checkAvailability = function(){

		// 	var d = $q.defer();

		// 	$http.get("cart/availability/"+cartKey,{

		// 	}).error(function(data, status, headers) {

		// 		d.reject(data);

		// 	}).success(function(response) {

		// 		d.resolve(response);

		// 	});

		// 	return d.promise;

		// }

		this.setExpressStatus = function(status){
			var _self = this;
			if(typeof status !=="undefined"){
				_self.$cart.service.express.status = status;
			}
			this.toggleSmokeAndExpress("express").then(
				function (successRes) {
					_self.deployCart();
				},
				function (errorRes) {

				}
			)			
		}

		this.toggleSmokeAndExpress = function (currentSetFor) {

			var _self = this;
			return $q(function (resolve,reject) {
				
				if(_self.getExpressStatus() && _self.getSmokeStatus()){

					sweetAlert.swal({
					
						type:'warning',
						title: "Cigarette service is not available for Express Delivery. Would you like to proceed?",
						showCancelButton: true,
						confirmButtonText: "Yes, proceed!",
						cancelButtonText: "No, cancel",

					}).then(

						function (response) {

							var msg = "Smoke removed";
							if(currentSetFor==='express'){
								_self.setSmokeStatus(false);
							}else{
								_self.setExpressStatus(false);
								msg = "Express Delivery disabled";
							}

							sweetAlert.swal({
							
								type:'success',
								title: msg,
								timer: 2000,
								showConfirmButton: false
							}).done()

							resolve();
						},
						function (error) {

							if(currentSetFor==='express'){
								_self.setExpressStatus(false);
							}else{
								_self.setSmokeStatus(false);
							}
							reject();
						}
					);

				}

				resolve();

			})

		}

		this.getExpressStatus = function(){
			return this.$cart.service.express.status;
		}

		this.updateChilledStatus = function(id,type){
			
			if(this.$cart.nonchilled)return false; // unable to change product chilled status if whole cart set as nonchilled

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

		this.loyaltyChilledStatus = function(id,type){
			
			if(this.$cart.nonchilled)return false; // unable to change product chilled status if whole cart set as nonchilled

			var product = this.getLoyaltyProductById(id);

			product[type+'Status'] = !product[type+'Status'];
						
			var deliveryKey = this.getCartKey();

			$http.put("/cart/chilled/loyalty/"+deliveryKey, {
					"id":id,
					"chilled":product.qChilledStatus,
					"nonchilled":product.qNChilledStatus
				},{

			}).error(function(data, status, headers) {

			}).success(function(response) {

			});

		}

		this.promoChilledStatus = function(id){
			
			if(this.$cart.nonchilled)return false; // unable to change product chilled status if whole cart set as nonchilled

			var promo = this.getPromotionById(id);

			promo.chilled = !promo.chilled;
						
			var deliveryKey = this.getCartKey();

			$http.put("/cart/promoChilledStatus/"+deliveryKey, {
					"id":id,
					"chilled":promo.chilled,
				},{

			}).error(function(data, status, headers) {

			}).success(function(response) {

			});

		}

		this.saleChilled = function(saleObj){
			
			if(this.$cart.nonchilled)return false; // unable to change product chilled status if whole cart set as nonchilled

			var saleId = saleObj.getId();
			saleId = saleId.$id;

			saleObj.chilled = !saleObj.chilled;

			var chilled = saleObj.chilled;
			var deliveryKey = this.getCartKey();

			$http.put("cart/sale/chilled/"+deliveryKey, {
					"id":saleId,
					"chilled":chilled,					
				},{

			}).error(function(data, status, headers) {

			}).success(function(response) {

			});

		}

		this.isProductInGift = function(id){

			var gifts = this.getGifts();
			var build = false;
			
			angular.forEach(gifts, function (gift) {

				angular.forEach(gift.products, function (product) {

					var giftProId = product.getId();

					if(giftProId === id){

						if(build===false){build = {quantity:0}}

						build.quantity = build.quantity + product.getQuantity();
					}

				});

			});
			return build;

		}

		this.addGiftCard = function(giftData){

			var isFound = this.getGiftCardByUniqueId(giftData._uid);

			if(isFound===false){				

				var giftCard = new alcoholCartGiftCard(giftData);
				this.$cart.giftCards.push(giftCard);

				$rootScope.$broadcast('alcoholCart:updated',{msg:"Gift certificate added to cart",quantity:giftCard.recipient.quantity});

			}else{

				$rootScope.$broadcast('alcoholCart:updated',{msg:"Gift certificate Updated Successfully",quantity:giftCard.recipient.quantity});

			}


		};

		this.removeCard = function (id,fromServerSide) {

			var locPackage;
			var cart = this.getCart();
			var cartKey = this.getCartKey();
			var d = $q.defer();

			angular.forEach(cart.giftCards, function (giftcard, index) {

				if(giftcard.getUniqueId() === id) {

					if(typeof fromServerSide !== 'undefined' && fromServerSide){

						$http.delete("cart/card/"+cartKey+'/'+id).then(

							function(successRes){
								
								var locCard = cart.giftCards.splice(index, 1)[0] || {};

								$rootScope.$broadcast('alcoholCart:cardRemoved', "GiftCard removed from cart");
								
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
			var _self = this;
			
			var d = $q.defer();

			angular.forEach(cart.gifts, function (gift, index) {
				
				if(gift.getUniqueId() == uid) {

					if(typeof fromServerSide !== 'undefined' && fromServerSide){

						$http.delete("cart/gift/"+uid+"/"+_self.getCartKey()).then(

							function(successRes){
								
								var locGift = cart.gifts.splice(index, 1)[0] || {};
								
								$rootScope.$broadcast('alcoholCart:updated',{msg:"Gift removed from cart",quantity:1});
								
								d.resolve(successRes);

							},
							function(errorRes){

								d.reject(errorRes);

							}

						);
					}
					else{

						var locGift = cart.gifts.splice(index, 1)[0] || {};
						d.resolve({success:true});
					}

				}	
			});
			
			// $rootScope.$broadcast('alcoholCart:itemRemoved', locCard);
			return d.promise;

		};

		this.getGiftCardByUniqueId = function(cardUniqueId){

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

		this.addGift = function(giftData,isUpdated){

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

				if(isUpdated===true){
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Gift Updated Successfully",quantity:1});
				}else{
					$rootScope.$broadcast('alcoholCart:updated',{msg:"Gift added to cart",quantity:1});
				}
				

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

			var deliverykey = $cookies.get("deliverykey");

			if(deliverykey===null || typeof deliverykey==="undefined"){
				deliverykey = $rootScope.deliverykey;
			}

			if(deliverykey===null || typeof deliverykey==="undefined"){
				return false;
			}

			return deliverykey;

		}

		
		this.setCartKey = function(cartKey){
			var now = new Date();
    		now = new Date(now.getFullYear()+1, now.getMonth(), now.getDate());
        	//localStorage.setItem("deliverykey",cartKey)
			$cookies.put("deliverykey", cartKey, {expires:now});
			$rootScope.deliverykey = cartKey;

			return cartKey;
		}

		this.$restore = function(storedCart){

			var _self = this;

			_self.init();

			var products = {};
			var loyalty = {};
			var loyaltyCards = {};
			var packages = [];
			var promotions = [];
			var giftCards = [];
			var gifts = [];
			var sales = [];

			angular.copy(storedCart.products,products);
			angular.copy(storedCart.packages,packages);
			angular.copy(storedCart.promotions,promotions);
			angular.copy(storedCart.giftCards,giftCards);
			angular.copy(storedCart.gifts,gifts);
			angular.copy(storedCart.loyalty,loyalty);
			// angular.copy(storedCart.loyaltyCards,loyaltyCards);
			angular.copy(storedCart.sales,sales);

			storedCart.products = {};
			storedCart.loyalty = {};
			storedCart.loyaltyCards = {};
			storedCart.packages = [];
			storedCart.promotions = [];
			storedCart.giftCards = [];
			storedCart.gifts = [];
			storedCart.sales = [];

			angular.merge(_self.$cart,storedCart);

			_self.setCartKey(storedCart._id);			

			angular.forEach(products, function (item,key) {

				if(typeof item !== 'object'){
					return false;
				}
				
				var newItem = new alcoholCartItem(key, item);
				if(!newItem.error)
				_self.$cart.products[key] = newItem;
				
			});

			angular.forEach(sales, function (sale,key) {

				var saleDetail = "";

				angular.forEach(sale.products, function(sPro){

					var temp = _self.getProductById(sPro._id);
					
					sPro.product = {
						name : temp.product.name,
						slug : temp.product.slug,
						chilled : temp.product.chilled,
						price : temp.unitPrice,
						image : $filter('getProductThumb')(temp.product.imageFiles)
					}

					saleDetail = temp.sale;
				});
				
				angular.forEach(sale.action, function(sPro){

					var temp = _self.getProductById(sPro._id);

					sPro.product = {
						name : temp.product.name,
						slug : temp.product.slug,
						chilled : temp.product.chilled,
						price : temp.unitPrice,
						image : $filter('getProductThumb')(temp.product.imageFiles)
					}

				});				

				var newSale = new alcoholCartSale(sale,saleDetail);
				_self.$cart.sales.push(newSale);

			});

			angular.forEach(loyalty, function (item,key) {

				if(typeof item !== 'object'){
					return false;
				}
				
				var newItem = new alcoholCartLoyaltyItem(key,item);
				_self.$cart.loyalty[key] = newItem;
				
			});			

			// angular.forEach(loyaltyCards, function (cc,key) {

			// 	if(typeof cc !== 'object'){
			// 		return false;
			// 	}
				
			// 	var newItem = new alcoholCartCreditCard(key,cc);
			// 	_self.$cart.loyaltyCards[key] = newItem;
				
			// });

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
						.textContent("Promotion bundle removed")
						.highlightAction(false)
						.position("top right");
					$mdToast.show(toast);

				}else if(isExist.product === false){

					var toast = $mdToast.simple()
						.textContent("Not Available : Promotion bundle removed")
						.highlightAction(false)
						.position("top right");
					$mdToast.show(toast);

				}else{
					
					var oPromotion = new alcoholCartPromotion(isExist.promotion,isExist.product,promotion.chilled);
					
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
			if(typeof(storedCart.couponData) !== "undefined"){
				//$rootScope.discountCode = storedCart.couponData.code;
				_self.$cart.couponData = storedCart.couponData;
				_self.setCouponPrice(storedCart.couponData);
			}
			angular.appConfig = appConfig;

			appConfig.setServerTime(storedCart.working.currentTime);
			appConfig.setWorkingTime(storedCart.working.from,storedCart.working.to);
			appConfig.setWorkingTimeString(storedCart.working.string.from,storedCart.working.string.to);

			_self.resetAsPerRule();
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
			var _self = this;
			this.deployCart().then(
				
				function(successRes){

					var deliverykey = _self.getCartKey();
					$http.get("freezcart/"+deliverykey).error(function(data, status, headers) {

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

		this.stepsName = [
			"cart",
			"address",
			"delivery",
			"payment",
			"review"
		]
		

		this.setCurrentStep = function(step){			

			var valid = false;
			angular.forEach(this.stepsName,function(value){
				if(value===step){
					valid = true;
				}
			})

			if(!valid){
				
				$log.error("Not a valid cart step");
				return false;
			}
			
			return this.step = step;

		}

		this.getCurrentStep = function (index) {

			if(this.step){

				if(index){

					return this.stepsName.indexOf(this.step);

				}
			}

			return false;
		}

		this.validate = function(step){

			var _self = this;

			var cartSteps = this.stepsName[step-1];

			isValid = _self[cartSteps+'Validate']();

			return isValid;

		}


		this.validateSmoke = function(){

			var isSmokeRequired = this.getSmokeStatus();

			if(isSmokeRequired){

				var isDeliveryAdvance = this.isDeliveryAdvance();

				if(!isDeliveryAdvance){

					sweetAlert.swal({
								type:'info',
								title: "Sorry !",
								text : "Smoke is only deliver in Scheduled delivery, Remove it or change delivery type",
								timer: 4000,
								showConfirmButton:false								
							});

					return false;
				}

				var isDetailProvided = this.getSmokeDetail();
				
				if(isDetailProvided===false){

					var ele = $("#smokedetail");
					$('html, body').stop().animate({
						scrollTop: ele.offset().top - 200
					}, 1000,

					function(){
						$(ele).pulsate({
							color: "#ffc412",
							repeat: 3,
							glow: true
						});
					});
					return false;
				}

			}

			return true;

		}

		this.checkoutValidate = function(){

			var d = $q.defer();

			var isValid = this.validateSmoke();
			
			if(this.getDeliveryType()==0){

				appConfig.isServerUnderWorkingTime(true).then(

					function(res){

						if(isValid){
							d.resolve("every thing all right");
						}else{
							d.reject("notvalid");
						}

					},function(err){
						d.reject("reload");
					}
				)

			}else{

				if(isValid){
					d.resolve("every thing all right");
				}else{
					d.reject("notvalid");
				}

			}

			return d.promise;
		}

		this.stepCheckout = function(step){
			$anchorScroll();
		}

		this.setCouponPrice = function(coupon,cartSubTotal){
			
			var _self = this;
			var cTotal = coupon.total;

			var isProductOriented = (coupon.products.length + coupon.categories.length)?true:false;
			
			cartSubTotal = angular.isDefined(cartSubTotal)?cartSubTotal:this.getSubTotal();
			var discountTotal = 0;
			var discountMessage = '';
			var couponMessage = '';
			var isApplied = false;

			if(!cTotal || (cTotal && cTotal <= cartSubTotal) ){

				if(isProductOriented){

					var productsList = _self.getProducts();

					if(Object.keys(productsList).length){

						angular.forEach(productsList, function (item) {

							var discountAmt = item.setCoupon(coupon);

							discountTotal += discountAmt.couponAmount;

							if(discountAmt.couponMessage)
								discountMessage = discountAmt.couponMessage;

						});
						
						if(!discountTotal && discountMessage)
							couponMessage = discountMessage;

						isApplied = true;

					}else{

						// if(typeof(this.$coupon.coupon) !== "undefined"){
						// 	this.removeCoupon();
						// }
					}

				}else{

					if(coupon.type==1){
						discountTotal = coupon.discount;
					}else{
						discountTotal = cartSubTotal*(coupon.discount/100);
					}

					var totalExceptCoupon = cartSubTotal;

					totalExceptCoupon+= parseFloat(this.getAllServicesCharges());

					totalExceptCoupon+= parseFloat(this.$cart.delivery.charges);

					totalExceptCoupon-= parseFloat(this.getDiscount());

					discountTotal = discountTotal>totalExceptCoupon?totalExceptCoupon:discountTotal;

					isApplied = true;

				}

			}else{
				
				couponMessage = 'Minimum amount should be '+cTotal+' to use this coupon.';
			}

			if(isApplied){

				_self.$coupon.applied = true;
				_self.$coupon.coupon = coupon;

			}

			this.setCouponMessage(couponMessage, 1);

			this.$cart.couponDiscount = discountTotal;
		}

		this.removeCoupon = function(res){
			
			var _self = this;
			var productsList = this.getProducts();

			this.$coupon.applied = false;
			this.$coupon.couponInput = true;
			this.$coupon.couponOutput = false;
			this.$cart.couponDiscount = 0;
			this.$cart.couponMessage = '';

			if(typeof(res) == "undefined"){
				this.setCouponMessage(this.$cart.couponMessage, 2);
			}

			$http.post("checkCoupon", {params: {cart: _self.getCartKey(), removeCoupon: 1}})
				.success(function(result){
					delete _self.$cart.couponData;
				}).error(function(){

				});
	
		}

		this.checkCoupon = function(discountCode, cartKey){

			var _self = this;
			var cartKey = cartKey;
			var couponCode = discountCode;
			if(!UserService.getIfUser())
				return $rootScope.$broadcast('showLogin');

			$http.post("checkCoupon", {params: {cart: cartKey, coupon: couponCode}})
				.success(function(result){
					if(result.errorCode==1 || result.errorCode==2){
						_self.$coupon.invalidCodeMsg = false;
						_self.$coupon.invalidCodeMsgTxt = result.msg;
					}else{					
						_self.setCouponPrice(result.coupon);
					}
				}).error(function(){});

		}

		this.getCouponDiscount = function(){

			if(typeof(this.$cart.couponDiscount) !== "undefined"){

				if(!isNaN(this.$cart.couponDiscount))
					return this.$cart.couponDiscount;

				return 0;	
			}

			return 0;
		}

		this.getCouponCode = function(){
			if(typeof(this.$coupon.coupon) !== "undefined"){
				return this.$coupon.coupon.code;
			}else{
				return 0;
			}
		}

		this.setCouponMessage = function(msg, type){
			if(typeof(msg) !== "undefined"){
				if(msg){
					this.$coupon.invalidCodeMsg = false;
					this.$coupon.invalidCodeMsgTxt = msg;
					this.removeCoupon(1);
				}else{
					this.$coupon.invalidCodeMsg = true;
					this.$coupon.invalidCodeMsgTxt = '';

					if(type==1){
						this.$coupon.couponInput = false;
						this.$coupon.couponOutput = true;
					}					
				}				
			}
		}

	this.getSelectedTimeSlot = function () {

		var slot = this.$cart.timeslot;
		
		if(!slot.datekey){
			return false;
		}

		return slot.datekey + (slot.slotTime * 60);

	}

	// function to calculate base time selected by 
	// @param onTimeSlot : this will let know basetime calculate on time slot or not
	this.getDeliveryBaseTime = function () {

		var currentStep = this.getCurrentStep(true);

		var deliveryType = this.getDeliveryType();
		var deliveryBaseTime = null;

		if(deliveryType==1){

			if(currentStep>1){
				var timeSlot = this.getSelectedTimeSlot();

				if(timeSlot!==false){
					deliveryBaseTime = timeSlot;
				}
			}		

		}else{
			var serverTime = appConfig.getServerTime();
			var halfHourTimeStr = 1800;
			deliveryBaseTime = serverTime + (halfHourTimeStr * 3);			
		}

		return deliveryBaseTime;
		
	}

	this.getProductsStats = function(){
		return this.productsStats || {};
	}

	this.setProductsAvailability = function(prosLapsedTime){

		if(!angular.isDefined(prosLapsedTime)){
			var prosLapsedTime = this.productsStats;
		}

		var proCounts = this.getProductsCountInCart();
		var deliveryBaseTime = this.getDeliveryBaseTime();
		var _self = this;
		this.highestShortLapsed = 0;

		angular.forEach(prosLapsedTime, function (pro,key) {
			
			pro.short = 0;

			if(deliveryBaseTime<pro.lapsedTime){
				var proCountIncart = proCounts[pro._id];
				if(pro.quantity < proCountIncart){
					_self.highestShortLapsed = _self.highestShortLapsed<pro.lapsedTime?pro.lapsedTime:_self.highestShortLapsed;
					pro.short = proCountIncart - pro.quantity;
				}

			}

		});

		this.productsStats = prosLapsedTime;
		return this.highestShortLapsed;
		
	}

	this.setStandardDeliveryRemainOrders = function (deliverySlots) {

		var serverTime = appConfig.getServerTime();

	}

	this.availabilityPopUp = function () {

		var _self = this;

		$mdDialog.show({

				controller: ['$scope', '$rootScope', '$document',function($scope, $rootScope, $document) {
				
									$scope.products = [];
									angular.forEach(_self.productsStats, function (product) {
										
										if(product.short==0){
											return;
										}
										var pro = angular.copy(_self.getProductInCartById(product._id));
				
										if(pro){
				
											pro.short = product.short;
											pro.quantity = product.count;
											pro.outOfStockType = product.outOfStockType;
											var d = new Date(product.lapsedTime * 1000);
											pro.availabilityDate = d.toDateString();
											pro.availabilityTime = d.amPmFormat();
				
											$scope.products.push(pro);
										}
				
									});
				
									$scope.isTimeslotPage = _self.getCurrentStep(true)===2?true:false;
									
									$scope.hide = function() {
										$mdDialog.hide();
									};
									$scope.cancel = function() {
										$mdDialog.cancel();
									};
				
									$scope.continue = function(){					
				
										$scope.step = 0;
				
										$mdDialog.hide();
				
										$state.go("mainLayout.checkout.cart");
				
									}
									
								}],
				templateUrl: '/templates/checkout/product-unavailable.html',
				parent: angular.element(document.body),
				clickOutsideToClose:false,
				fullscreen:true
			})
			.then(function(answer) {

			}, function() {

			});
	}

}]);


AlcoholDelivery.service('store', [
			'$rootScope','$window','$http','alcoholCart','promotionsService','$q', '$cookies','cartValidation'
	,function ($rootScope,$window,$http,alcoholCart,promotionsService,$q,$cookies,cartValidation) {

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
				//localStorage.removeItem("deliverykey");
				$cookies.remove("deliverykey");
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

AlcoholDelivery.service('promotionsService',[
			'$http','$log','$q','$rootScope'
	,function($http,$log,$q,$rootScope){

	this.init = function(){
		
		var _self = this;
		var defer = $q.defer();
		//ProductService.getPromotions()
		$http.get("super/promotions").then(

			function(succRes){
				
				_self.$promotions = succRes.data;
				angular.forEach(_self.$promotions, function(promo){

					angular.forEach(promo.products, function(product){

						_self.setProductUnDiscountedPrice(product);

					})

				})

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

	this.setProductUnDiscountedPrice = function(product){

		var unitPrice = parseFloat(product.price);

		var advancePricing = product.regular_express_delivery;

		if(advancePricing.type==1){

			unitPrice +=  parseFloat(unitPrice * advancePricing.value/100);

		}else{

			unitPrice += parseFloat(advancePricing.value);

		}
		
		product.unDiscountedPrice = unitPrice.toFixed(2);
	}
	
}]);

AlcoholDelivery.service('cartValidation',[
			'alcoholCart', '$state', '$document', '$timeout', '$mdToast','UserService', 'appConfig'
	,function(alcoholCart, $state, $document, $timeout, $mdToast, UserService, appConfig) {

	this.showToast = function (msg) {

		//this.processValidators();

		if(!msg) return false;
		var toast = $mdToast.simple()
			.textContent(msg)
			.highlightAction(false)
			.position("top right");
		$mdToast.show(toast);
		return true;

	}

	this.init = function(toState, fromState) {

		if(!toState) {
			toState = $state.current;
			fromState = $state.previous;
		}

		if(!/^mainLayout\.checkout\..+$/.test(toState.name) || (alcoholCart.getTotalUniqueItems()<1)) return true;
		
		var cart = alcoholCart.$cart
		  , states = [
				'mainLayout.checkout.cart',
				'mainLayout.checkout.address',
				'mainLayout.checkout.delivery',
				'mainLayout.checkout.payment',
				'mainLayout.checkout.review',
			]
		  , step = states.indexOf(toState.name)
		  , prevState = fromState?states.indexOf(fromState.name):0;
		
		
		if(step > 0) {

			if(alcoholCart.getDeliveryType()==0 && !appConfig.isServerUnderWorkingTime()){

				alcoholCart.$validations.cart.workingHrs.status = true;
				$state.go(states[0],{},{reload: false});
				return false;
			}

			var currUser = UserService.getIfUser();
			if(currUser===false){
				$state.go(states[0], {err: "Please login"});
				return false;
			}

			if(alcoholCart.isEmpty()){
				$state.go(states[0], {err: "Add some products to the cart!"}, {reload: true});
				return false;
			}
			for (var i in cart.promotions){
				if(alcoholCart.getCartTotal() < cart.promotions[i]._price){
					$state.go(states[0], {err: "Invalid promotion is applied!"}, {reload: true});
					return false;
				}
			}
			if(typeof cart.delivery == 'undefined' || typeof cart.delivery.type == 'undefined'){
				$state.go(states[0], {err: "Please select delivery type!"}, {reload: true});
				return false;
			}
		}

		if((step==1 || step==2) && alcoholCart.deliveryApplicable===false){

			if(prevState>0){
				$state.go(states[0], {}, {reload: false});
			}else{
				$state.go(states[3], {}, {reload: false});
			}
			return false;

		}

		if(step > 1) {

			if(alcoholCart.deliveryApplicable!==false){
				if(!angular.isDefined(cart.delivery) || !cart.delivery.address || !cart.delivery.address.detail){

					$state.go(states[1], {err: "Please select a delivery address!"}, {reload: true});
					return false;
				}

				if(!angular.isDefined(cart.delivery.contact)){
					$state.go(states[1], {err: "Please Provide Contact Number!"});
					return false;
				}
			}

		}

		if(step == 2 && cart.delivery.type != 1){
			if(prevState>2){
				$state.go(states[1], {}, {reload: false});
			}else{
				$state.go(states[3], {}, {reload: false});
			}
			return false;
		}

		if(step > 2 && cart.delivery.type == 1){
			if(typeof cart.timeslot == 'undefined' || 
				typeof cart.timeslot.slotkey == 'undefined' || 
				typeof cart.timeslot.datekey == 'undefined' || 
						cart.timeslot.datekey==false || 
						cart.timeslot.slotkey===false){

				$state.go(states[2], {err: "Please select a Time slot!"}, {reload: false});

				return false;
			}
		}

		if(step > 3){
			if(typeof cart.payment == 'undefined' || typeof cart.payment.method == 'undefined'){
				$state.go(states[3], {err: "Please select a payment method!"}, {reload: true});
				return false;
			}
		}

		return true;

	}

}]);