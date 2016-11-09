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
			 currPrice = currPrice * qty;

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

			this.setRQuantity(data.chilled.quantity,data.nonchilled.quantity);

			this.setRChilledStatus(data.chilled.status,data.nonchilled.status);
			this.setRemainingQty(data.remainingQty);
			this.setTQuantity(data.quantity);
			this.setSale(data.sale); //sale should be ser prior setprice
			this.setPrice(data);
			this.setLastServedAs(data.lastServedChilled);
			this.setProduct(data);
			

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

		if(this.isSingleSale){

			this.setSalePrice(product.sale);
			return false;
		}

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
			this.discountedUnitPrice = parseFloat((price/quantity).toFixed(2));
			console.log(this.discountedUnitPrice,quantity);
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

.factory('alcoholCartPackage', ['$rootScope', '$log', function ($rootScope, $log){

	var package = function (id, uniqueId, data) {

		this.setId(id);
		this.setUniqueId(uniqueId);
		this.setName(data.title);
		this.setQuantity(data.packageQuantity);
		this.setPrice(data.packagePrice);
		this.setOriginal(data);
		this.setProducts(data.products);

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
			console.log(quantity);
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