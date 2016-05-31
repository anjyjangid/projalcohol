AlcoholDelivery.service('alcoholWishlist', ['$rootScope', '$window', '$http', '$q', 'wishlistProduct', function ($rootScope, $window, $http, $q, wishlistProduct) {

		this.init = function(){

			var _self = this;
			this.$wishlist = [];


			$http.get("wishlist",{

			}).error(function(data, status, headers) {

			}).success(function(response) {

				_self.$restore(response.list);

			})

			
		};

		this.add = function (id) {

			var _self = this;
			var isInList = _self.getProductById(id);

			var d = $q.defer();
			
			$http.post("wishlist", {"id":id},{

			}).error(function(data, status, headers) {

				d.reject(data);

			}).success(function(response) {

				if(response.success){

					if(!isInList){
						
			    		var newProduct = new wishlistProduct(id, response.product);
						_self.$wishlist.push(newProduct);
						
					}

					$rootScope.$broadcast('alcoholWishlist:change', {});

					d.resolve(response);

				}else{
					d.reject(response);
				}

			});

			return d.promise;				

		};
		
		this.getProductById = function (productId) {

			var lists = this.getList();
			var build = false;
			
			angular.forEach(lists, function (product) {
				if  (product.getId() === productId) {
					build = product;
				}
			});
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

		this.setWishlist = function (list) {
			this.$wishlist = list;
			return this.getList();
		};

		this.getList = function(){
			return this.$wishlist;
		};	
		
		this.getTotalProducts = function () {
			var items = this.getList();
			return items.length;
		};
		
		this.remove = function (index) {
			var item = this.$wishlist.items.splice(index, 1)[0] || {};
			$rootScope.$broadcast('alcoholWishlist:itemRemoved', item);
			$rootScope.$broadcast('alcoholWishlist:change', {});

		};

		this.removeById = function (id) {
			$rootScope.$broadcast('alcoholWishlist:itemRemoved', id);
			// var item;
			// var list = this.getList();
			// angular.forEach(list, function (product, index) {
			// 	if(product.getId() === id) {
			// 		item = list.splice(index, 1)[0] || {};
			// 	}	
			// });
			// this.setList(list);
			// $rootScope.$broadcast('alcoholWishlist:itemRemoved', item);
			// $rootScope.$broadcast('alcoholWishlist:change', {});
		};

		this.setList = function (list) {
			this.$wishlist = list;
			return this.getList();
		};

		this.empty = function () {
			
			$rootScope.$broadcast('alcoholWishlist:change', {});
			this.$wishlist = [];
			$window.localStorage.remove('deliverykey');

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

		this.$restore = function(products){

			var _self = this;

			angular.forEach(products, function (product,key) {

				var newProduct = new wishlistProduct(product._id, product);
				_self.$wishlist.push(newProduct);
				
			});
			
		};

	}]);



AlcoholDelivery.factory('wishlistProduct', ['$rootScope', '$log', function ($rootScope, $log){

		var product = function (id, data) {

			this.setId(id);
			//this.setPrice(data);
			this.setName(data.name);
			this.setAddedSlug(data.wishlist.added_slug);			
			this.setAvailability(data.quantity);
			this.setOriginal(data);

		};

		product.prototype.setId = function(id){
			if (id)  this._id = id;
			else {
				$log.error('An ID must be provided');
			}
		};

		product.prototype.getId = function(){
			return this._id;
		};	

		product.prototype.setName = function(name){
			if (name)  this._name = name;
			else {
				$log.error('A name must be provided');
			}
		};

		product.prototype.getName = function(){
			return this._name;
		};

		product.prototype.setPrice = function(original){			
			
			var advancePricing = original.advance_order;
			var unitPrice = parseFloat(original.price);

			if(advancePricing.type==1){

				unitPrice += parseFloat(unitPrice * advancePricing.value/100);

			}else{

				unitPrice += parseFloat(advancePricing.value);

			}
			
			price = parseFloat(unitPrice.toFixed(2));

			return this._price = price;
			
		};

		product.prototype.getPrice = function(){

			return this._price;

		};


		product.prototype.setAvailability = function(quantity){
			
			return this._isAvailable = parseInt(quantity)>0;
			
		};

		product.prototype.getAvailability = function(){
			return this._isAvailable;
		};


		product.prototype.setOriginal = function(data){
			
			return this._original = data;	
			
		};

		product.prototype.getOriginal = function(){
			return this._original;
		};

		product.prototype.setAddedSlug = function(slug){
			return this._addedSlug = slug;	
		};

		product.prototype.getAddedSlug = function(){
			return this._addedSlug;
		};

		

		product.prototype.toObject = function() {
			return {
				id: this.getId(),
				name: this.getName(),
				price: this.getPrice(),
				quantity: this.getQuantity(),
				data: this.getData(),
				total: this.getTotal()
			}
		};

		return product;

	}]);