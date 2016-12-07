<?php

namespace AlcoholDelivery;

use Moloquent;

use AlcoholDelivery\User;
use AlcoholDelivery\Setting;
use AlcoholDelivery\Products;
use AlcoholDelivery\User;

use mongoId;

class CartAdmin extends Moloquent
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
							'packages',
							'nonchilled',
							'delivery',
							'service',
							'discount',
							'timeslot',
							'payment',
							'status',
							'user',
							'orderType',
							'generatedBy',
							'reference'
						];
	

	public function getLastUnProcessed($adminId){

		$cart = self::where('generatedBy',$adminId)->orderBy('updated_at', 'desc')->first();

		if(!empty($cart->user)){

			$cart->addresses = [];

			$userId = (string)$cart->user;
			$user = User::find($userId);

			if($cart->orderType==='consumer'){
				$cart->consumer = [

					"_id"=> $userId,
					"name"=> $user->name,
					"mobile_number"=> $user->mobile_number,
					"email"=> $user->email
				];
				$cart->addresses = $user->address;
			}
			
		}
		

		return $cart;

	}

	public function deleteLastUnProcessed($adminId){

		try{

			$cart = self::where('generatedBy',$adminId)->orderBy('updated_at', 'desc')->first();

			$cart->delete();

			return true;

		}catch(Exception $e){

			return false;

		}
	}	

	public function generate($adminId){

		$cart = [

			"products" => [],
			"packages" => [],
			"promotions" => [],
			"delivery" => [
				"type" => 1,
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
			"generatedBy" => $adminId
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

		$cart = self::where("_id",new mongoId($id))->first();		

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

		try{

			$cart->save();			
			return $cart;

		}catch(\Exception $e){

			return false;

		}

	}

	public function setServices($cart){

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value'])->first();


		$services = $services['settings'];

		$cart["service"]["express"]["charges"] = $services['express_delivery']['value'];
		$cart["service"]["smoke"]["charges"] = $services['cigratte_services']['value'];

		$cart["service"]["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value'],
							];

		$cart["discount"]["nonchilled"]["exemption"] = $services['non_chilled_delivery']['value'];

		return $cart;

	}

	public function cartToOrder($cartKey=null){

		$productsInCartCount = $this->getProductIncartCount();

		$order = [
			'interface'=>1			
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

			$this->__set('productsLog',$order['productsLog']);

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
					$currPrice = $currPrice * $qty;

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

				if(!$isSingleSalePro){
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
				}else{

					$price = $oProduct['unitprice'];
					$discountValue = $product['sale']['discountValue'];

					if($product['sale']['discountType']===2){ //2 is for % discount

						$price = $oProduct['qtyfinal'] * ($price - ($price * $discountValue/100));

					}else{
						
						$price = $oProduct['qtyfinal'] * ($price - $discountValue);	

					}
				}

				$oProduct['price'] = $price;
				if($oProduct['qtyfinal']>0){
					$oProduct['unitprice'] = $price/$oProduct['qtyfinal'];
				}

				$subtotal+=$price;
				$order['products'][] = $oProduct;

			}

			//SET COUPON IF COUPON CODE IS APPLIED

			if($cartKey){
				$cartData = Cart::where(['_id' => $cartKey])->first();

				if(isset($cartData->coupon) && $cartData->coupon){
					$couponData = Coupon::where(['_id' => $cartData->coupon, 'status'=>1])->first();

					if(strtotime($couponData->start_date)<= time() && strtotime($couponData->end_date. ' + 1 days')>= time()){
						$coupon = $couponData->toArray();

						if (isset($coupon) && $coupon['_id']) {
							$cDiscount = $coupon['discount'];
							$cTotal = $coupon['total'];
							$discountTotal = 0;

							if(!$cTotal || ($cTotal && $cTotal <= $subtotal) ){

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
											if(!in_array((string)$catVal, $coupon['categories'])){
												$hasCategory = 1;
											}
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
										$discountAmount = $pAmount - $cDiscount;
									}else{
										$discountAmount = $pAmount - (($pAmount*$cDiscount)/100);
									}

									if($coupon['discount_status']==1 && $discountAmount > $discountedUnitPrice*$quantity){
										$discountAmount = $discountedUnitPrice*$quantity;
									}

									$discountTotal +=  $pAmount - $discountAmount;

									if($discountAmount)
										$order['products'][$key]['price'] = $discountAmount;
								}
							
								$subtotal = $subtotal - $discountTotal;


								//UPDATE COUPON COUNT AND COUPON LIST
								$user = Auth::user('user');
								$userId = new MongoId($user->_id);

								$newList = array('orderId'=> 100, 'userId'=> $userId);

								if(!isset($coupon['used_count'])){
									$used_count = 0;
								}else{
									$used_count = $coupon['used_count'];
								}

								if(isset($couponData->used_list)){
									$oldList = $coupon['used_list'];
								}else{
									$oldList = array();
								}

								array_push($oldList, $newList);

								if($couponData){
									$couponData->used_count = $used_count + 1;
									$couponData->used_list = $oldList;
									$couponData->save();
								}
							}
						}
					}
				}
			}

			//prd($order);

		}
		
		// Set Products ends //

		$created_at = strtotime('now');		
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
			$order['delivery']['deliveryDateTime'] = date('Y-m-d H:i:s',$order['timeslot']['datekey']);
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

		if($order['discount']['nonchilled']['status']){
			$discountExemption+=$order['discount']['nonchilled']['exemption'];
		}

		if(isset($order['discount']['credits']) && $order['discount']['credits']>0){
			$discountExemption+=$order['discount']['credits'];
		}

		$total+=$serviceCharges;
		$total-=$discountExemption;

		$order['payment'] = [
			'subtotal' => round($subtotal,2),
			'points' => round($totalPoints,2),
			'service'=> round($serviceCharges,2),
			'discount'=> round($discountExemption,2),
			'total'=> round($total,2),
			'method' => $this->payment['method']
		];

		return $order;

	}
	

}
