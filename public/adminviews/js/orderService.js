MetronicApp
.service('alcoholCart',['$http', '$q', 'alcoholCartItem', 'alcoholCartPackage', 'alcoholCartGiftCard'
, function($http, $q, alcoholCartItem, alcoholCartPackage, alcoholCartGiftCard){

	this.init = function(){

		this.$cart = {

			products : {},
			packages : [],
			giftCards : [],
			nonchilled : false,
			delivery : {

				type : 0,
				charges : null,
				address : null,
				contact : null,
				instruction : null,
				leaveatdoor : false,
				instructions : null,

			},
			service : {
				express : {
					status : "false",
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

	}

	// this.addProduct = function (id, quantity, serveAs) {

	// 	var defer = $q.defer();

	// 	var inCart = this.getProductById(id);
	// 	var _self = this;
	// 	var deliveryKey = _self.getCartKey();

	// 	$http.put("/cart/"+deliveryKey, {
	// 		"id":id,
	// 		"quantity":quantity,
	// 		"chilled":serveAs,
	// 		"type":"product",
	// 	},{})
	// 	.error(function(data, status, headers) {

	// 		defer.reject(data);

	// 	})
	// 	.success(function(response) {

	// 		var resProduct = response.product;

	// 		if(inCart){

	// 			if(resProduct.quantity==0){

	// 				_self.removeItemById(id);

	// 			}else{

	// 				inCart.setRQuantity(resProduct.chilled.quantity,resProduct.nonchilled.quantity);
	// 				inCart.setTQuantity(resProduct.quantity);
	// 				inCart.setPrice(resProduct);

	// 				inCart.setRMaxQuantity(resProduct);
	// 			}

	// 		}else{

	// 			var newItem = new alcoholCartItem(id, resProduct);
	// 			_self.$cart.products[id] = newItem;

	// 		}

	// 		defer.resolve(response);

	// 	});

	// 	return defer.promise
	// };


	this.addProduct = function (id, quantity, serveAs) {


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

	this.addGiftCard = function(giftData){

		var isFound = this.getGiftCardByUniqueId(giftData._uid);

		if(isFound===false){

			var giftCard = new alcoholCartGiftCard(giftData);
			this.$cart.giftCards.push(giftCard);

		}


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

		var cards = this.getCart().giftcards || [];

		return cards;
	}

	this.removeItemById = function (id) {

		var item;
		var cart = this.getCart();
		angular.forEach(cart.products, function (product, index) {
			if(index === id) {

				delete cart.products[index];
				item = product || {};

			}
		});
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

	this.getCartKey = function(){

		var deliverykey = this.getCart()._id;
		return deliverykey;

	}

	this.getProductById = function (productId){

		var products = this.getCart().products;
		var build = false;

		if(typeof products[productId] !== 'undefined'){
			build = products[productId];
		}

		return build;
	};

	this.getProducts = function(){
		return this.getCart().products;
	};

	this.getGiftCards = function(){
		return this.getCart().giftCards;
	};

	this.getPackages = function(){
		return this.getCart().packages;
	};


	this.getTotalItems = function(){

		var count = 0;
		var items = this.getProducts();
		angular.forEach(items, function (item) {
			count += item.getQuantity();
		});

		return count;

	};


	this.getCart = function(){
		return this.$cart;
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

		var count = Object.keys(this.getCart().products).length;

		count+= this.getCart().packages.length;

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

	this.$restore = function(storedCart) {

		var _self = this;

		_self.init();

		if(typeof storedCart.products !== 'undefined'){

			angular.forEach(storedCart.products, function (item,key) {

				var newItem = new alcoholCartItem(key, item);
				_self.$cart.products[key] = newItem;

			});

			delete storedCart.products;

		}

		if(typeof storedCart.giftCards !== 'undefined'){

			angular.forEach(storedCart.giftCards, function (giftCard,key) {

				var giftCard = new alcoholCartGiftCard(giftCard);
				_self.$cart.giftCards.push(giftCard);

			});
			delete storedCart.giftCards;
		}

		if(typeof storedCart.packages !== 'undefined'){

			angular.forEach(storedCart.packages, function (package,key) {

				var newPackage = new alcoholCartPackage(package._id,package._unique,package);
				_self.$cart.packages.push(newPackage);

			});
			delete storedCart.packages;

		}

		angular.extend(_self.$cart,storedCart);

		// _self.$cart._id = storedCart._id;

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

		var d = $q.defer();

		$http.put("adminapi/order/deploycart/"+cartKey, cart,{

		}).error(function(data, status, headers) {

			d.reject(data);

		}).success(function(response) {

			d.resolve(response);

		});

		return d.promise;

	}

	this.newCart = function() {
		var _self = this;
		return $http.get("/adminapi/order/newcart")
		.success(function(newCartRes){
			_self.$restore(newCartRes.cart);
		});

	}

}])

.service('alcoholGifting', ['$rootScope', '$q', '$http', '$mdToast', 'alcoholCart', function ($rootScope, $q, $http, $mdToast, alcoholCart) {

	this.addUpdateGiftCard = function(gift){

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

}])

.service('alcoholStore', ['$http', 'alcoholCart', '$q', 'sweetAlert', function ($http, alcoholCart, $q, sweetAlert) {

	return {

		init : function (){

			return $q(function(resolve,reject){

				$http.get("/adminapi/order").success(function(response){
					console.log(response);
					if(!response.isUnprocessed){

						alcoholCart.newCart()
						.then(resolve,reject);

					}else{

						alcoholCart.$restore(response.cart);
						resolve();

					}

				})

			})

		}

	}

}])

.service('categoriesService', ['$http', '$q', '$log', function ($http, $q, $log){

	this.init = function() {

		var _self = this;
		var d = $q.defer();

		$http.get("category/pricing").success(function(response){
			_self.categoryPricing = response;
		});

		$http.get("/super/category").success(function(response){

			_self.categories = response;			

			_self.processCategories(_self.categories).then(
				function(res){
					_self.categoriesParentChild = res;
					d.resolve(_self.categoriesParentChild);
				}
			);

		});



		return d.promise;

	};

	this.processCategories = function(categories){

		var parentCategories = {};

		return $q(function(resolve,reject){

			$http.get("/adminapi/setting/settings/pricing").success(function(response){

				var globalPricingObj = {
					express_delivery_bulk : response.settings.express_delivery_bulk,
					regular_express_delivery : response.settings.regular_express_delivery
				}

				angular.forEach(categories, function(value, key) {

					if(!value.ancestors){

						angular.extend(globalPricingObj,value);
						angular.extend(value,globalPricingObj);

						parentCategories[value._id] = value;
					}

				});

				angular.forEach(categories, function(value, key) {

					if(typeof value.ancestors!=='undefined'){

						var parId = value.ancestors[0]._id["$id"];

						if(!value.express_delivery_bulk){
							value.express_delivery_bulk = parentCategories[parId].express_delivery_bulk;
						}
						if(!value.regular_express_delivery){
							value.regular_express_delivery = parentCategories[parId].regular_express_delivery;
						}

						parentCategories[parId]['child'] = {};
						parentCategories[parId]['child'][value._id] = value;

					}

				});

				resolve(parentCategories);

			});

		})

	}

	this.getCategoryById = function(catId){

		var i = 0;
		var category = false;
		for(i;i<this.categories.length;i++){
			if(this.categories[i]._id == catId){
				category = this.categories[i];
				break;
			}
		}

		return category;
	}

}])

.factory('productFactory', ['$http', '$q', '$log', 'categoriesService', 'alcoholCart', function ($http, $q, $log, categoriesService, alcoholCart){

	var product = function(product){

		this.setDetail(product);
		this.setPricing(product);
		this.setPrice(product);

		this.setIncartSetting(product);

	};

	product.prototype.setDetail = function(product){

		angular.extend(this,product);

	}

	product.prototype.setPricing = function(product){

		var categories = angular.copy(product.categories);
		var proCategory = categoriesService.getCategoryById(categories.pop());


		this.express_delivery_bulk = !product.express_delivery_bulk?proCategory.express_delivery_bulk:product.express_delivery_bulk;

		this.regular_express_delivery = !product.regular_express_delivery?proCategory.regular_express_delivery:product.regular_express_delivery;

	}

	product.prototype.getQuantity = function(){

		return this.quantity;

	};

	product.prototype.getRegularExpressPricing = function(){

		return this.regular_express_delivery;

	};

	product.prototype.getExpressBulkPricing = function(){
		return this.express_delivery_bulk.bulk
	}

	product.prototype.setPrice = function(product){

		var originalPrice = parseFloat(product.price);

		var unitPrice = originalPrice;

		var pricing = this.getRegularExpressPricing();

		if(pricing.type==1){

			unitPrice +=  parseFloat(originalPrice * pricing.value/100);

		}else{

			unitPrice += parseFloat(pricing.value);

		}

		price = unitPrice;
		price = parseFloat(price.toFixed(2));

		this.unitPrice = price;

		var bulkArr = this.getExpressBulkPricing();

		for(i=0;i<bulkArr.length;i++){

			var bulk = bulkArr[i];

			if(bulk.type==1){
				bulk.price = originalPrice + (originalPrice * bulk.value/100);
			}else{
				bulk.price = originalPrice + bulk.value;
			}
			bulk.price = bulk.price.toFixed(2);
		}

		return this.price = price;


	};

	product.prototype.getTotalQuantity = function(){

		this.totalQuantity = (parseInt(this.qChilled) || 0) + (parseInt(this.qNChilled) || 0);

		return parseInt(this.totalQuantity);

	}

	product.prototype.getPrice = function(){

		var totalQuantity = this.getTotalQuantity();

		var pricing = this.getRegularExpressPricing();

		var proPrice = parseFloat(this.unitPrice);

		if(pricing.type==1){

			oPrice = (proPrice*100)/(100+pricing.value);

		}else{

			oPrice = proPrice - parseFloat(pricing.value);

		}

		var bulkArr = this.getExpressBulkPricing();

		for(i=0;i<bulkArr.length;i++){

			var bulk = bulkArr[i];

			if(totalQuantity >= parseInt(bulk.from_qty) && totalQuantity <= parseInt(bulk.to_qty)){

				if(bulk.type==1){

					proPrice = totalQuantity * (oPrice + (oPrice * bulk.value/100));

				}else{

					proPrice = totalQuantity(oPrice + bulk.value);

				}

				proPrice = parseFloat(proPrice);
				proPrice = proPrice.toFixed(2);

				break;
			}
		}
		// console.log(proPrice);
		return this.price = proPrice;

	}

	product.prototype.setIncartSetting = function(product){

		var isInCart = alcoholCart.getProductById(product._id);

		this.qChilled = 0;
		this.qNChilled = 0;

		this.servechilled=this.chilled;

		if(isInCart!==false){

			this.isInCart = true;
			this.qChilled = isInCart.getRQuantity('chilled');
			this.qNChilled = isInCart.getRQuantity('nonchilled');
			this.servechilled = isInCart.getLastServedAs();

		}else{

			if(this.chilled){
				this.qChilled = 1;
			}else{
				this.qNChilled = 1;
			}


		}

		this.maxQuantity = this.quantity;

		var available = this.maxQuantity-this.qNChilled+this.qChilled;

		if(available<0){

			this.overQunatity = true;
			this.qNChilled = this.qNChilled + available;

		}

		var available = this.maxQuantity-this.qNChilled+this.qChilled;

		if(available<0){

			this.qChilled = this.qChilled + available;

		}

		this.totalQuantity = parseInt(this.qChilled) + parseInt(this.qNChilled);

	}

	product.prototype.addToCart = function(){

		alcoholCart.addProduct(this._id, { chilled: this.qChilled, nonChilled: this.qNChilled },true);

	}

	return product;

}])

.factory('AlcoholProduct',[
			'$rootScope','$state','$filter','$log','$timeout','$q','categoriesService','alcoholCart',
	function($rootScope,$state,$filter, $log, $timeout, $q, catPricing, alcoholCart){

	var product = function(product){

		this._id = product._id.$id || product._id;		

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

		var isInCart = alcoholCart.getProductById(this._id);

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
			actionProductId:pSale.actionProductId			
		};

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
					var quantity = 1;
					var price = unitPrice;

					angular.forEach(bulkArr, function(bulk,key){

						if(bulk.type==1){
							bulk.price = basePrice + (basePrice * bulk.value/100);
						}else{
							bulk.price = basePrice + bulk.value;
						}

						bulk.price = bulk.price.toFixed(2);

					})

					this.discountedUnitPrice = price/quantity;

					this.price = price;
					this.salePrice = price;

					//PRODUCT HAS SALE ON ITSELF CONDITION
					if(this.sale && this.sale.type == 2 && this.sale.quantity == 1 && this.sale.actionProductId.length == 0){
						if(this.sale.discount.type == 1){//FIXED AMOUNT SALE
							this.salePrice = this.price - this.sale.discount.value;
						}
						if(this.sale.discount.type == 2){//% AMOUNT SALE
							this.salePrice = this.price - (this.price * this.sale.discount.value/100);
						}
						this.salePrice = this.salePrice.toFixed(2);
					}

				}
				else {
					$log.error('Each Product Required Price');
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

				alcoholCart.addProduct(_product._id,quantity,_product.servechilled).then(

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

	return product;

}]);