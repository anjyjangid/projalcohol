AlcoholDelivery.service('alcoholCart', ['$rootScope', '$window', '$http', 'alcoholCartItem', 'store', 'CartSession', function ($rootScope, $window, $http, alcoholCartItem, store, CartSession) {

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

			CartSession.GetDeliveryKey().then(

				function(response){

					$http.put("/cart/"+response.deliverykey, {
							"id":id,
							"quantity":quantity,
							"chilled":serveAs,
						},{

			        }).error(function(data, status, headers) {

			        }).success(function(response) {

			        	if(!response.success){
			        		
			        		switch(response.errorCode){
								case "100":
									$scope.product.quantitycustom = response.data.quantity;											
								break;
			        		}

			        	}else{
			        		
			        		if(inCart){

			        			inCart.setQuantity(quantity, false);
			        			//$rootScope.$broadcast('alcoholCart:itemAdded', response.data);

			        		}else{

			        			//$rootScope.$broadcast('alcoholCart:itemAdded', response.data);
				        		var newItem = new alcoholCartItem(id, quantity, serveAs, response.data);
								_self.$cart.products[id] = newItem;
								//$rootScope.$broadcast('alcoholCart:itemAdded', newItem);

			        		}

							$rootScope.$broadcast('alcoholCart:change', {});

			        	}
			        });

				}

			)

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



		this.$restore = function(storedCart){

			var _self = this;

			_self.init();
			
			angular.copy(_self.$cart,storedCart);

			this.setServices(function(){
				_self.$save();
			});

			// angular.forEach(storedCart.products, function (item) {
			// 	_self.$cart.items.push(new alcoholCartItem(item._id,  item._name, item._price, item.quantity, item._data));
			// });

			
		};

		this.$save = function () {
			
			var that=this;

			store.set(this.getCart(),function(){

			});

		}

	}]);

AlcoholDelivery.factory('alcoholCartItem', ['$rootScope', '$log', function ($rootScope, $log) {

		var item = function (id, quantity, servedAs, data) {
			this.setId(id);
			//this.setPrice(price);
			this.setQuantity(quantity);
			this.setLastServedAs(servedAs);
			this.setData(data);
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

		item.prototype.setPrice = function(price){
			var priceFloat = parseFloat(price);
			if (priceFloat) {
				if (priceFloat <= 0) {
					$log.error('A price must be over 0');
				} else {
					this._price = (priceFloat);
				}
			} else {
				$log.error('A price must be provided');
			}
		};

		item.prototype.getPrice = function(){
			return this._price;
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

		item.prototype.setData = function(data){
			if (data) this.product = data;
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

AlcoholDelivery.service('store', ['$window','$http','CartSession', function ($window,$http,CartSession) {

		return {

			get: function (key, cb) {
				
				if(typeof key == "function" && !cb) cb=key;
				if(!cb) cb = function(){};

				if ( $window.localStorage.getItem(key) ){
							
					CartSession.GetDeliveryKey().then(

						function(response){

							$http.get("cart/"+response.deliverykey+"/").then(function(response){
								cb(undefined, response.data);
							})
							// .error(function(error){
							// 	cb(error);
							// })
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