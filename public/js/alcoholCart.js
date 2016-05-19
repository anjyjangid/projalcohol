AlcoholDelivery.service('alcoholCart', ['$rootScope', '$window', '$http', 'alcoholCartItem', 'CartSession', function ($rootScope, $window, $http, alcoholCartItem, CartSession) {

		this.init = function(){
			
			this.$cart = {
				
				products : {},
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
							$cart.product.quantitycustom = response.data.quantity;											
						break;
					}

				}else{
					

					if(inCart){

						inCart.setQuantity(quantity, false);
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

		this.getTotalItems = function () {
			var count = 0;
			var items = this.getProducts();
			angular.forEach(items, function (item) {
				count += item.getQuantity();
			});

			return count;
		};

		this.getTotalUniqueItems = function () {
			
			return Object.keys(this.getCart().products).length;
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

			angular.copy(storedCart.products,products);

			storedCart.products = {};

			angular.copy(storedCart,_self.$cart);

			_self.setCartKey(storedCart._id);

			angular.forEach(products, function (item,key) {

				var newItem = new alcoholCartItem(key, item);
				_self.$cart.products[key] = newItem;
				
			});

			console.log(_self.$cart.products);
		};

		this.$save = function () {
			
			var that=this;

			store.set(this.getCart(),function(){

			});

		}

	}]);

AlcoholDelivery.factory('alcoholCartItem', ['$rootScope', '$log', function ($rootScope, $log) {

		var item = function (id, data) {
			this.setId(id);
			this.setPrice(data);
			this.setQuantity(data.quantity);
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

			var quantity = product.quantity;

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


		item.prototype.setQuantity = function(quantity, relative){

			var quantityInt = parseInt(quantity);
			if (quantityInt % 1 === 0){
				if (relative === true){
					this.quantity  += quantityInt;
				} else {
					this.quantity = quantityInt;
				}
				if (this.quantity < 1) this.quantity = 1;

			} else {
				this.quantity = 1;	
				$log.info('Quantity must be an integer and was defaulted to 1');
			}


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