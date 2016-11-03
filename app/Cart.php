<?php

namespace AlcoholDelivery;

use Moloquent;

use AlcoholDelivery\Setting as Setting;
use AlcoholDelivery\Products as Products;
use AlcoholDelivery\Packages as Packages;
use AlcoholDelivery\Credits as Credits;
use AlcoholDelivery\Promotion;
use AlcoholDelivery\Gift;

use MongoId;
use MongoDate;

class Cart extends Moloquent
{
	protected $primaryKey = "_id";
	protected $collection = 'cart';
	public static $key;
	/**
	 * Indicates if the model should be timestamped.
	 *
	 * @var bool
	 */
	public $timestamps = true;

	 /**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [

						'_id',
						'products',
						'loyalty',
						'packages',
						'giftCards',
						'nonchilled',
						'delivery',
	 					'service',
						'discount',
						'timeslot',
						'payment',
						'status',
						'user',
						'reference'
					];

	public function setKey($keyVal){
		$this->key = $keyVal;
	}

	public function setServices($cart){

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value'])->first();

		$services = $services['settings'];

		$cart["service"]["express"]["charges"] = $services['express_delivery']['value'];
		$cart["smoke"]["charges"] = $services['cigratte_services']['value'];

		$cart["service"]["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value'],
							];

		$cart["discount"]["nonchilled"]["exemption"] = $services['non_chilled_delivery']['value'];

		return $cart;

	}

	public function generate(){

		$cart = [

			"products" => (object)[],
			"packages" => [],
			"promotions" => (object)[],
			"sales" => [],
			"delivery" => [
				"type" => 0,
				"charges" => null,
				"address" => null,
				"contact" => null,
				"instruction" => null,
				"leaveatdoor" => false,
				"instructions" => null,
			],
			"service" => [
				"express" => [
					"status" => false,
					"charges" => null
				],
				"smoke" => [
					"status" => false,
					"charges" => null
				],
				"delivery" => [
					"free" => false,
					"charges" => null,
					"mincart" => null
				],
			],
			"discount" => [
				"nonchilled" => [
					"status" => false,
					"exemption" => null
				]
			],
			"timeslot" => [
				"datekey"=>false,
				"slotkey"=>false,
				"slug"=>"",
				"slotslug"=>""
			],
			"payment" => [
				"subtotal" => null,
				"total" => null,
				"method" => "COD",
			],
			"nonchilled" => false,
			"status" => 0,
			"user" => null,
		];


		$cart = self::setServices($cart);
		
		try{
			
			$cart = self::create($cart);
			$cart = $cart->toArray();		

			$cart['products'] = (object)$cart['products'];
			$cart['packages'] = (object)$cart['packages'];


			return (object)array("success"=>true,"message"=>"cart generated succesfully","cart"=>$cart);

		}catch(Exception $e){

			return (object)array("success"=>false,"message"=>$e->getMessage());

		}		

	}

	public static function findUpdated($id){

		$cart = self::find($id);

		if(empty($cart)){
			return false;
		}

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.express_delivery.applicablePostalCodes','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value'])->first();

		$services = $services['settings'];

		$cartServices = $cart->service;

		$cartServices["express"]["charges"] = $services['express_delivery']['value'];

		$cartServices["smoke"]["charges"] = $services['cigratte_services']['value'];
		

		$cartServices["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value'],
							];

		$cart->service = $cartServices;							
		$cart->applicablePostalCodes = $services['express_delivery']['applicablePostalCodes'];
		$cartDiscount = $cart->discount;							
		$cartDiscount['nonchilled']['exemption'] = $services['non_chilled_delivery']['value'];
		$cart->discount = $cartDiscount;


		// code to apply filters so invalid data dosen't get fetch//

		// foreach ($cart->products as $key => $product) {

		// 	if($product['quantity']<0){
		// 		unset($cart['products'][$key]);
		// 	}

		// }



		try{

			$cart->save();			
			return $cart;

		}catch(\Exception $e){

			return false;
			
		}

	}

	public function getProductIncartCount($data = ''){
		
		if($data === ''){
			$data = $this;
		}
		
		$products = [];

		if(isset($data['products'])){
			foreach($data['products'] as $key=>$product){
				
				$products[$key] = (int)$product['chilled']['quantity'] +  (int)$product['nonchilled']['quantity'];

			}
		}

		if(isset($data['loyalty'])){
			foreach($data['loyalty'] as $key=>$product){
				
				$lPQty = (int)$product['chilled']['quantity'] +  (int)$product['nonchilled']['quantity'];

				if(isset($products[$key])){

					$products[$key]+= $lPQty;

				}else{

					$products[$key] = $lPQty;

				}				

			}
		}

		if(isset($data['packages'])){
			foreach($data['packages'] as $key=>$package){
				
				foreach($package['products'] as $product){

					if(isset($products[$product['_id']])){

						$products[$product['_id']] = (int)$products[$product['_id']] + ((int)$package['packageQuantity'] * (int)$product['quantity']);

					}else{

						$products[$product['_id']] = (int)$package['packageQuantity'] * (int)$product['quantity'];

					}

				}
			

			}
		}

		if(isset($data['promotions'])){
			foreach($data['promotions'] as $promotion){

				if(isset($products[$promotion['productId']])){

					$products[$promotion['productId']]++;

				}else{

					$products[$promotion['productId']] = 1;

				}

			}
		}

		return $products;

	}

	public function getAllProductsInCart($data){

		$products = $this->getProductIncartCount($data);

		$productObj = new products();
		$productsIdInCart = array_keys($products);

		$productsInCart = $productObj->getProducts(
											array(
												"id"=>$productsIdInCart,
												"fields"=>[
															"quantity",
															"maxQuantity",
															"outOfStockType",
															"availabilityDays",
															"availabilityTime",
															"status",
															"price",
															"loyalty",
															"loyaltyType",
														],
												// "with"=>["discounts"]
											)
										);
		if($productsInCart){
			foreach($productsInCart as $key=>$pic){

				$productsInCart[$pic['_id']] = $pic;
				$productsInCart[$pic['_id']]['count'] = $products[$pic['_id']];

				unset($productsInCart[$key]);

			}

			return $productsInCart->toArray();
		}
		return [];
	}

	public function setReference(){

		$reference = "ADSG";
		$reference.= ((int)date("ymd",strtotime($this->updated_at)) - 123456);			
		$reference.="O";			
		$reference.= (string)date("Hi",strtotime($this->updated_at));

		$this->reference = $reference;
		
	}

	public function getLoyaltyCards(){

		if(isset($this->loyaltyCards)){
			
			return $this->loyaltyCards;

		}

		return [];
	}

	private function getProductById($id){

		if(isset($this->products[$id]))
			return $this->products[$id];

		return false;
	}

	public function setSaleRemove($proId,$updateParams){
		
		$response = [
			'success' => false,
			'message' => '',			
		];

		$cartSales = $this->sales;
		$currProduct = $this->getProductById($proId);

		$qtyToReduce = abs($updateParams['chilled']['quantity']) + abs($updateParams['nonchilled']['quantity']);

		if($currProduct['remainingQty']<$qtyToReduce){

			$difference = $qtyToReduce - $currProduct['remainingQty'];

			for($i=count($cartSales)-1;$i>=0;$i--) {
				
				$sale = $cartSales[$i];

				$foundInSale = [
					'status' => false,
					'qty' => 0
				];
				foreach ($sale['products'] as $salePro) {
					
					if($salePro['_id']===$proId){

						$foundInSale['status'] = true;
						$foundInSale['qty']+= (int)$salePro['quantity'];

					}

				}

				if(isset($sale['action'])){
					foreach ($sale['action'] as $salePro) {
						
						if($salePro['_id']===$proId){

							$foundInSale['status'] = true;
							$foundInSale['qty']+= (int)$salePro['quantity'];

						}

					}
				}
				
				if($foundInSale['status']===true){

					$difference-=$foundInSale['qty'];
					array_splice($cartSales,$i,1);					

				}

				if($difference<0){
					break;
				}

			}

		}

		$this->__set("sales",$cartSales);
		
		$this->setRemainingQty();

		return $response;

	}

	private function setRemainingQty(){

		$saleProducts = [];

		if($this->sales)
			foreach ($this->sales as $sale) {

				foreach ($sale['products'] as $salePro) {
					
					if(isset($saleProducts[$salePro['_id']])){

						$saleProducts[$salePro['_id']]+= (int)$salePro['quantity'];

					}else{

						$saleProducts[$salePro['_id']] = (int)$salePro['quantity'];

					}

				}

				if(isset($sale['action'])){
					foreach ($sale['action'] as $salePro) {
						
						if(isset($saleProducts[$salePro['_id']])){

							$saleProducts[$salePro['_id']]+= (int)$salePro['quantity'];

						}else{

							$saleProducts[$salePro['_id']] = (int)$salePro['quantity'];

						}

					}
				}

			}

		$cartProducts = $this->products;

		foreach ($cartProducts as $key => &$cPro) {

			$totalQty = $cPro['chilled']['quantity'] + $cPro['nonchilled']['quantity'];

			if(isset($saleProducts[$key])){

				$totalQty-=$saleProducts[$key];

			}

			$cPro['remainingQty'] = $totalQty;

		}

		$this->__set('products',$cartProducts);

	}

	public function setSaleAdd($proId,$updateParams){

		$remainingQty = $updateParams['quantity'];		

		$products = $this->products;
		$sales = isset($this->sales)?$this->sales:[];
		
		$currProduct = $this->getProductById($proId);

		$qty = $updateParams['chilled']['quantity'] + $updateParams['nonchilled']['quantity'];

		// Check any product is required newly added product to create a sale.

		foreach($products as $productId=>$product){
			
			if(isset($product['sale']) && $product['remainingQty']>0){
				
				$isAble = $this->canCreateSale($productId,$proId,$qty,$updateParams['sale']);

				if($isAble===false){
					continue;
				}

				$saleObj = [
					'_id' => new MongoId(),
					'products'=>[],
					'sale' => $product['sale']['_id'],
					'chilled' => true,
					'created_at' => new MongoDate()
				];

				foreach($isAble as $key=>$saleProQty){

					switch($key){

						case 'new': {

							// $qty-=$saleProQty;

							$saleObj['products'][] = [

								'_id' => $proId,
								'quantity' => $saleProQty

							];

						}
						break;
						case 'action': {							

							foreach($saleProQty as $actionProKey=>$actionProQty){

								// $qty-=$actionProQty;
								$saleObj['action'][] = [

									'_id' => $actionProKey,
									'quantity' => $actionProQty

								];

							}							

						}
						break;
						default : {

							$products[$key]['remainingQty']-=$saleProQty;							

							$saleObj['products'][] = [

								'_id' => $key,
								'quantity' => $saleProQty

							];
						}

					}

				}
				
				$sales[] = $saleObj;

			}

		}

		// Check after fullfilling all products requirement is still newly add product able to create a sale.		

		if($currProduct!==false){

			$products[$proId]['chilled']['quantity']+= $updateParams['chilled']['quantity'];
			$products[$proId]['nonchilled']['quantity']+= $updateParams['nonchilled']['quantity'];
			$products[$proId]['quantity'] = $products[$proId]['chilled']['quantity'] + $products[$proId]['nonchilled']['quantity'];

		}else{
			
			$products[$proId] = $updateParams;
			$products[$proId]['remainingQty'] = 0;

		}

		if($qty<0){
			prd("quantity never less than zero");
		}

		$products[$proId]['remainingQty']+= $qty;
				
		$this->__set("products",$products);

		$this->__set("sales",$sales);

	}

	private function canCreateSale($cartProId,$newProId,&$newProQty,$newProSale){

		$products = $this->products;
		$product = $products[$cartProId];		

		$sale = $product['sale'];

		$unManipulatedProducts = $products;		

		$productToCreateSale = $this->getProductToCreateSale($products,$sale['_id'],$sale['conditionQuantity']);

		if($productToCreateSale===false){
			return false;
		}

		$totalAvail = 0;
		foreach ($productToCreateSale as $saleProkey => $qty) {
			$totalAvail+= $qty;
		}

		$furtherRequired = 0;

		if($totalAvail<$sale['conditionQuantity']){

			$furtherRequired = $sale['conditionQuantity'] - $totalAvail;

		}

		if($furtherRequired>0){
						
			if((string)$sale['_id'] !== (string)$newProSale['_id'] || $furtherRequired>$newProQty){
				$products = $unManipulatedProducts;
				return false;
			}
			
			$newProQty-=$furtherRequired;
			$productToCreateSale['new'] = $furtherRequired;

		}

		// check action product dependency
		if(count($sale['actionProductId'])==1){

			$productToCreateSale['action'] = [];

			$actionQty = 1;

			if($sale['actionType']==1){
				$actionQty = $sale['giftQuantity'];
			}

			$conditionProductId = $sale['actionProductId'][0];

			// check action product exist in cart or not
			if(isset($products[$conditionProductId])){

				$actionPro = $products[$conditionProductId];				

				if($actionPro['remainingQty']>$actionQty){

					$actionPro['remainingQty']-=$actionQty;
					$productToCreateSale['action'][$conditionProductId] = $actionQty;
					$actionQty = 0;

				}else{

					$productToCreateSale['action'][$conditionProductId] = $actionPro['remainingQty'];
					$actionQty-= $actionPro['remainingQty'];
					$actionPro['remainingQty']=0;

				}


			}

			// if action product is not full fill and new product is also action product then get it from them
			if($actionQty>0 && $conditionProductId == $newProId){

				if(!isset($productToCreateSale['action'][$newProId])){
					$productToCreateSale['action'][$newProId] = 0;
				}

				while($newProQty>0 && $actionQty>0){

					$newProQty--;
					$actionQty--;
					$productToCreateSale['action'][$newProId]++;

				}

			}

			if($actionQty>0){
				$products = $unManipulatedProducts;
				return false;
			}


			// condition due for free product automatically add process :)
			// if($actionQty>0 && $sale['actionType']==1) {


			// }else{

			// 	return false;

			// }


		}

		return $productToCreateSale;

	}	

	//	Is cart products fullfill quantity condition.
	private function getProductToCreateSale(&$products,$saleId,$quantity){

		$salePro = [];

		foreach($products as $key=>&$product){

			if(!isset($product['sale']) || empty($product['sale'])){continue;}

			$proSale = $product['sale'];

			if((string)$proSale['_id'] === (string)$saleId && $product['remainingQty']>0){
				
				if($product['remainingQty']>=$quantity){

					$salePro[$key] = $quantity;

				}else{

					$quantity-=$product['remainingQty'];
					$salePro[$key] = $product['remainingQty'];

				}

				$product['remainingQty']-= $salePro[$key];

			}

			if($quantity===0){
				break;
			}

		}

		if(count($salePro))
		return $salePro;
		return false;


	}

	private function addSale($sale,$salePro,$actionPro){

		$sale = [
			"sale" => $sale,
			"salePro" => $salePro,
			"actionPro" => $actionPro
		];
		
		$this->sale[] = $sale;

	}

	public function createAllPossibleSales(){

		$products = $this->products;
		$sales = isset($this->sales)?$this->sales:[];

		foreach ($products as $key => $product) {			

			if((isset($product['remainingQty']) && $product['remainingQty'] < 1) || !isset($product['sale']) || empty($product['sale'])) {
				continue;
			}

			$sale = $product['sale'];

			$isAble = true;
			
			while($isAble && $product['remainingQty']>0){
				
				$unManipulatedProducts = $products;

				$productToCreateSale = $this->getProductToCreateSale($products,$sale['_id'],$sale['conditionQuantity']);


				if($productToCreateSale === false){
					$isAble = false;
					$products = $unManipulatedProducts;
					continue;
				}

				$totalAvail = 0;
				foreach ($productToCreateSale as $saleProkey => $qty) {
					$totalAvail+= $qty;
				}

				if($totalAvail<$sale['conditionQuantity']){
					$isAble = false;
					$products = $unManipulatedProducts;
					continue;
				}

				// check action product dependency
				if(count($sale['actionProductId'])==1){

					$productToCreateSale['action'] = [];

					$actionQty = 1;

					if($sale['actionType']==1){
						$actionQty = $sale['giftQuantity'];
					}

					$conditionProductId = $sale['actionProductId'][0];

					// check action product exist in cart or not
					if(isset($products[$conditionProductId])){

						$actionPro = $products[$conditionProductId];

						if($actionPro['remainingQty']>=$actionQty){

							$actionPro['remainingQty']-=$actionQty;
							$productToCreateSale['action'][$conditionProductId] = $actionQty;
							$actionQty = 0;

						}

					}				

					if($actionQty>0){
						$isAble = false;
						$products = $unManipulatedProducts;
						continue;
					}				
					
				}
				
				$saleObj = [
					'_id' => new MongoId(),
					'products'=>[],
					'sale' => $sale['_id'],
					'chilled' => true,
					'created_at' => new MongoDate()
				];

				foreach($productToCreateSale as $key=>$saleProQty){

					switch($key){

						case 'action': {							

							foreach($saleProQty as $actionProKey=>$actionProQty){
								
								$saleObj['action'][] = [

									'_id' => $actionProKey,
									'quantity' => $actionProQty

								];

							}							

						}
						break;
						default : {						

							$saleObj['products'][] = [

								'_id' => $key,
								'quantity' => $saleProQty

							];
						}

					}

				}

				
				$sales[] = $saleObj;
			}
			
			
		}		
			
		$this->__set("products",$products);

		$this->__set("sales",$sales);

		$this->setRemainingQty();		

	}	

	public function removeSaleById($id){

		$sales = $this->sales;
		$removed = false;
		
		$response = [
			"success" => false,
			"message" => ""
		];


		foreach ($sales as $index => $sale) {
			
			if((string)$sale['_id'] == $id){
				
				$removed = array_splice($sales,$index,1);				
				break;

			}

		}

		if($removed !==  false){

			$isProSet = $this->setProductsOnSaleRemoved($removed[0]);

			if($isProSet){

				$this->validateGiftContainers();
				$this->__set('sales',$sales);
				$response['success'] = true;
			}

		}



		return $response;		

	}

	public function validateGiftContainers(){

		$productsInCart = $this->getProductIncartCount();
		$giftContainersInCart = $this->getContainerGiftsInCart();
		
		foreach($giftContainersInCart as $i=>$cGift){
			
			if(empty($cGift['products'])){continue;}

			foreach($cGift['products'] as &$product){

				if(isset($productsInCart[$product['_id']])){
					
					$qtyInCart = $productsInCart[$product['_id']];

					if($qtyInCart > 0){
						
						if($qtyInCart<$product['quantity']){
							$product['quantity'] = $qtyInCart;
						}

						$productsInCart[$product['_id']]-=$product['quantity'];

						continue;
					}

				}

				$product['quantity'] = 0;

			}

			$giftContainersInCart[$i] =  $cGift;

		}
		
		foreach($giftContainersInCart as $giftKey=>&$cGift){

			if(empty($cGift['products'])){continue;}

			foreach($cGift['products'] as $key=>&$product){

				if($product['quantity']<1){

					unset($giftContainersInCart[$giftKey]['products'][$key]);
				}

			}

			if(count($cGift['products'])==0){

				unset($giftContainersInCart[$giftKey]);

			}

		}
		
		$this->__set("gifts",$giftContainersInCart);

	}


	public function getContainerGiftsInCart(){
		
		if(isset($this->gifts))
			return $this->gifts;

		return [];

	}
	/**
	 * To set products remaining quantity after sale removed
	 *
	 * @var array $sale (Removed sale array)
	**/
	private function setProductsOnSaleRemoved($sale){

		$sale['action'] = isset($sale['action'])?$sale['action']:[];
		$products = array_merge($sale['products'],$sale['action']);
		$toRemove = [];
		foreach ($products as $value) {
			$toRemove[$value['_id']] = $value['quantity'];
		}

		$saleProducts = $this->products;

		foreach ($toRemove as $key => $value) {

			$qtyChilled = (int)$saleProducts[$key]['chilled']['quantity'];
			$qtyNonChilled = (int)$saleProducts[$key]['nonchilled']['quantity'];

			if($qtyChilled>$value){

				$qtyChilled-=$value;
				$value = 0;

			}else{

				$value-= $qtyChilled;
				$qtyChilled=0;				

			}

			if($value > 0){							

				if($qtyNonChilled>$value){

					$qtyNonChilled-=$value;
					$value = 0;

				}else{

					$value-= $qtyNonChilled;
					$qtyNonChilled=0;

				}

			}

			$totalQty = $qtyChilled + $qtyNonChilled;

			if($totalQty<1){

				unset($saleProducts[$key]);

			}else{
				$saleProducts[$key]['chilled']['quantity'] = $qtyChilled;
				$saleProducts[$key]['nonchilled']['quantity'] = $qtyNonChilled;
				$saleProducts[$key]['quantity'] = $totalQty;
			}

		}

		$this->__set("products",$saleProducts);

		return true;
	}

	public function confirmOrder($cartArr){		

	}	


	public function setLoyaltyPointEarned(){

		// due

	}

	public function setLoyaltyPointUsed(){

		$loyaltyProducts = isset($this->loyalty)?$this->loyalty:[];
		$loyaltyCards = isset($this->loyaltyCards)?$this->loyaltyCards:[];
		$totalPoints = 0;

		foreach ($loyaltyProducts as $key => $product) {
			$totalPoints = $totalPoints + (((float)$product['points']) * ((int)$product['quantity']));
		}

		foreach ($loyaltyCards as $card) {
			$totalPoints = $totalPoints + (((float)$card['points']) * ((int)$card['quantity']));
		}

		$this->__set("loyaltyPointUsed",$totalPoints);

		return $totalPoints;

	}

	public function getProductsNotInGift($exceptGiftId){

		$productsInCart = $this->getProductIncartCount();

		$gifts = $this->gifts;

		if(empty($gifts)){
			return $productsInCart;
		}

		$productsInGift = [];
		foreach ($gifts as $gift) {

			
			if(($exceptGiftId!="" && new MongoId($exceptGiftId) == $gift['_uid']) || empty($gift['products'])){
				continue;
			}
			


			foreach ($gift['products'] as $product) {

				if(isset($productsInGift[$product['_id']])){
					$productsInGift[$product['_id']]+= $product['quantity'];
				}else{
					$productsInGift[$product['_id']] = $product['quantity'];
				}
				
			}

		}

		foreach ($productsInCart as $proKey => &$count) {

			$countInGift = 0;

			if(isset($productsInGift[$proKey])){
				$countInGift = $productsInGift[$proKey];
			}

			$count-= $countInGift;

		}

		return $productsInCart;

	}

	public function cartToOrder(){

		$productsInCart = $this->getProductIncartCount();

		$order = [
			'interface'=>1			
		];

		$total = 0;
		$subtotal = 0;
		$totalPoints = 0;

		$proIds = array_keys($productsInCart);

		$productObj = new products();
		
		// product log start //

			$oPro = [];
			foreach($productsInCart as $proKey=>$quantity){
				$oPro[] = ["_id"=>new mongoId($proKey),"quantity"=>$quantity];
			}

			$order['productsLog'] = $oPro;

		// product log ends //


		$productsInCart = $productObj->fetchProduct(["id"=>$proIds]);
		$proDetails = [];
		$proSales = [];
		foreach ($productsInCart['product'] as $product) {

			$product['common'] = [

				'name'=>$product['name'],
				'slug'=>$product['slug'],
				'description'=>$product['description'],
				'shortDescription'=>$product['shortDescription'],
				'sku'=>$product['sku'],
				'chilled'=>(bool)$product['chilled'],

			];

			foreach ($product['imageFiles'] as $key => $value) {

				if($value['coverimage']){
					$value['common']['icon'] = $value['source'];
				}

			}

			$product['unitprice'] = $product['price'];

			if($product['regular_express_delivery']['type']==1){

				$product['unitprice'] +=  (float)($product['unitprice'] * $product['regular_express_delivery']['value']/100);

			}else{

				$product['unitprice'] += (float)($product['regular_express_delivery']['value']);

			}

			$product['unitprice'] = round($product['unitprice'], 2);			
				
			$proDetails[(string)$product['_id']] = $product;

			if(isset($product['proSales'])){

				$objSale = [
					"title" => $product['proSales']['listingTitle'],
					"detailTitle" => $product['proSales']['detailTitle'],
					"discountValue" => $product['proSales']['discountValue'],
					"actionType" => $product['proSales']['actionType'],
					"discountType" => $product['proSales']['discountType'],
					"type" => $product['proSales']['type']
				];


				if(isset($product['proSales']['actionProductId']) && count($product['proSales']['actionProductId'])>0){
					$objSale['action'] = true;
				}

				$proSales[(string)$product['proSales']['_id']] = $objSale;

			}

		}

		unset($productsInCart);
		
		// Set sale products start //
		if(isset($this->sales)){

			foreach($this->sales as $sale){

				$sObj = [
					'_id'=>new MongoId((string)$sale['sale']),
					'chilled'=>(bool)$sale['chilled'],
					'products'=>$sale['products']
				];

				$currSale = $proSales[(string)$sale['sale']];

				$sObj['sale'] = $currSale;

				$totalPrice = 0;
				
				$price = 0;
				$actionProPrice = 0;

				foreach ($sObj['products'] as $product){
					
					$detail = $proDetails[(string)$product['_id']];

					$price = $price + ($detail['unitprice'] * $product['quantity']);
					
				}
				

				if(isset($sale['action'])){

					$sObj['action'] = $sale['action'];

					foreach ($sObj['action'] as $product) {

						$detail = $proDetails[(string)$product['_id']];

						$tempP = $detail['unitprice'] * $product['quantity'];

						$actionProPrice+= $tempP;
						$price+= $tempP;

					}

				}

				$strikePrice = $price;

				$currPrice = 0;
				if($currSale['actionType'] == 1){

					$qty = $currSale['giftQuantity'];
					$currPrice = $price - $actionProPrice;
					$currPrice = $currPrice * $qty;

				}else{

					if($currSale['discountType']==1){
						
						if(isset($currSale['action'])){

							$currPrice = $actionProPrice - $currSale['discountValue'];
							$currPrice = $price - $currPrice;

						}else{

							$currPrice = $price - $currSale['discountValue'];

						}
						

					}else{

						if(isset($currSale['action'])){
							$currPrice = $actionProPrice - ($actionProPrice * $currSale['discountValue'] / 100);
							$currPrice = $price - $currPrice;
						}else{
							$currPrice = $price - ($price * $currSale['discountValue'] / 100);
						}

					}

				}

				$sObj['price'] = [
					'original' => number_format($strikePrice,2),
					'sale' => number_format($currPrice,2)
				];

				$subtotal+= $sObj['price']['sale'];

				$order['sales'][] = $sObj;

			}			
			
		}
		// Set sale products ends //

		// Set packages start //

		if(isset($this->packages)){

			$packagesInCart = [];
			foreach($this->packages as $package){

				array_push($packagesInCart, $package['_id']);

			}

			$packages = new Packages;
			$packages = $packages->whereIn("_id",$packagesInCart)->where('status',1)->get(['title','subTitle','type','description','coverImage','packageItems']);
			$packages = $packages->toArray();

			$packagesInCart = [];
			foreach($packages as $package){
				$packagesInCart[(string)$package['_id']] = $package;
			}
			
			foreach ($this->packages as $key => $package) {

				$oPDetail = $packagesInCart[(string)$package['_id']];
				
				$oPackage = [
					'title' => $oPDetail['title'],
					'subTitle' => $oPDetail['subTitle'],
					'description' => $oPDetail['description'],
					'coverImage' => $oPDetail['coverImage']['source'],
					'price' => $package['packagePrice'] * $package['packageQuantity']
				];

				$oPackage = array_merge($package,$oPackage);
				
				$subtotal+= $oPackage['price'];

				$order['packages'][] = $oPackage;

			}

		}

		// Set packages ends //

		// Set promotions start //

		if(isset($this->promotions)){

			$promosInCart = [];
			foreach($this->promotions as $promo){
				$promosInCart[] = new MongoId($promo['promoId']);
			}

			$promosInCart = Promotion::whereIn('_id', $promosInCart)->get();
			$promosInCart = $promosInCart->toArray();

			foreach ($promosInCart as $key => $promotion) {

				foreach ($this->promotions as $key => $promoInCart) {

					$oPromo = [
						'title' => $promotion['title'],
						'qualifyAmt' => $promotion['price']
					];

					if($promoInCart['promoId'] == $promotion['_id']){

						foreach ($promotion['items'] as $key => $product) {
							
							if((string)$product['_id']===(string)$promoInCart['productId']){

								$oPromo['price'] = 0;
								if($product['type']==1){
									$oPromo['price'] = $product['price'];
								}

							}
						}

					}

					$subtotal+= $oPromo['price'];

					$order['promotion'][] = $oPromo;
				}

			}

		}

		// Set promotions ends //


		// Set loyalty products start //

		if(isset($this->loyalty)){
			 
			foreach($this->loyalty as $key=>$product){

				$detail = $proDetails[(string)$product['_id']];
				
				$qtyChilled = 0;
				$qtyNonChilled = 0;

				if($product['chilled']['status']==='chilled'){
					$qtyChilled = $product['chilled']['quantity'];
				}
				if($product['nonchilled']['status']==='chilled'){
					$qtyChilled = $product['nonchilled']['quantity'];
				}

				if($product['chilled']['status']==='nonchilled'){
					$qtyNonChilled = $product['chilled']['quantity'];
				}
				if($product['nonchilled']['status']==='nonchilled'){
					$qtyNonChilled = $product['nonchilled']['quantity'];
				}

				$qtyTotal = $qtyChilled + $qtyNonChilled;

			
				$oLoyalty = [
					"_id" => new MongoId((string)$product['_id']),
					"quantity" => [
						"chilled" => $qtyChilled,
						"nonChilled" => $qtyNonChilled,
						"total" => $qtyTotal,
					],
					"price" => [
						"points" =>$detail['loyaltyValuePoint'] * $qtyTotal,
						"amount" =>isset($detail['loyaltyValuePrice'])?$detail['loyaltyValuePrice'] * $qtyTotal:0,
					]
				];

				$totalPoints+= $oPackage['price']['points'];
				$subtotal+= $oPackage['price']['amount'];

				$order['loyalty'][] = $oLoyalty;
			}
		}

		// Set loyalty products ends //

		// Set loyalty cards start //

		if(isset($this->loyaltyCards)){
			
			foreach ($this->loyaltyCards as $key => $value) {

				$value['value'] = $key;
				$value['total'] = $value['quantity'] * $value['points'];

				$totalPoints+=$value['total'];

				$order['loyaltyCards'][] = $value;
			}

		}

		// Set loyalty cards start //

		// Set Gift packaging start //
		if(isset($this->gifts)){

			$giftsDetail = [];
			foreach($this->gifts as $gift){
				$giftsDetail[] = new MongoId($gift['_id']);
			}

			$giftsDetail = Gift::whereIn("_id",$giftsDetail)->get();
			$giftsDetail = $giftsDetail->toArray();
			$gifts = [];
			foreach($giftsDetail as $gift){
				$gifts[$gift['_id']] = $gift;
			}
			unset($giftsDetail);

			foreach ($this->gifts as $key => $gift) {
				
				$gDetail = $gifts[$gift['_id']];

				$gift['type'] = $gDetail['type'];
				$gift['price'] = $gDetail['costprice'];
				$gift['title'] = $gDetail['title'];
				$gift['subTitle'] = $gDetail['subTitle'];
				$gift['description'] = $gDetail['description'];
				$gift['image'] = $gDetail['coverImage']['source'];

				

				$subtotal+=$gift['price'];

				if($gift['type']==1){

					$gift['limit'] = $gDetail['limit'];
					$order['gift']['container'][] =$gift;

				}else{

					$order['gift']['individual'][] =$gift;

				}

			}

		}
		// Set Gift packaging ends //


		// Set Gift Certificate start //		

		if(isset($this->giftCards)){
			
			$data = GiftCategory::where('type','=','giftcard')->first();

			foreach ($this->giftCards as $key => $value) {

				$value['price'] = $value['recipient']['price'] * $value['recipient']['quantity'];
				$value['quantity'] = $value['recipient']['quantity'];

				$value['title'] = $data['title'];
				$value['subTitle'] = $data['subTitle'];
				$value['description'] = $data['description'];
				
				$subtotal+=$value['price'];

				$order['giftCards'][] = $value;
			}
			
		}

		// Set Gift Certificate ends //

		// Set Products start //
		if(isset($this->products)){

			foreach($this->products as $key=>$product){

				$proDetail = $proDetails[$key];


				$oProduct = $proDetail['common'];
				$oProduct['_id'] = new MongoId($key);
				$oProduct['unitprice'] = $proDetail['unitprice'];

				$qtyChilled = 0;
				$qtyNonChilled = 0;

				if($product['chilled']['status']==='chilled'){
					$qtyChilled = $product['chilled']['quantity'];
				}
				if($product['nonchilled']['status']==='chilled'){
					$qtyChilled = $product['nonchilled']['quantity'];
				}

				if($product['chilled']['status']==='nonchilled'){
					$qtyNonChilled = $product['chilled']['quantity'];
				}
				if($product['nonchilled']['status']==='nonchilled'){
					$qtyNonChilled = $product['nonchilled']['quantity'];
				}

				$qtyTotal = $qtyChilled + $qtyNonChilled;

				$oProduct["quantity"] = [
							"unitprice" => $oProduct['unitprice'],
							"chilled" => $qtyChilled,
							"nonChilled" => $qtyNonChilled,
							"total" => $qtyTotal
						];

				$remainingQty = $product['remainingQty'];

				$chilledRemain = 0;
				if($remainingQty>$qtyNonChilled){

					$nonChilledRemain = $qtyNonChilled;

				}else{

					$nonChilledRemain = $remainingQty;

				}

				$stillRemain = $remainingQty - $qtyNonChilled;

				if($stillRemain>0){
					$chilledRemain = $stillRemain;
				}

				

				$oProduct["afterSale"] = [
							"chilled" => $chilledRemain,
							"nonChilled" => $nonChilledRemain							
						];

				$oProduct['qtyfinal'] = $chilledRemain + $nonChilledRemain;				

				$price = 0;

				if($oProduct['qtyfinal']>1){

					$originalPrice = $proDetail['price'];
					foreach ($proDetail['express_delivery_bulk']['bulk'] as $key => $bulk) {

					if($oProduct['qtyfinal'] >= $bulk['from_qty'] && $oProduct['qtyfinal']<=$bulk['to_qty']){

						if($bulk['type']==1){

							$price = $oProduct['qtyfinal'] * ($originalPrice + ($originalPrice * $bulk['value']/100));

						}else{

							$price = $oProduct['qtyfinal'] * ($originalPrice + $bulk['value']);

						}
						
						$price = number_format($price,2);
					}

				}

				}elseif($oProduct['qtyfinal']==1){

					$price = $oProduct['unitprice'];

				}

				$oProduct['price'] = $price;

				if($oProduct['qtyfinal']>0){
					$oProduct['unitprice'] = $price/$oProduct['qtyfinal'];
				}

				$subtotal+=$price;
				$order['products'][] = $oProduct;


			}

		}
		// Set Products ends //

		$order['nonchilled'] = $this->nonchilled;
		$order['status'] = $this->status;
		$order['user'] = $this->user;
		$order['reference'] = $this->reference;
		$order['timeslot'] = $this->timeslot;
		$order['delivery'] = $this->delivery;
		$order['service'] = $this->service;
		$order['discount'] = $this->discount;
		$order['loyaltyPointEarned'] = 0;

		$order['doStatus'] = 1;
		if($order['delivery']['type']==1){
			$order['doStatus'] = 0;
		}
		
		$order['payment'] = [
			'subtotal' => $subtotal,
			'points' => $totalPoints,
			'total'=> $subtotal,
			'method' => $this->payment['method']
		];


		
		return $order;

	}	

}
