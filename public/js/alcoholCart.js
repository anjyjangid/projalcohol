AlcoholDelivery.service('alcoholCart', ['$rootScope', '$window', '$http', '$q', 'alcoholCartItem', 'alcoholCartPackage', 'CartSession', function ($rootScope, $window, $http, $q, alcoholCartItem, alcoholCartPackage, CartSession) {

		this.init = function(){
			
			this.$cart = {
				
				products : {},
				packages : [],
				nonchilled : false,
				delivery : {
					type : 1,
					charges : null,
					address : null,
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

			var inCart = this.getProductById(id);
			var _self = this;
			var deliveryKey = _self.getCartKey();

			$http.put("/cart/"+deliveryKey, {
					"id":id,
					"quantity":quantity,
					"chilled":serveAs,
					"type":"product",
				},{

			}).error(function(data, status, headers) {

			}).success(function(response) {

				if(!response.success){
					
					switch(response.errorCode){
						case "100":
							//$cart.product.quantitycustom = response.data.quantity;
						break;
					}

				}else{
					

					if(inCart){

						inCart.setTQuantity(response.product.quantity);
						inCart.setPrice(response.product);
						

						//$rootScope.$broadcast('alcoholCart:itemAdded', response.data);

					}else{

						//$rootScope.$broadcast('alcoholCart:itemAdded', response.data);
						
			    		var newItem = new alcoholCartItem(id, response.product);
						_self.$cart.products[id] = newItem;
						//$rootScope.$broadcast('alcoholCart:itemAdded', newItem);

					}

					$rootScope.$broadcast('alcoholCart:change', {});

				}
			});

				

		};

		this.addPackage = function (id, detail) {

			var _self = this;
			var deliveryKey = _self.getCartKey();

			var d = $q.defer();

			$http.post("/cart/package/"+deliveryKey, {
					"id":id,
					"package":detail,					
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

						inCart.setQuantity(detail.packageQuantity);
						inCart.setPrice(detail.packagePrice);
						
						//$rootScope.$broadcast('alcoholCart:itemAdded', response.data);

					}else{

						//$rootScope.$broadcast('alcoholCart:itemAdded', response.data);
						
			    		var newPackage = new alcoholCartPackage(id, response.key, detail);
			    		_self.$cart.packages.push(newPackage);
						
						//$rootScope.$broadcast('alcoholCart:itemAdded', newItem);

					}

					$rootScope.$broadcast('alcoholCart:change', {});

					d.resolve(response);

				}
			});

			return d.promise;

				

		};

		this.getProductById = function (productId) {
			var products = this.getCart().products;
			var build = false;

			if(typeof products[productId] !== 'undefined'){
				build = products[productId];
			}
			// angular.forEach(items, function (item) {
			// 	if  (item.getId() === itemId) {
			// 		build = item;
			// 	}
			// });
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

		this.setShipping = function(shipping){
			this.$cart.shipping = shipping;
			return this.getShipping();
		};

		this.getShipping = function(){
			if (this.getCart().items.length == 0) return 0;
			return  this.getCart().shipping;
		};

		this.setTaxRate = function(taxRate){
			this.$cart.taxRate = +parseFloat(taxRate).toFixed(2);
			return this.getTaxRate();
		};

		this.getTaxRate = function(){
			return this.$cart.taxRate
		};

		this.getTax = function(){
			return +parseFloat(((this.getSubTotal()/100) * this.getCart().taxRate )).toFixed(2);
		};

		this.setCart = function (cart) {
			this.$cart = cart;
			return this.getCart();
		};

		this.getCart = function(){
			return this.$cart;
		};

		this.getProducts = function(){
			
			return this.getCart().products;
		};
		this.getPackages = function(){
			
			return this.getCart().packages;
		};

		this.getTotalItems = function () {
			var count = 0;
			var items = this.getProducts();
			angular.forEach(items, function (item) {
				count += item.getQuantity();
			});

			return count;
		};

		this.getTotalPackages = function () {
			
			return this.getCart().packages.length
		};

		this.getTotalUniqueItems = function () {
			
			var count = Object.keys(this.getCart().products).length;

			count+= this.getCart().packages.length;

			return count;
		};

		this.getSubTotal = function(){
			var total = 0;
			angular.forEach(this.getCart().items, function (item) {
				total += item.getTotal();
			});
			return +parseFloat(total).toFixed(2);
		};

		this.totalCost = function () {
			return +parseFloat(this.getSubTotal() + this.getShipping() + this.getTax()).toFixed(2);
		};

		this.removeItem = function (index) {
			var item = this.$cart.items.splice(index, 1)[0] || {};
			$rootScope.$broadcast('alcoholCart:itemRemoved', item);
			$rootScope.$broadcast('alcoholCart:change', {});

		};

		this.removeItemById = function (id) {
			var item;
			var cart = this.getCart();
			angular.forEach(cart.items, function (item, index) {
				if(item.getId() === id) {
					item = cart.items.splice(index, 1)[0] || {};
				}	
			});
			this.setCart(cart);
			$rootScope.$broadcast('alcoholCart:itemRemoved', item);
			$rootScope.$broadcast('alcoholCart:change', {});
		};

		this.empty = function () {
			
			$rootScope.$broadcast('alcoholCart:change', {});
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

		this.getCartKey = function(){

			var deliverykey = localStorage.getItem("deliverykey");
			if(deliverykey===null || typeof deliverykey==="undefined"){
				deliverykey = $rootScope.deliverykey;
			}

			if(deliverykey===null || typeof deliverykey==="undefined"){
				return false;
			}

			return deliverykey;

		},

		this.setCartKey = function(cartKey){

			localStorage.setItem("deliverykey",cartKey)
			$rootScope.deliverykey = cartKey;

			return cartKey;
		}

		this.$restore = function(storedCart){

			var _self = this;

			_self.init();

			var products = {};
			var packages = [];

			angular.copy(storedCart.products,products);
			angular.copy(storedCart.packages,packages);

			storedCart.products = {};
			storedCart.packages = [];

			angular.copy(storedCart,_self.$cart);

			_self.setCartKey(storedCart._id);

			angular.forEach(products, function (item,key) {

				var newItem = new alcoholCartItem(key, item);
				_self.$cart.products[key] = newItem;
				
			});

			angular.forEach(packages, function (package,key) {

				var newPackage = new alcoholCartPackage(package._id,package._unique,package);
				_self.$cart.packages.push(newPackage);
				
			});

			
		};

		this.$save = function () {
			
			var that=this;

			store.set(this.getCart(),function(){

			});

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

			var advancePricing = original.advance_order;
			
			if(advancePricing.type==1){

				unitPrice +=  parseFloat(originalPrice * advancePricing.value/100);

			}else{

				unitPrice += parseFloat(advancePricing.value);

			}

			price = unitPrice;
			price = parseFloat(price.toFixed(2));

			var bulkArr = original.advance_order_bulk.bulk;

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

			
			
			return this.price = price;	
			
		};

		item.prototype.getPrice = function(){
			return this.price;
		};

		item.prototype.setRQuantity = function(cQuantity,ncQuantity){
			this.qChilled = cQuantity;
			this.qNChilled = ncQuantity
		}

		item.prototype.setRChilledStatus = function(cLastStatus,ncLastStatus){
			this.cLastStatus = cLastStatus;
			this.ncLastStatus = ncLastStatus
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
			if (data.product) this.product = data.product;
		};

		item.prototype.getData = function(){
			if (this.product) return this.product;
			else $log.info('This item has no product detail');
		};


		item.prototype.getTotal = function(){
			return +parseFloat(this.getQuantity() * this.getPrice()).toFixed(2);
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
			if (uniqueId)  this._uniqueId = uniqueId;
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
			if (data) this.original = data;
		};

		package.prototype.getOriginal = function(){
			if (this.original) return this.original;
			else $log.info('This package has no original detail');
		};
		
		package.prototype.setQuantity = function(quantity){
			if (quantity) this._quantity = parseInt(quantity);
		};

		package.prototype.getQuantity = function(){
			if (this._quantity) return parseInt(this._quantity);
			else $log.info('This package has no original detail');
		};

		
		package.prototype.setPrice = function(price){					

			var unitPrice = parseFloat(price);

			var quantity = this.getQuantity();
							
			price = quantity * unitPrice;
			price = parseFloat(price.toFixed(2));
					
			return this._price = price;	
			
		};

		package.prototype.getPrice = function(){
			return this._price;
		};

		return package;

	}]);

AlcoholDelivery.service('store', ['$window','$http','alcoholCart', function ($window,$http,alcoholCart) {

		return {

			init : function (){
				
				if(typeof(Storage) !== "undefined"){

					var deliverykey = alcoholCart.getCartKey();

					if(deliverykey===false){
						deliverykey = "";
					}

					$http.get("cart/"+deliverykey).success(function(response){

						alcoholCart.$restore(response.cart);
						
					})

				}else{

					alert("Browser is not compatible");

				}

			},

			getold: function (key, cb) {
				
				if(typeof key == "function" && !cb) cb=key;
				if(!cb) cb = function(){};

				if ( $window.localStorage.getItem(key) ){
							
					CartSession.GetDeliveryKey().then(

						function(response){

							$http.get("cart/"+response.deliverykey+"/").then(function(response){
								cb(undefined, response.data);
							})

						}

					)
				}
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