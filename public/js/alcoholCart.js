AlcoholDelivery.service('alcoholCart', [
			'$log','$rootScope', '$window', '$http', '$q', '$mdToast', '$filter', 'alcoholCartItem', 'alcoholCartLoyaltyItem', 
			'alcoholCartPackage','promotionsService','alcoholCartPromotion', 'alcoholCartGiftCard', 'alcoholCartGift', 
			'alcoholCartSale', 'alcoholCartCreditCard','UserService'
	,function ($log, $rootScope, $window, $http, $q, $mdToast, $filter, alcoholCartItem, alcoholCartLoyaltyItem, 
			alcoholCartPackage, promotionsService, alcoholCartPromotion, alcoholCartGiftCard, alcoholCartGift,
			alcoholCartSale, alcoholCartCreditCard, UserService) {

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
					inCart.setPrice(resProduct);						
					inCart.setRemainingQty(resProduct.remainingQty);

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

					//_self.removeItemById(id);

				}else{
				
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

	this.addCreditCertificate = function(id, quantity){

		var defer = $q.defer();
		var _self = this;		
		
		var deliveryKey = _self.getCartKey();

		$http.put("/cart/loyalty/credit/"+deliveryKey, {
				"id":parseInt(id),
				"quantity":parseInt(quantity),				
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
		var _self = this;
		$http.put('cart/bulk',angular.extend({ cartKey: _self.getCartKey() }, products))
				.success(function(response){

					if(response.success){					

						angular.forEach(response.data.products, function (product, index) {
							
							var id = product.product._id;
							var inCart = _self.getProductById(id);

							if(inCart){

								inCart.setRQuantity(product.chilled.quantity,product.nonchilled.quantity);
								inCart.setTQuantity(product.quantity);
								inCart.setPrice(product);

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

		$http.post('cart/repeatlast', {cartKey: _self.getCartKey()})
				.success(function(response){

					if(response.success){					

						angular.forEach(response.data.products, function (product, index) {
							
							var id = product.product._id;
							var inCart = _self.getProductById(id);

							if(inCart){

								inCart.setRQuantity(product.chilled.quantity,product.nonchilled.quantity);
								inCart.setTQuantity(product.quantity);
								inCart.setPrice(product);								

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
		    		$rootScope.$broadcast('alcoholCart:updated',{msg:"Package added to cart",quantity:detail.packageQuantity});
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
				build = loyalty[productId];
			}
			
			if(build!==false){return build;}

		}


		this.getProductsCountInCart = function(){

			var products = this.getProducts();
			var promotions = this.getPromotions();
			var loyalty = this.getLoyaltyProducts();

			var prosInCart = {};

			angular.forEach(products, function(product, key) {
				prosInCart[key] = product.getQuantity();
			});

			// angular.forEach(promotions, function(promotion, key) {
				
			// 	if(promotion.product._id == productId){
			// 		var product = {
			// 			imageFiles : [
			// 				{
			// 					coverimage:1,
			// 					source:promotion.product._image
			// 				}
			// 			],
			// 			slug : promotion.product._slug,
			// 			name: promotion.product._title
			// 		}
			// 		build = {product:product};
			// 	}

			// });

			
			angular.forEach(loyalty, function(product, key) {

				if(typeof prosInCart[key] === 'undefined'){

					prosInCart[key] = product.getQuantity();

				}else{

					prosInCart[key] = parseInt(prosInCart[key]) + parseInt(product.getQuantity());

				}
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
					total += parseFloat(product.getTotal());
				}
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
			
			this.removeNonEligiblePromotions(total);

			angular.forEach(cart.promotions, function (promotion) {
				total += parseFloat(promotion.getPrice());
			});

			angular.forEach(cart.sales, function (sale) {
				total += parseFloat(sale.getPrice());
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

			return parseFloat(cartTotal).toFixed(2);

		};

		this.getCartTotal = function(){

			var cartTotal = this.setCartTotal();
			this.$cart.payment.total = cartTotal;
			return cartTotal;			

		};

		this.getRemainToFreeDelivery = function(type){


			var delivery = this.$cart.service.delivery;

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

					}else{
						_self.removeItemById(id);
					}


					if(response.change>0){
						
						$rootScope.$broadcast('alcoholCart:updated',{msg:"Items removed from cart",quantity:Math.abs(response.change)});
						
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


		this.removeItemById = function (id) {

			var item;
			var cart = this.getCart();
			angular.forEach(cart.products, function (product, index) {
				if(index === id) {

					delete cart.products[index];
					item = product || {};
					
				}	
			});
			 
			$rootScope.$broadcast('alcoholCart:itemRemoved', item);
			
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
						toRemove[sPro._id] = sPro.quantity;
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

						product.setRQuantity(qtyChilled,qtyNonChilled);

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
			angular.copy(storedCart.loyaltyCards,loyaltyCards);
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

			angular.forEach(loyaltyCards, function (cc,key) {

				if(typeof cc !== 'object'){
					return false;
				}
				
				var newItem = new alcoholCartCreditCard(key,cc);
				_self.$cart.loyaltyCards[key] = newItem;
				
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

		this.validate = function(){

			var _self = this;
			var cart = this.getCart();
			var stepName = this.step;
						
			var cartSteps = angular.copy(this.stepsName)
			
			var stepValidating = "";

			while(stepValidating !== stepName){

				stepValidating = cartSteps.shift();
				// isValid = _self[stepValidating+'Validate']();

			}

			return false;
		}		

		this.cartValidate = function(){

			return false;
			// if(!cart.delivery.type){

			// 	if(step){}

			// }

		}
		this.addressValidate = function(){return false;}
		this.deliveryValidate = function(){return false;}
		this.paymentValidate = function(){return false;}
		this.reviewValidate = function(){return false;}




		this.stepCheckout = function(step){

			$anchorScroll();

		}




	}]);


AlcoholDelivery.factory('alcoholCartSale', ['$log', function ($log){

	var saleObj = function (sale,detail) {

		this.setParams(sale);

		this.setSaleDetail(detail);

		this.setPrices(detail);

	}

	
	saleObj.prototype.setParams = function(sale){
		
		_self = this;

		angular.forEach(sale, function (value,key) {
			_self[key] = value;
		});		

	};


	saleObj.prototype.setSaleDetail = function(detail){

		this.title = {
			small : detail.listingTitle,
			long : detail.detailTitle
		}		

	};

	saleObj.prototype.setPrices = function(detail){

		var price = 0;
		var actionProPrice = 0;

		angular.forEach(this.products, function (pro) {
			price = price + (parseFloat(pro.product.price) * pro.quantity);
		});

		angular.forEach(this.action, function (pro) {

			var tempP = parseFloat(pro.product.price) * pro.quantity;
			actionProPrice+= tempP;
			price+= tempP

		});

		strikePrice = price.toFixed(2);

		this.strikePrice = strikePrice;

		var currPrice = 0;
		if(detail.actionType == 1){
			 
			 var qty = detail.giftQuantity;
			 currPrice = parseFloat(price) - parseFloat(actionProPrice);
			 currPrice = currPrice * qty;			 

		}else{

			if(detail.discountType==1){
				
				if(detail.actionProductId.count>0){
					currPrice = actionProPrice - detail.discountValue;
					currPrice = price - currPrice;
				}else{
					currPrice = price - detail.discountValue;
				}
				

			}else{

				if(detail.actionProductId.count>0){
					currPrice = actionProPrice - (actionProPrice * detail.discountValue / 100);
					currPrice = price - currPrice;
				}else{
					currPrice = price - (price * detail.discountValue / 100);
				}

			}

		}

		this.price = currPrice.toFixed(2);

	};	

	saleObj.prototype.getPrice = function(){
		return parseFloat(this.price);
	}

	saleObj.prototype.getId = function(){
		return this._id;
	};



	return saleObj;

}])

AlcoholDelivery.factory('alcoholCartItem', ['$rootScope', '$log', '$filter', function ($rootScope, $log, $filter){
		
		var item = function (id, data) {
			
			try{
				this.setId(id);

				this.setRQuantity(data.chilled.quantity,data.nonchilled.quantity);

				this.setRChilledStatus(data.chilled.status,data.nonchilled.status);
				this.setRemainingQty(data.remainingQty);
				this.setTQuantity(data.quantity);
				this.setPrice(data);
				this.setLastServedAs(data.lastServedChilled);
				this.setProduct(data);
				this.setSale(data.sale);

				this.setIcon();
			}
			catch(err){
				console.log(err.message);
				this.error = true;
			}
				
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
			return this.product.name;
		};

		item.prototype.getSlug = function(){
			return this.product.slug;
		};

		item.prototype.setIcon = function(){
			
			this.icon = $filter('getProductThumb')(this.product.imageFiles);

		}


		item.prototype.getIcon = function(){
			return this.icon;
		};
		

		item.prototype.setPrice = function(product){

			var original = product.product;

			var originalPrice = parseFloat(original.price);

			var unitPrice = originalPrice;

			var quantity = this.getRemainingQty();

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

			if(quantity>0){
				this.discountedUnitPrice = price/quantity;
			}

			return this.price = price;
			
		};

		item.prototype.getPrice = function(){
			return parseFloat(this.price);
		};

		item.prototype.setRQuantity = function(cQuantity,ncQuantity){

			this.qChilled = parseInt(cQuantity);
			this.qNChilled = parseInt(ncQuantity);

			this.setTQuantity(this.qChilled+this.qNChilled);

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
			return parseInt(this.quantity);
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

		item.prototype.setSale = function(sale){
			this.sale = sale;
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

		item.prototype.setRemainingQty = function(rQty){

			this.remainingQty = rQty;
			this.setStateRemainQty();

		};

		item.prototype.getRemainingQty = function(){

			if(this.remainingQty) return this.remainingQty;

			return 0;

		};

		item.prototype.setStateRemainQty = function(){

			var remainqChilled = 0;
			var remainqNChilled = 0;
			var rQty = this.remainingQty;

			if(rQty>this.qNChilled){
				
				remainqNChilled = this.qNChilled;				

			}else{

				remainqNChilled = rQty;

			}

			var stillRemain = rQty - this.qNChilled;
			if(stillRemain>0){
				remainqChilled = stillRemain;
			}
			
			this.remainqChilled = remainqChilled;			
			this.remainqNChilled = remainqNChilled;;
			

		}

		return item;

	}]);

AlcoholDelivery.factory('alcoholCartLoyaltyItem', ['$log','$filter', function ($log,$filter){
		
		var lProduct = function (id, proObj) {

			this.setId(id);
			this.setRQuantity(proObj.chilled.quantity,proObj.nonchilled.quantity);
			this.setRChilledStatus(proObj.chilled.status,proObj.nonchilled.status);
			this.setTQuantity(proObj.quantity);
			this.setPrice(proObj.product);
			this.setLastServedAs(proObj.lastServedChilled);
			this.setProduct(proObj);
			
			this.setIcon();

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
		
		lProduct.prototype.getName = function(){
			return this.product.name;
		};

		lProduct.prototype.getSlug = function(){
			return this.product.slug;
		};

		lProduct.prototype.setIcon = function(){
			
			this.icon = $filter('getProductThumb')(this.product.imageFiles);

		}

		lProduct.prototype.getIcon = function(){
			return this.icon;
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

				if(typeof uniqueId.$id !== "undefined"){
					uniqueId = uniqueId.$id;
				}
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



AlcoholDelivery.factory('alcoholCartCreditCard',[function(){

	var creditCard = function(value,cardData){

		this.setValue(value);
		this.setPoints(cardData.points);
		this.setQuantity(cardData.quantity);

	}	

	creditCard.prototype.getValue = function(){		
		return this.value;
	}

	creditCard.prototype.setPoints = function(points){
		this.points = points;
		return this.points;
	}

	creditCard.prototype.setValue = function(value){
		this.value = value;
		return this.value;
	}

	creditCard.prototype.setQuantity = function(quantity){

		this.quantity = parseInt(quantity);
		this.qNChilled = parseInt(quantity);
		return this.quantity;
	}

	creditCard.prototype.getQuantity = function(){		
		return this.quantity;
	}

	creditCard.prototype.getPoints = function(){

		var cardPoints = parseInt(this.quantity) * parseFloat(this.value);
		return cardPoints;

	}	

	creditCard.prototype.getLoyaltyPoints = function(){

		var loyaltyPoints = parseInt(this.quantity) * parseFloat(this.points);
		return loyaltyPoints;

	}	

	creditCard.prototype.remove = function(){

	}
	
	return creditCard;

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
		this.gsPrice(giftData.price);
		this.setImageLink(giftData.image);
		this.setRecipient(giftData.recipient);

		if(typeof giftData.products !== 'undefined'){
			this.setProducts(giftData.products);
			this.gsLimit(giftData.limit);
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
			return parseFloat(this.price.toFixed(2));
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
			this.setProduct(giftProduct._id);


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

		giftProductObj.prototype.setProduct = function(proId){
			
			var product =  $rootScope.getProductInCart(proId)

			if (product!==false) {

				this.product = {

					name : product.getName(),
					slug : product.getSlug(),
					icon : product.getIcon()

				}

			};
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