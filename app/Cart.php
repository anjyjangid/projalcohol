<?php

namespace AlcoholDelivery;

use Moloquent;

use AlcoholDelivery\Setting;
use AlcoholDelivery\Products;
use AlcoholDelivery\Packages;
use AlcoholDelivery\Credits;
use AlcoholDelivery\Promotion;
use AlcoholDelivery\Gift;
use AlcoholDelivery\GiftCategory;
use AlcoholDelivery\Holiday;
use AlcoholDelivery\ErrorLog;

use Illuminate\Support\Facades\Auth;
use stdClass;
use MongoId;
use MongoDate;
use Route;
use DateTime;
use DB;

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
	

	// public function setKey($keyVal){
	// 	$this->key = $keyVal;
	// }

	public function setServices($cart){

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value','settings.tempsurcharge'])->first();

		$services = $services['settings'];

		$cart["service"]["express"]["charges"] = $services['express_delivery']['value'];

		$cart["service"]["smoke"]["charges"] = $services['cigratte_services']['value'];

		$cart["service"]["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value'],
							];

		//ADD TEMPSURCHARGE FLAG
		$cart["service"]["tempsurcharge"] = $services['tempsurcharge'];

		$cart["discount"]["nonchilled"]["exemption"] = $services['non_chilled_delivery']['value'];

		

		return $cart;

	}

	public function setWorkingHrs() {

		$working = Setting::where("_id","=","workinghrs")->first(['settings.from','settings.to']);		
		
		$currentTime = strtotime("+8 hours");

		$date = date("Y-m-d",time());
		$fromTime = $date." ".((int)($working['settings']['from']/60)).":".((int)$working['settings']['from']%60).":00";	 
		// $toTime = $date." ".((int)($working['settings']['to']/60)-1).":".((int)$working['settings']['to']%60).":00";

		$toMinute = (int)$working['settings']['to']%60;
		$toMinute = str_pad($toMinute, 2, "0", STR_PAD_LEFT);
		$toTime = $date." ".((int)($working['settings']['to']/60)).":".$toMinute.":00";
		$toTimeString = $date." ".((int)($working['settings']['to']/60)).":".$toMinute.":00";

		$setting = [
			'currentTime' => $currentTime,
			'from' => strtotime($fromTime),
			'to' => strtotime($toTime),
			'string' => [
				'from' => date('h:i A',strtotime($fromTime)),
				'to' => date('h:i A',strtotime($toTimeString))
			]
		];
		
		$this->__set("working",$setting);

	}

	public function setAllDependencies () {

		$model = GiftCategory::where('type','!=','category')->first(['coverImage']);

		if(isset($model->coverImage)){
			$this->__set("giftCertificateLogo",$model->coverImage['source']);
		}else{
			$this->__set("giftCertificateLogo",'');
		}

	}

	public function isUnderWorkingHrs(){

		$working = $this->working; 
		
		return (($working['from'] < $working['currentTime']) && ($working['currentTime'] < $working['to']));

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
				"surcharge" => [
					'holiday' => [
						'label' => 'Holiday surcharge',
						'type' => 1, //0=>fixed 1=>percentage
						'value' => 10						
					]
				],
				"tempsurcharge" => true
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

		$user = Auth::user('user');

		if(!empty($user)){

			$cart['user'] = new mongoId($user->_id);

		}

		$cart = self::setServices($cart);
		
		try{
			
			$cart = self::create($cart);

			$cart->setWorkingHrs();

			$cart = $cart->toArray();

			$cart['products'] = (object)$cart['products'];
			$cart['packages'] = (object)$cart['packages'];

			return (object)array("success"=>true,"message"=>"cart generated succesfully","cart"=>$cart);
			
		}catch(Exception $e){

			return (object)array("success"=>false,"message"=>$e->getMessage());

		}

	}

	public static function findUpdated($id,$admin=false,$user_id=false){

		if(!$admin){

			$user = Auth::user('user');

			if(empty($user) && $user_id){
				$user = new stdClass;
				$user->_id = $user_id;
			}

			$userId = isset($user->_id)?$user->_id:(string)new mongoId();

			$cart = self::where("_id",new mongoId($id))->whereNull("generatedBy");

			if(isset($user->_id)){

				$cart = $cart->first();

				if(!empty($cart)){


					if(empty($cart->user)){

						$cart->user = new mongoId($user->_id);

					}else if(((string)$cart->user) != $user->_id){
						$cart = "";
					}

				}

			}else{
				$cart = $cart->whereNull("user");
				$cart = $cart->first();
			}


		}else{

			$cart = self::where("_id",new mongoId($id))->first();

		}

		if(empty($cart)){
			return false;
		}

		$currentTimeStr = getServerTime();
		$todayStartTimeStr = strtotime(date("Y-m-d",$currentTimeStr));

		if(isset($cart->timeslot['datekey']) && $cart->timeslot['datekey']!==false && $todayStartTimeStr>=$cart->timeslot['datekey']){

			$todayLapsedHours = date("H",$currentTimeStr);
			$todayLapsedMinutes = $todayLapsedHours * 60;
			$todayLapsedMinutes+= 120;

			if(isset($cart->timeslot['slotTime']) && $cart->timeslot['slotTime']<$todayLapsedMinutes){

				$cart->timeslot = [
					"datekey"=>false,
					"slotkey"=>false,
					"slug"=>"",
					"slotslug"=>""
				];
			}
		}		

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.express_delivery.applicablePostalCodes','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value','settings.tempsurcharge'])->first();

		$services = $services['settings'];

		$cartServices = $cart->service;

		$cartServices["express"]["charges"] = $services['express_delivery']['value'];

		$cartServices["smoke"]["charges"] = $services['cigratte_services']['value'];
		$cartServices["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value'],
							];

		//ADD TEMPSURCHARGE FLAG
		$cartServices["tempsurcharge"] = $services['tempsurcharge'];

		$cartServices["surcharge"] = [
					'holiday' => [
						'label' => 'Holiday surcharge',
						'type' => 1, //0=>fixed 1=>percentage
						'value' => 10
					]
				];

		$cart->__set('service', $cartServices);
		
		$cart->applicablePostalCodes = $services['express_delivery']['applicablePostalCodes'];
		$cartDiscount = $cart->discount;							
		$cartDiscount['nonchilled']['exemption'] = $services['non_chilled_delivery']['value'];
		$cart->__set('discount', $cartDiscount);

		try{

			$cart->save();
			$cart->setWorkingHrs();
			return $cart;

		}catch(\Exception $e){

			return false;

		}

	}

	public function validate(){

		$response = [
			'valid' => false
		];

		try{

			$isCartEmpty = $this->isCartEmpty();

			if($isCartEmpty){

				$response['message'] = "There is no product in cart to process";
				$response['step'] = 'cart';
				$response['refresh'] = true;
				return $response;
			}

			$response['valid']= true;

			$isAnyProductSort = false;
			$deliveryBaseTime = $this->getCartDeliveryBaseTime();

			$products = $this->getAllProductsInCart();

			$products = $this->setProductAvailabilityAfter($products);

			foreach ($products as $product) {

				if($deliveryBaseTime<$product['lapsedTime'] && $product['quantity'] < $product['count']){
					$isAnyProductSort = true;
					break;
				}
				
			}

			if($isAnyProductSort){
				$response['message'] = "Some products are not available as per your selected delivery time";
				$response['step'] = $this->isAdvanceDelivery()?'delivery':'cart';
			}


			return $response;

		}catch(\Exception $e){
			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Cart Validate',
				]);
		}

		return response(['refresh' => true],412);

	}

	public function isCartEmpty () {

		$products = $this->getAllProductsInCart();

		if(key($products)!=false){
			return false;
		}

		if(isset($this->gifts) && is_array($this->gifts) && count($this->gifts)){
			return false;
		}
		
		if(isset($this->giftCards) && is_array($this->giftCards) && count($this->giftCards)){
			return false;
		}

		if(isset($this->loyaltyCards) && is_array($this->loyaltyCards) && count($this->loyaltyCards)){
			return false;
		}
		
		return true;
	}
	// Cart getter and setters Starts

	public function getCartDeliveryBaseTime () {

		$baseTime = 0;
		if($this->isAdvanceDelivery()){

			$baseTime = $this->getTimeSlotDeliveryTime();

		}else{

			$serverTime = getServerTime();
			$halfHourTimeStr = 1800;

			if(!$this->isExpressDelivery())
				$baseTime = $serverTime + ($halfHourTimeStr * 3);
			else
				$baseTime = $serverTime + ($halfHourTimeStr * 1.5);

		}
		
		return $baseTime;

	}

	public function getNextAvailableSlots () {

		$deliveryTime = $this->getCartDeliveryBaseTime();
		$timeslot = Setting::where("_id","=","timeslot")->first();
		$dayIndex = getTodayDayNumber() - 1;

		$todaySlots = $timeslot->settings[$dayIndex];
		$availSlots = [];
		
		$deliveryTime = $deliveryTime - strtotime(date('Y-m-d',$deliveryTime));
		$deliveryTime = round($deliveryTime/60);

		foreach($todaySlots as $slot){

			if(count($availSlots)>1){
				break;
			}
			if($slot['status']==1 && $slot['from']<= $deliveryTime && $deliveryTime<$slot['to'] ){
				array_push($availSlots, $slot);
			}

		}

		return $availSlots;

	}

	public function isAdvanceDelivery () {
		return $this->delivery['type'] === 1 ? true : false;
	}

	public function isExpressDelivery () {
		return $this->delivery['type'] === 1 ? false : $this->service['express']['status']==1?true:false;
	}

	public function getTimeSlotDeliveryTime () {

		if($this->timeslot['datekey'] && $this->timeslot['slotTime']){
			return $this->timeslot['datekey'] + ( $this->timeslot['slotTime'] * 60 );
		}
		return 0;
	}

	// Cart getter and setters Ends

	private function setProductAvailabilityAfter($products){

		$sgtTimeStamp = getServerTime();

		$today = strtotime(date('Y-m-d',$sgtTimeStamp))*1000;

		$holidays = DB::collection('holidays')
						->where('timeStamp','>=',$today)
						->orWhere('_id','weekdayoff')
						->orderBy("timeStamp")
						->get(['dow','timeStamp']);

		foreach ($products as $key => &$product) {

			if($product['outOfStockType']!==2){
				$product['lapsedTime'] = strtotime("+1 years",$sgtTimeStamp);
				continue;
			}
						
			$workingDaysRequired = $product['availabilityDays'];

			$availDateTimeStamp = Holiday::getDateWithWorkingDays($workingDaysRequired,$holidays);
			$availTimeStamp = $availDateTimeStamp + ($product['availabilityTime']*60);

			$product['lapsedTime'] = $availTimeStamp;
		}

		return $products;

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

	public function getAllProductsInCart($data=false){

		if($data===false){
			$data = $this->toArray();
		}

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
															"deliveryType"
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

		if($this->reference==''){
			$models = Setting::raw()->findAndModify(
		    	['_id' => 'invoice'],
	            ['$inc' => ['serial' => 1]],
	            null,
	            ['new' => true, 'upsert' => true]
		    );
			$reference = "ADSG".$models['serial'];
		}else{			
			if(str_contains($this->reference,'W'))
				$referencepart = explode('W',$this->reference);
			else
				$referencepart = explode('O',$this->reference);
			
			$reference = $referencepart[0];
		}
		
		$reference.="W";			
		$offset = strtotime('+8 hours');//ADD OFFSET SO TIME WILL BE EQUAL TO SINGAPORE TIMEZONE
		$reference.= (string)date("Hi",$offset);		
		$this->reference = $reference;		
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

		foreach($products as $productId=>&$product){
			
			if(isset($product['sale']) && !$this->isSingleProductSale($product['sale']) && $product['remainingQty']>0){


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

					$this->products = $products; // to set all new changes in $product var to current cart products.

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

	private function isSingleProductSale($sale = false){

		if($sale===false){
			return false;
		}

		if($sale['conditionQuantity']==1 && empty($sale['actionProductId'])){
				return true;
		}

		return false;

	}

	private function canCreateSale($cartProId,$newProId,&$newProQty,$newProSale){

		$products = $this->products;
		$product = $products[$cartProId];		

		$sale = $product['sale'];
		
		if($this->isSingleProductSale($sale)){
			return false;
		}

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
					$quantity = 0;

				}else{

					$quantity-=$product['remainingQty'];
					$salePro[$key] = $product['remainingQty'];

				}

				$product['remainingQty']-= $salePro[$key];


			}

			if($quantity==0){
				break;
			}

		}

		if(count($salePro))
		return $salePro;
		return false;


	}

	// private function addSale($sale,$salePro,$actionPro){

	// 	$sale = [
	// 		"sale" => $sale,
	// 		"salePro" => $salePro,
	// 		"actionPro" => $actionPro
	// 	];
		
	// 	$this->sale[] = $sale;

	// }

	public function createAllPossibleSales(){

		$products = $this->products;
		$sales = isset($this->sales)?$this->sales:[];

		foreach ($products as $key => $product) {

			if((isset($product['remainingQty']) && $product['remainingQty'] < 1) || !isset($product['sale']) || empty($product['sale']) || $this->isSingleProductSale($product['sale'])) {
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

						if(!$this->isSingleProductSale($actionPro['sale']) && $actionPro['remainingQty']>=$actionQty){

							$actionPro['remainingQty']-=$actionQty;
							$productToCreateSale['action'][$conditionProductId] = $actionQty;
							$actionQty = 0;

						}

						$products[$conditionProductId] = $actionPro;

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

			if(!isset($toRemove[$value['_id']])){
				$toRemove[$value['_id']] = 0;
			}

			$toRemove[$value['_id']]+= $value['quantity'];

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

		$products = $this->getProductsWithoutAnySale();
		$loyaltyPoints = 0;

		foreach($this->productsLog as $proInCart){

			$id = (string)$proInCart['_id'];

			if(!isset($products[$id])){continue;}

			$qty = $products[$id];
			$point = 0;
			if((int)$proInCart['loyaltyType']==0){

				if(!isset($proInCart['loyalty'])){$proInCart['loyalty']=0;}

				$point+= $qty * ($proInCart['finalUnitPrice'] * $proInCart['loyalty']/100);

			}else{

				$point+= $qty * $proInCart['loyalty'];

			}

			$loyaltyPoints = $loyaltyPoints + (float)(round($point,2));

		}

		$this->__set('loyaltyPoints',$loyaltyPoints);
		return $loyaltyPoints;
	}

	public function getProductsWithoutAnySale(){

		$proArr = [];
		$products = $this->__get("products");

		foreach($products as $key=>$product){

			if($product['remainingQty']<1){
				continue;
			}

			$proArr[$key] = $product['remainingQty'];

		}

		return $proArr;
	}

	public function getLoyaltyProducts(){

		return isset($this->loyalty)?$this->loyalty:[];

	}

	public function getLoyaltyProductById($id){

		$pObj = false;
		$lProducts = $this->getLoyaltyProducts();

		foreach ($lProducts as $key => $value) {

			if($key === $id){
				$pObj = $value;
				break;
			}

		}
		
		return $pObj;

	}

	public function getLoyaltyCards(){

		return isset($this->loyaltyCards)?$this->loyaltyCards:[];

	}

	public function getLoyaltyCardByValue($value){

		$pObj = false;
		$lProducts = $this->getLoyaltyCards();

		foreach ($lProducts as $key => $card) {

			if($key == $value){
				$pObj = $card;
				break;
			}

		}
		
		return $pObj;

	}

	public function getLoyaltyPointUsed(){

		$loyaltyProducts = $this->getLoyaltyProducts();
		$loyaltyCards = $this->getLoyaltyCards();
		$totalPoints = 0;

		foreach ($loyaltyProducts as $key => $product) {
			$totalPoints = $totalPoints + (((float)$product['points']) * ((int)$product['quantity']));
		}

		foreach ($loyaltyCards as $card) {
			$totalPoints = $totalPoints + (((float)$card['points']) * ((int)$card['quantity']));
		}		

		return $totalPoints;

	}

	public function setLoyaltyPointUsed(){

		$totalPoints = $this->getLoyaltyPointUsed();

		$this->__set("loyaltyPointUsed",$totalPoints);

		return $totalPoints;

	}


	public function removeAllLoyaltyProduct(){
		
		$this->__set("loyalty",new stdClass());
		$this->__set("loyaltyCards",new stdClass());
		$this->__set("loyaltyPointUsed",0);

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

	
	/**
	 * function to convert cart data to a order
	 *
	 * @var $cartKey // as denotes from name its a key of cart wants to convert
	 * @var $interface (wi=>1,eci=>2,bi=>3,device=>4,mobile=>5,pos=>6) // define order placed from which interface
	 *
	 */
	public function cartToOrder($cartKey=null,$interface=1){

		$productsInCartCount = $this->getProductIncartCount();

		$order = [
			'interface'=>$interface
		];

		$total = 0;
		$subtotal = 0;
		$totalPoints = 0;

		$proIds = array_keys($productsInCartCount);

		$productObj = new products();

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
				'loyaltyType'=>(int)$product['loyaltyType'],
				'loyalty'=>(float)$product['loyalty'],
				'bulkDisable'=>(float)$product['bulkDisable']

			];

			foreach ($product['imageFiles'] as $key => $value) {

				if($value['coverimage']){
					$product['common']['coverImage'] = $value['source'];
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
					"discountValue" => isset($product['proSales']['discountValue'])?$product['proSales']['discountValue']:0,
					"actionType" => $product['proSales']['actionType'],
					"discountType" => $product['proSales']['discountType'],
					"type" => $product['proSales']['type']
				];


				if(isset($product['proSales']['actionProductId']) && count($product['proSales']['actionProductId'])>0){
					$objSale['action'] = true;
					
				}

				if($objSale['actionType']==1){
					
					$objSale['giftQuantity'] = $product['proSales']['giftQuantity'];
				}

				$proSales[(string)$product['proSales']['_id']] = $objSale;

				if($this->isSingleProductSale($product['proSales']))
				$proDetails[(string)$product['_id']]['common']['sale'] = $objSale;


			}

		}

		// product log start //

		$order['productsLog'] = [];

		foreach($productsInCartCount as $proKey=>$quantity){

			$oPro = [
				"_id" => new mongoId($proKey),
				"quantity" => (int)$quantity,
				"costPrice" => $proDetails[$proKey]['price']
			];

			$oPro = array_merge($oPro,$proDetails[$proKey]['common']);
			array_push($order['productsLog'], $oPro);
		}

		// product log ends //
		unset($productsInCart);
		unset($productsInCartCount);

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
					// $currPrice = $currPrice * $qty;

				}else{

					if($currSale['discountType']==1){
						
						if(isset($currSale['action'])){

							$currPrice = $price - $currSale['discountValue'];
							//$currPrice = $price - $currPrice;

						}else{

							$currPrice = $price - $currSale['discountValue'];

						}
						

					}else{

						if(isset($currSale['action'])){
							$currPrice = $price - ($actionProPrice * $currSale['discountValue'] / 100);
						}else{
							$currPrice = $price - ($price * $currSale['discountValue'] / 100);
						}

					}

				}

				$sObj['price'] = [
					'original' => round($strikePrice,2),
					'sale' => round($currPrice,2)
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
				
				$proDetail = [];

				foreach ($package['products'] as $pkey => $pvalue) {
					$proDetail[(string)$pvalue['_id']] = $pvalue['quantity'];
				}

				$packageItems = [];

				foreach ($oPDetail['packageItems'] as $oPackagekey => &$oPackagevalue) {
					foreach ($oPackagevalue['products'] as $pKey => &$provalue) {
						if(isset($proDetail[$provalue['_id']])){
							$provalue['quantity'] = $proDetail[$provalue['_id']];							
						}else{
							unset($oPDetail['packageItems'][$oPackagekey]['products'][$pKey]);
						}
					}
				}

				$oPackage = [
					'title' => $oPDetail['title'],
					'subTitle' => $oPDetail['subTitle'],
					'description' => $oPDetail['description'],
					'coverImage' => $oPDetail['coverImage']['source'],
					'price' => $package['packagePrice'] * $package['packageQuantity'],
					'packageItems' => $oPDetail['packageItems']
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
						'qualifyAmt' => $promotion['price'],
						'price' => 0
					];

					if($promoInCart['promoId'] == $promotion['_id']){

						foreach ($promotion['items'] as $key => $product) {
							
							if((string)$product['_id']===(string)$promoInCart['productId']){

								
								if($product['type']==1){
									$oPromo['price'] = $product['price'];
								}

								$oPromo['product'] = new MongoId((string)$product['_id']);

								$subtotal+= $oPromo['price'];

								$order['promotion'][] = $oPromo;

								break ;

							}
						}

					}

					
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
					$qtyChilled+= $product['chilled']['quantity'];
				}
				if($product['nonchilled']['status']==='chilled'){
					$qtyChilled+= $product['nonchilled']['quantity'];
				}

				if($product['chilled']['status']==='nonchilled'){
					$qtyNonChilled+= $product['chilled']['quantity'];
				}
				if($product['nonchilled']['status']==='nonchilled'){
					$qtyNonChilled+= $product['nonchilled']['quantity'];
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

				$totalPoints+= $oLoyalty['price']['points'];
				$subtotal+= $oLoyalty['price']['amount'];

				$order['loyalty'][] = $oLoyalty;
			}
		}

		// Set loyalty products ends //

		// Set loyalty cards start //

		if(isset($this->loyaltyCards)){

			$creditsFromLoyalty = 0;
			foreach ($this->loyaltyCards as $key => $value) {

				$value['value'] = $key;
				
				$creditsFromLoyalty = $creditsFromLoyalty + ($value['quantity'] * $value['value']);

				$value['total'] = $value['quantity'] * $value['points'];

				$totalPoints+=$value['total'];

				$order['loyaltyCards'][] = $value;
			}

			$order['creditsFromLoyalty'] = $creditsFromLoyalty;
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

				$isSingleSalePro = $this->isSingleProductSale($product['sale']);

				$proDetail = $proDetails[$key];

				//$oProduct = $proDetail['common'];
				$oProduct = [];
				$oProduct['_id'] = new MongoId($key);
				$oProduct['unitprice'] = $proDetail['unitprice'];

				$qtyChilled = 0;
				$qtyNonChilled = 0;

				if($this->nonchilled){
					$qtyNonChilled = $product['chilled']['quantity']+$product['nonchilled']['quantity'];
				}else{
					if($product['chilled']['status']==='chilled'){
						$qtyChilled+= $product['chilled']['quantity'];
					}
					if($product['nonchilled']['status']==='chilled'){
						$qtyChilled+= $product['nonchilled']['quantity'];
					}

					if($product['chilled']['status']==='nonchilled'){
						$qtyNonChilled+= $product['chilled']['quantity'];
					}
					if($product['nonchilled']['status']==='nonchilled'){
						$qtyNonChilled+= $product['nonchilled']['quantity'];
					}
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


				if(!$isSingleSalePro){

					if($oProduct['qtyfinal']>1 && !$proDetail['bulkDisable']){

						$originalPrice = $proDetail['price'];
						foreach ($proDetail['express_delivery_bulk']['bulk'] as $key => $bulk) {

						if($oProduct['qtyfinal'] >= $bulk['from_qty'] && $oProduct['qtyfinal']<=$bulk['to_qty']){

							if($bulk['type']==1){

								$price = $oProduct['qtyfinal'] * ($originalPrice + ($originalPrice * $bulk['value']/100));

							}else{

								$price = $oProduct['qtyfinal'] * ($originalPrice + $bulk['value']);

							}
							
							$price = round($price,2);

						}

					}

					}else{

						$price = $oProduct['unitprice'] * $oProduct['qtyfinal'];

					}

				}else{

					$price = $oProduct['unitprice'];
					$discountValue = $product['sale']['discountValue'];

					if($product['sale']['discountType']===2){ //2 is for % discount

						$price = $oProduct['qtyfinal'] * ($price - ($price * $discountValue/100));

					}else{
						
						$price = $oProduct['qtyfinal'] * ($price - $discountValue);	

					}

					// $oProduct['sale'] = [
					// 	"title" => $product['sale']['title'],
					// 	"detailTitle" => $product['sale']['detailTitle']
					// ];

				}

				$oProduct['price'] = $price;
				if($oProduct['qtyfinal']>0){
					$oProduct['unitprice'] = $price/$oProduct['qtyfinal'];
				}

				$subtotal+=$price;

				foreach($order['productsLog'] as &$pro){

					if((string)$pro['_id'] === (string)$oProduct['_id']){
						$pro['finalUnitPrice'] = $oProduct['unitprice'];
					}
					
				}

				$order['products'][] = $oProduct;

			}

		}

		// Set Products ends //


		$this->__set('productsLog',$order['productsLog']);

		//SET COUPON IF COUPON CODE IS APPLIED

		if(isset($this->coupon) && $this->coupon){

			$couponData = Coupon::where(['_id' => $this->coupon])->first();

			if(isset($couponData->_id) && $couponData->_id){
			
				// if(strtotime($couponData->start_date)<= time() && strtotime($couponData->end_date. ' + 1 days')>= time()){}

				$coupon = $couponData->toArray();

				if (isset($coupon) && $coupon['_id']) {
					$cDiscount = $coupon['discount'];
					$cTotal = $coupon['total'];
					$couponDisAmt = 0;
					$couponDiscount = 0;
					$isProductOriented = (count($coupon['products']) + count($coupon['categories']))?true:false;

					if(!$cTotal || ($cTotal && $cTotal <= $subtotal) ){

						if($isProductOriented){

							foreach($order['products'] as $key=>$nOrder){

								$quantity = $nOrder['qtyfinal'];
								$hasCategory = 0;
								$unitPrice = $nOrder['unitprice'];
								$discountedUnitPrice = $nOrder['unitprice'];

								$prodDetail = $proDetails[(string)$nOrder['_id']];

								if(!empty($coupon['products'])){
									if(!in_array((string)$nOrder['_id'], $coupon['products'])){
										continue;
									}
								}

								if(!empty($coupon['categories'])){

									foreach ($prodDetail['categories'] as $catVal) {
										
										foreach($coupon['categories'] as $couponCategory){

											if((string)$couponCategory == (string)$catVal){
												$hasCategory = 1;
												break;
											}

										}

										if($hasCategory){
											break;
										}
										// if(!in_array((string)$catVal, $coupon['categories'])){
										// 	$hasCategory = 1;
										// }
									}

									if(!$hasCategory)
										continue;
								}

								if($coupon['discount_status']==1){
									$pAmount = $unitPrice*$quantity;
								}else{
									$pAmount = $discountedUnitPrice*$quantity;
								}

								if($coupon['type']==1){
									$couponDisAmt = $cDiscount * $quantity;
								}else{
									$couponDisAmt = ($pAmount*$cDiscount)/100;
								}

								//In case coupon dis is more than product price
								if($couponDisAmt>$pAmount){
									$couponDisAmt = $pAmount;
								}

								$amtAfterCouponDis = $pAmount - $couponDisAmt;


								if($coupon['discount_status']==1){ // 1 is set to check discount from other sources like single sale NOTE single sale :)

									$proAmtAfterOtherDiscount =  $discountedUnitPrice*$quantity;

									if($amtAfterCouponDis > $proAmtAfterOtherDiscount){
										
										$couponDisAmt = 0; // if discount from other sources is more than coupon don't apply coupon discount

									}else{

										$diffAmt = $proAmtAfterOtherDiscount - $amtAfterCouponDis;

										$couponDisAmt = 0;
										if($diffAmt>0){
											$couponDisAmt = $diffAmt;
										}
									}

								}

								$order['products'][$key]['discount'] = $couponDisAmt;

								$couponDiscount+=$couponDisAmt;

							}
						}else{

							if($coupon['type']==1){
								$couponDiscount = $coupon['discount'];
							}else{
								$couponDiscount = $subtotal*($coupon['discount']/100);
							}

						}

						$order['coupon'] = [
							"_id" => $this->coupon,
							"code" => $coupon['code'],
							"name" => $coupon['name'],
							"type" => $coupon['type'],
							"discount" => $coupon['discount'],
							"total" => $coupon['total'],
							"start_date" => $coupon['start_date'],
							"end_date" => $coupon['end_date'],
							"totalDiscount" => $couponDiscount
						];
						

					}
				}
			
			}
		}

		if($interface==2){
			$order['generatedBy'] = $this->generatedBy;
		}

		$created_at = getServerTime();
		$order['created_at'] = new MongoDate($created_at);

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
			$order['delivery']['deliveryDate'] = date('Y-m-d',$order['timeslot']['datekey']);
			$deliveryKey = $order['timeslot']['datekey'] + ($this->timeslot['slotTime'] * 60);
			$order['delivery']['deliveryDateTime'] = date('Y-m-d H:i:s',$deliveryKey);
			$order['delivery']['deliveryTimeRange'] = $order['timeslot']['slotslug'];
			$order['delivery']['deliveryDateObj'] = new MongoDate($order['timeslot']['datekey']);

		}else{

			$orderDateTime = strtotime('+60 minutes',$created_at);
			if($order['service']['express']['status']){
				$orderDateTime = strtotime('+30 minutes',$created_at);
			}

			$order['delivery']['deliveryDate'] = date('Y-m-d',$orderDateTime);
			$order['delivery']['deliveryDateTime'] = date('Y-m-d H:i:s',$orderDateTime);
			$order['delivery']['deliveryTimeRange'] = '';
			$order['delivery']['deliveryDateObj'] = new MongoDate($orderDateTime);
		}

		$order['delivery']['deliveryKey'] = strtotime($order['delivery']['deliveryDateTime']);


		$lpEarned = $this->setLoyaltyPointEarned();
		
		$order['loyaltyPointEarned'] = $lpEarned;

		$lpUsed = $this->setLoyaltyPointUsed();
		$order['loyaltyPointUsed'] = $lpUsed;

		$total = $subtotal;
		$serviceCharges = 0;
		$discountExemption = 0;

		if($order['service']['express']['status']){
			$serviceCharges+=$order['service']['express']['charges'];
		}
		
		if($order['service']['smoke']['status']){
			$serviceCharges+=$order['service']['smoke']['charges'];
		}

		if($subtotal>=$order['service']['delivery']['mincart']){
			$order['service']['delivery']['free'] = true;
		}

		if(!$order['service']['delivery']['free']){
			$serviceCharges+=$order['service']['delivery']['charges'];
		}

		if($order['nonchilled']==true && $order['discount']['nonchilled']['status']){
			$discountExemption+=$order['discount']['nonchilled']['exemption'];
		}

		if(isset($order['coupon']) && $order['coupon']['totalDiscount']>0){

			$totalTill = $subtotal + $serviceCharges - $discountExemption;

			if($order['coupon']['totalDiscount']>$totalTill){
				$order['coupon']['totalDiscount'] = $totalTill;
			}

			$order['discount']['coupon'] = $order['coupon']['totalDiscount'];
			$discountExemption+=round($order['coupon']['totalDiscount'],2);
		}

		$surCharges = 0;
		if($order['delivery']['type']==0 && $order['service']['tempsurcharge']){

			$totalTill = $subtotal + $serviceCharges - $discountExemption;
			$surCharges = ($totalTill * 10)/100;
			$order['service']['surcharge_taxes'][] = [

				'label'=>'Holiday surcharge',
				'value' => $surCharges			
			];

		}

		if(isset($order['discount']['credits']) && $order['discount']['credits']>0){

			$totalTill = $subtotal + $serviceCharges + $surCharges - $discountExemption;
			if($order['discount']['credits']>$totalTill){
				$order['discount']['credits']=$totalTill;
			}

			$discountExemption+=$order['discount']['credits'];
		}

		$total+=$serviceCharges;
		$total+=$surCharges;
		$total-=$discountExemption;

		//SET TOTAL AS ZERO IF IT IS NEGATIVE 
		if($total < 0){
			$total = 0;
		}

		$order['payment'] = [
			'subtotal' => round($subtotal,2),
			'points' => round($totalPoints,2),
			'service'=> round($serviceCharges,2),
			'discount'=> round($discountExemption,2),
			'total'=> round($total,2),
			'method' => $this->payment['method'],
		];

		$totalValue = $order['payment']['subtotal'] + $order['payment']['service'];

		$order['payment']['totalValue'] = round($totalValue,2);

		return $order;

	}

}
