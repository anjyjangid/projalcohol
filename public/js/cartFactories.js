angular.module('AlcoholCartFactories', [])
.factory('alcoholCartSale', ['$log', function ($log){

	var saleObj = function (sale,detail) {

		this.setParams(sale);

		this.setSaleDetail(detail);

		this.setPrices(detail);

		this.setProductsQtyArr();

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

	saleObj.prototype.setProductsQtyArr = function(){

		angular.forEach(this.products, function (pro) {
			
			pro.productQtyArr = new Array();

			for (i = 0; i < pro.quantity; i++) { 
				pro.productQtyArr.push(i)
			}
			
			
		});

		angular.forEach(this.action, function (pro) {

			pro.productQtyArr = new Array();

			for (i = 0; i < pro.quantity; i++) { 
				pro.productQtyArr.push(i)
			}

		});

	}

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
			 
		}else{

			if(detail.discountType==1){

				if(detail.actionProductId.length>0){

					currPrice = price - detail.discountValue;
					//currPrice = price - currPrice;

				}else{

					currPrice = price - detail.discountValue;

				}


			}else{

				if(detail.actionProductId.length>0){

					currPrice = price - (actionProPrice * detail.discountValue / 100);

				}else{

					currPrice = price - (price * detail.discountValue / 100);

				}

			}

		}
		this.totalDiscount = (parseFloat(price) - parseFloat(currPrice)).toFixed(2);
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

.factory('alcoholCartItem', ['$rootScope', '$log', '$filter', function ($rootScope, $log, $filter){

	var item = function (id, data) {
		
		try{
			this.setId(id);
			this.setProduct(data);
			this.setChilledAllowed(data.product.chilled);
			this.setRQuantity(data.chilled.quantity,data.nonchilled.quantity);

			this.setRChilledStatus(data.chilled.status,data.nonchilled.status);
			this.setRemainingQty(data.remainingQty);
			this.setTQuantity(data.quantity);
			this.setSale(data.sale); //sale should be ser prior setprice
			this.setPrice(data);
			this.setLastServedAs(data.lastServedChilled);
			
			this.setIcon();
		}
		catch(err){
			
			console.log(err);
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

	item.prototype.setChilledAllowed = function(chillAllowed){
		return this.chillAllowed = chillAllowed;
	}

	item.prototype.getChilledAllowed = function(){
		return this.chillAllowed;
	}

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

	item.prototype.setSalePrice = function(sale){
		
		var price = this.unitPrice;
		var quantity = this.getRemainingQty();

		if(sale.discountType==2){
			price = price - (price * sale.discountValue / 100);
		}else{
			price = price - sale.discountValue;
		}

		this.discountedUnitPrice = price;

		price = price * quantity;

		this.price = price;
	}

	item.prototype.setPrice = function(product){

		if(!angular.isDefined(product)){

			if(angular.isDefined(this.product)){
				var original = this.product;
			}else{
				console.log("Product original detail is missing");
			}

		}else{
			var original = product.product;
		}

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
		this.discountedUnitPrice = price;

		if(this.isSingleSale){
			
			this.setSalePrice(this.sale);
			return false;

		}
		
		//IF BULK IS DISABLE
		if(original.bulkDisable == 0){

			var bulkArr = original.express_delivery_bulk.bulk;

			for(i=0;i<bulkArr.length;i++){

				var bulk = bulkArr[i];

				if(quantity >= bulk.from_qty && quantity<=bulk.to_qty){

					if(bulk.type==1){

						price = originalPrice + (originalPrice * bulk.value/100);

					}else{

						price = originalPrice + bulk.value;

					}

					this.discountedUnitPrice = price.toFixed(2);

					price = parseFloat(this.discountedUnitPrice * quantity);
				}

			}	

			return this.price = price;

		}

		return this.price = parseFloat(price * quantity);

	};

	item.prototype.setCoupon = function(coupon){
		var cType = coupon.type;
		var cDiscount = coupon.discount;
		var cDiscountStatus = parseInt(coupon.discount_status);
		var cTotal = coupon.total;
		var cProducts = coupon.products;
		var cCategories = coupon.categories;

		var amtAfterCouponDis = 0;
		var pAmount = 0;
		var hasProduct = 0;
		var hasCategory = 0;
		var quantity = this.remainingQty;
		var couponDisAmt = 0;
		var couponMessage = '';
		var returnVal = {};

		if(typeof cProducts !== "undefined"){
			if (cProducts.length > 0) {
				if(cProducts.indexOf(this._id) == -1) {
					hasProduct = 1;
				}
			}
		}

		if(typeof cCategories !== "undefined"){
			if (cCategories.length > 0) {
				angular.forEach(this.product.categories, function (pCat) {
					if(cCategories.indexOf(pCat) > -1) {
						hasCategory = 1;
					}	
				});
			}
		}		

		if(hasProduct || hasCategory){
			if(cDiscountStatus==1){
				pAmount = this.unitPrice*quantity;
			}else{
				pAmount = this.discountedUnitPrice*quantity;
			}

			// Calculate coupon discount
			if(cType==1){			
				couponDisAmt = cDiscount*quantity ;
			}else{
				couponDisAmt = (pAmount*cDiscount)/100;
			}

			//In case coupon dis is more than product price
			if(couponDisAmt>pAmount){
				couponDisAmt = pAmount;
			}

			amtAfterCouponDis = pAmount - couponDisAmt;

			if(cDiscountStatus==1){ // 1 is set to check discount from other sources like single sale NOTE single sale :)

				var proAmtAfterOtherDiscount =  this.discountedUnitPrice*quantity;

				if(amtAfterCouponDis > proAmtAfterOtherDiscount){
					
					couponDisAmt = 0; // if discount from other sources is more than coupon don't apply coupon discount

				}else{

					var diffAmt = proAmtAfterOtherDiscount - amtAfterCouponDis;

					couponDisAmt = 0;
					if(diffAmt>0){
						couponDisAmt = diffAmt;
					}
				}

			}

			this.couponDiscount = couponDisAmt.toFixed(2);
			this.couponMessage = couponMessage;

			
		}else{
			couponMessage = 'Coupon is not valid on these products.';
			this.couponMessage = couponMessage;
		}

		returnVal.couponMessage = this.couponMessage;
		returnVal.couponAmount = couponDisAmt.toFixed(2);

		return returnVal;		
	}

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

	item.prototype.getRemainQtyPrice = function(){

		var remainQty = this.getRemainingQty();
		if(remainQty<1){
			return 0;
		}
		return +parseFloat(this.getPrice()).toFixed(2);

	};

	item.prototype.setSale = function(sale){

		this.sale = sale;

		if(sale && sale.conditionQuantity==1 && sale.actionProductId.length==0){
			this.isSingleSale = true;
		}

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

}])

.factory('alcoholCartLoyaltyItem', ['$log','$filter', function ($log,$filter){

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

		this.loyaltyValue.unitPoint = this.loyaltyValue.point;
		this.loyaltyValue.unitPrice = this.loyaltyValue.price;

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

}])

.factory('alcoholCartPackage', ['$rootScope', '$log', '$filter', function ($rootScope, $log, $filter){

	var package = function (id, uniqueId, data) {

		this.setId(id);
		this.setUniqueId(uniqueId);
		this.setName(data.title);
		this.setQuantity(data.packageQuantity);
		this.setPrice(data.packagePrice);
		this.setOriginal(data);
		this.setProducts(data.products);
		this.setPackageItems();

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

	package.prototype.setProducts = function(products){

		return this._products = products;
	}

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

	package.prototype.getOldQuantity = function(){
		return this._oldQuantity || 0;
	}

	package.prototype.setQuantity = function(quantity){
		this._maxquantity = 100;
		if (quantity){

			this._oldQuantity = quantity;
			this._quantity = quantity;

		}

	};

	package.prototype.getQuantity = function(){
		if (this._quantity) return this._quantity;
		else $log.info('This package quantity has some issue');
	};

	package.prototype.setSaving = function(saving){

		if (saving){ this._saving = parseFloat(saving) }
		else { $log.info('This package saving has some issue') };

	};

	package.prototype.getProductsCount = function(){

		var products = {};

		angular.forEach(this._products,function(product){

			products[product._id] = product.quantity;

		})

		return products;

	}

	package.prototype.setUnitPrice = function(unitPrice){
		this._unitPrice = unitPrice;
	}

	package.prototype.setPrice = function(price){

		if(typeof price =='undefined' && typeof this._price !== 'undefined'){
			price = this._unitPrice;
		}


		var unitPrice = parseFloat(price);

		this.setUnitPrice(unitPrice);

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

	package.prototype.setPackageItems = function(){
		angular.forEach(this.original.packageItems,function(packageItem,packageKey){
			angular.forEach(packageItem.products,function(product,productKey){									
				product.quantityAdded = product.cartquantity;				
			});
		});

	};

	return package;

}])

.factory('alcoholCartCreditCard',[function(){

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

}])

.factory('alcoholCartGiftCard',[function(){

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

}])

.factory('alcoholCartGift',["$log", "giftProduct",function($log, giftProduct){

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
			this.setType('container');
			this.setProducts(giftData.products);
			this.gsLimit(giftData.limit);
		}

	}
	gift.prototype.setType = function(type){

		if(type)
		this.type = type
	}

	gift.prototype.getType = function(){
		return this.type;
	}

	gift.prototype.isContainer = function(){

		if(this.getType()==='container')
		return true;
		return false;		
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

}])

.factory('giftProduct', ['$rootScope', '$q', '$http', '$log', function ($rootScope, $q, $http, $log){

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

}])

.factory('GiftingProduct',['$filter',function($filter){

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

}])

.factory('alcoholCartPromotion',['$log','$filter',function($log,$filter){

	var oPromotion = function(promotion,product,chilled){

		this.setPromotion(promotion);
		this.setProduct(product);
		this.setPrice(product);
		this.setChilledStatus(chilled);

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
			_isChilledAllowed : product.chilled,
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

		var unitPrice = parseFloat(product.price);

		var advancePricing = product.regular_express_delivery;

		if(advancePricing.type==1){

			unitPrice +=  parseFloat(unitPrice * advancePricing.value/100);

		}else{

			unitPrice += parseFloat(advancePricing.value);

		}
		
		this.product.unDiscountedPrice = unitPrice.toFixed(2);

	}

	

	oPromotion.prototype.setChilledStatus = function(status){

		if(status===true){
			this.chilled = true;
		}else{
			this.chilled = false;
		}		

	}
	

	oPromotion.prototype.getPrice = function(){
		return parseFloat(this.product._price);
	}

	return oPromotion;

}])

.factory('AlcoholProduct',[
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
		this.bulkDisable = p.bulkDisable;
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
			imageLink:pSale.imageLink			
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
		catData = angular.copy(catPricing.categoryPricing[categoryKey]);

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

				if (angular.isDefined(p.price) && !(p.price<0)){

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

						//CHECK IF BULK IS ENABLE FOR THE PRODUCT
						if(this.bulkDisable == 0){
							
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
		this.loyalty = p.loyalty;
		this.loyaltyType = p.loyaltyType;
		
		this.metaTitle = p.metaTitle;
		this.metaDescription = p.metaDescription;
		this.metaKeywords = p.metaKeywords;
		

	}

	product.prototype.addToCart = function() {

		var _product = this;

		var defer = $q.defer();

		if(typeof _product.proUpdateTimeOut!=="undefined"){

			$timeout.cancel(_product.proUpdateTimeOut);

		}

		_product.proUpdateTimeOut = $timeout(function(){

			_product.qChilled = _product.qChilled | 0;
			_product.qNChilled = _product.qNChilled | 0;

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

	product.prototype.getLoyaltyValue = function(){
		var lv = parseFloat(this.loyalty);
		if(this.loyaltyType == 0){
			lv = parseFloat(this.price) * parseFloat(this.loyalty)/100;
		}
		return lv.toFixed(2);
	};



	return product;

}])

.factory('CreditCertificate',[
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