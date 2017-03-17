<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;
use AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\GiftCartRequest;
use Illuminate\Support\Facades\Log;

use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Cart;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Products;
use AlcoholDelivery\Packages;
use AlcoholDelivery\Credits;

use AlcoholDelivery\Setting;
use AlcoholDelivery\Orders;
use AlcoholDelivery\Promotion;
use AlcoholDelivery\Holiday;
use AlcoholDelivery\User;
use AlcoholDelivery\Gift;
use AlcoholDelivery\Email;

use AlcoholDelivery\CreditTransactions;
use AlcoholDelivery\LoyaltyTransactions;
use AlcoholDelivery\ErrorLog;

use AlcoholDelivery\Coupon;

use DB;
use MongoDate;
use MongoId;
use stdClass;

use AlcoholDelivery\Payment;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use View;

class CartController extends Controller
{

	/*********************************************
	
	** ErrorCode
	** 100 => Quantity requested is not available
	** 101 => Product is not available for sale
	
	*********************************************/

	public function __construct(Request $request)
	{
		
		$user = Auth::user('admin');
		if(!empty($user)){
			$this->deliverykey = session()->get('deliverykeyAdmin');
		}else{
			$this->deliverykey = session()->get('deliverykey');
		}

		$this->middleware('cart.unavailable');// check cart is available or not;
		
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request){

		$user = Auth::user('user');

		if(empty($user)){

			$cart = new Cart;
			$isCreated = $cart->generate();

			if($isCreated->success){

				$request->session()->put('deliverykey', $isCreated->cart['_id']);

				return response((array)$isCreated,200);

			}else{

				return response((array)$isCreated,400);

			}

		}else{

			$userCart = Cart::where("user","=",new MongoId($user->_id))->first();

			$cart = new Cart;
			$isCreated = $cart->generate();

			if(empty($userCart)){

				$cart = Cart::find($isCreated->cart['_id']);

				$cart->user = new MongoId($user->_id);
				try{

					$cart->save();
					$cart->setWorkingHrs();
					$cart->setAllDependencies();
					
					return response(["success"=>true,"message"=>"cart created successfully","cart"=>$cart->toArray()],200);

				}catch(\Exception $e){

					return (object)["success"=>false,"message"=>$e->getMessage()];

				}
			}
			else{

				$userCart->setWorkingHrs();
				$userCart->setAllDependencies();

				$userCart = $userCart->toArray();

				if(!isset($userCart['loyalty'])){
					$userCart['loyalty'] = [];
				}

				$productsIdInCart = array_merge(array_keys((array)$userCart['products']),array_keys((array)$userCart['loyalty']));

				$productObj = new Products;

				$productsInCart = $productObj->getProducts(
											array(
												"id"=>$productsIdInCart,
												"with"=>array(
													"discounts"
												)
											)
										);

				if(!empty($productsInCart)){

					foreach($productsInCart as $product){

						if(isset($userCart['products'][$product['_id']])){
							$userCart['products'][$product['_id']]['product'] = $product;
						}

						if(isset($userCart['loyalty'][$product['_id']])){
							$userCart['loyalty'][$product['_id']]['product'] = $product;
						}

					}

				}

				return response(["success"=>true,"message"=>"cart created successfully","cart"=>$userCart],200);

			}

			// prd("Portion due");
		}

	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function create()
	{
		prd("Create module called");
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(Request $request)
	{


	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */

	public function show(Request $request, $id){

		$cart = Cart::findUpdated($id);

		if(empty($cart)){

			$cartObj = new Cart;

			$isCreated = $cartObj->generate();

			if($isCreated->success){

				$cart = $isCreated->cart;
				return response(["sucess"=>true,"cart"=>$cart],200);

			}else{

				return response((array)$isCreated,400);

			}

		}else{

			$cart = $cart->toArray();
		}

		$isMerged = $this->mergecarts($cart['_id']);

		if($isMerged->success){

			$cart = $isMerged->cart;

		}

		if(!isset($cart['loyalty'])){
			$cart['loyalty'] = [];
		}

		if(isset($cart['coupon']) && $cart['coupon']){
			$couponData = Coupon::where(['_id' => $cart['coupon'], 'status'=>1])->first();

			if(isset($couponData->_id) && $couponData->_id){
				if(strtotime($couponData->start_date)<= time() && strtotime($couponData->end_date. ' + 1 days')>= time()){

					unset($couponData->start_date);
					unset($couponData->end_date);
					unset($couponData->csvImport);
					unset($couponData->name);
					unset($couponData->updated_at);
					unset($couponData->_id);
					unset($couponData->status);
					unset($couponData->coupon_uses);
					unset($couponData->customer_uses);

					if(!empty($couponData->products)){
						foreach ($couponData->products as $pValue) {
							$getObj = get_object_vars($pValue);
							$productList[] = $getObj['$id'];
						}
						$couponData->products = $productList;
					}

					if(!empty($couponData->categories)){
						foreach ($couponData->categories as $pValue) {
							$getObj = get_object_vars($pValue);
							$catList[] = $getObj['$id'];
						}
						$couponData->categories = $catList;
					}

					$cart['couponData'] = $couponData->toArray();
				}
			}

		}

		$productsIdInCart = array_merge(array_keys((array)$cart['products']),array_keys((array)$cart['loyalty']));

		$productObj = new Products;

		$productsInCart = $productObj->fetchProduct(
									array(
										"id"=>$productsIdInCart
									)
								);

		if(!empty($productsInCart['product'])){

			foreach($productsInCart['product'] as $product){
				
				$key = (string)$product['_id'];

				if(isset($cart['products'][$key])){

					$cart['products'][$key]['sale'] = @$product['proSales'];
					unset($product['proSales']);
					$cart['products'][$key]['product'] = $product;

				}

				if(isset($cart['loyalty'][$key])){
					$cart['loyalty'][$key]['product'] = $product;
				}

			}

		}

		$cart['products'] = (object)$cart['products'];

		// package validate and manage start
		if(!empty($cart['packages'])){

			$packagesInCart = [];
			foreach($cart['packages'] as $package){

				array_push($packagesInCart, $package['_id']);

			}

			$packages = new Packages;
			$packages = $packages->whereIn("_id",$packagesInCart)->where('status',1)->with('productlist')->get(['title','subTitle','type','description','coverImage','packageItems']);

			foreach($cart['packages'] as &$package){

				foreach($packages as &$oPackage){

					if((string)$package['_id'] === $oPackage->_id){

						$package = array_merge($package,$oPackage->toArray());

						//$package['packagePrice'] =  100; // due:: this should be calculated from server
						
						$proDetail = [];

						foreach ($package['productlist'] as $pkey => $pvalue) {

							// $proDetail[(string)$pvalue['_id']]['name'] = $pvalue['name'];
							// $proDetail[(string)$pvalue['_id']]['cartquantity'] = 0;
							$proDetail[(string)$pvalue['_id']] = [
											'name'=>$pvalue['name'],
											'cartquantity' => 0,
											'description' => $pvalue['description'],
											'shortDescription' => $pvalue['shortDescription'],
											'imageFiles' => $pvalue['imageFiles'],
											'slug' => $pvalue['slug']
										];
						}

						$addedQuantity = [];

						foreach ($package['products'] as $pkey => &$pvalue) {

							$proDetail[(string)$pvalue['_id']]['cartquantity'] = $pvalue['quantity'];
							$pDetail = $proDetail[(string)$pvalue['_id']];

							$pvalue['description'] = $pDetail['description'];
							$pvalue['shortDescription'] = $pDetail['shortDescription'];
							$pvalue['imageFiles'] = $pDetail['imageFiles'];
							$pvalue['slug'] = $pDetail['slug'];
						}

						unset($package['productlist']);
						
						foreach ($package['packageItems'] as $oPackagekey => &$oPackagevalue) {
							foreach ($oPackagevalue['products'] as &$provalue) {

								$pDetail = $proDetail[(string)$provalue['_id']];

								$provalue['name'] = $pDetail['name'];
								$provalue['cartquantity'] = $pDetail['cartquantity'];
								

							}
						}
					}					

				}

			}

		}
		// package validate and manage end

		// $request->session()->put('deliverykey', $cart['_id']);

		return response(["sucess"=>true,"cart"=>$cart],200);

	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function edit($id)
	{
		//
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function update(Request $request, $id){

		$inputs = $request->all();		
				
		$cart = Cart::find($id);

		$response = [			
			"message"=>"Something went wrong",
			"code" => 100,
			"action" => ""
		];

		// Check if requested cart id exist or not
		if(empty($cart)){
			
			$response['message'] = "Cart Not Found";
			$response['action'] = "refresh";

			return response($response,400);

		}

		$proIdToUpdate = $inputs['id'];
		$productInCart = isset($cart->products[$proIdToUpdate])?$cart->products[$proIdToUpdate]:false;
		
		// Set current quantity and sates
		$chilledQty = (int)$inputs['quantity']['chilled'];
		$nonChilledQty = (int)$inputs['quantity']['nonChilled'];

		$totalQty = $chilledQty + $nonChilledQty;

		// Check if product remove request is arise and product not available in cart.
		if($productInCart===false && $totalQty==0){

			$response['message'] = "Product is not available in cart which you want to remove";
			$response['action'] = "refresh";

			return response($response,400);

		}

		$productObj = new Products;
		$product = $productObj->fetchProduct([
						"id"=>$proIdToUpdate,
					]);


		// If Produt is not found.
		if($product['success']===false){

			$response['message'] = "Product not found";
			$response['action'] = "refresh";
			return response($response,400);

		}

		
		$product = $product['product'];

		// Handel if product goes dis-continue in middle of processing
		if($product['quantity']<1 && $product['outOfStockType']==1){

			$response['code'] = 101;
			$response['message'] = "Product is no longer available";

			$product['change'] = -$productInCart['quantity'];
			$response['product']['quantity'] = 0;

			try {
				
				if($productInCart!==false){

					$cart->unset('products.'.$proIdToUpdate);

				}
				
				return response($response,200);

			} catch(\Exception $e){

				return response($response);

			}

		}


		$updateProData = array(

			"chilled"=>array(
				"quantity"=>$chilledQty,
				"status"=>"chilled",
			),
			"nonchilled"=>array(
				"quantity"=>$nonChilledQty,
				"status"=>"nonchilled",
			),
			"quantity"=>$totalQty,
			"lastServedChilled" => (bool)$inputs['chilled'],
			"sale"=>isset($product['proSales'])?$product['proSales']:false
		);

		$oldQuantity = 0;
		
		if($productInCart!==false){

			$oldQuantity = (int)$productInCart['quantity'];

			$updateProData['chilled']['quantity']-= $productInCart['chilled']['quantity'];
			$updateProData['nonchilled']['quantity']-= $productInCart['nonchilled']['quantity'];

			$updateProData['chilled']['status'] = $productInCart['chilled']['status'];
			$updateProData['nonchilled']['status'] = $productInCart['nonchilled']['status'];

		}

		$change = $updateProData['quantity'] - $oldQuantity;//Track change in quantity

		if($change>0){

			$saleRes = $cart->setSaleAdd($proIdToUpdate,$updateProData);

		}else{

			$products = $cart->products;
			$products[$proIdToUpdate]['chilled']['quantity']+= $updateProData['chilled']['quantity'];
			$products[$proIdToUpdate]['nonchilled']['quantity']+= $updateProData['nonchilled']['quantity'];
			$products[$proIdToUpdate]['quantity'] = $products[$proIdToUpdate]['chilled']['quantity'] + $products[$proIdToUpdate]['nonchilled']['quantity'];

			$cart->__set("products",$products);

			if($change<0){
				$saleRes = $cart->setSaleRemove($proIdToUpdate,$updateProData);
			}

		}

		$cart->createAllPossibleSales();

		$proRemaining = [];
		foreach($cart->products as $key=>$cProduct){
			$proRemaining[$key] = $cProduct['remainingQty'];
		}

		$product['change'] = $change;
		
		$updateProData = $cart->products[$proIdToUpdate];

		$cart->validateGiftContainers();

		try {

			if($cart->products[$proIdToUpdate]['quantity']<1){

				$products = $cart->products;
				unset($products[$proIdToUpdate]);
				$cart->__set("products",$products);

			}

			$cart->save();

			unset($product['proSales']);
			$updateProData['product'] = $product;
			$response['message'] = "cart updated successfully";
			$response['product'] = $updateProData;
			$response['proRemaining'] = $proRemaining;
			$response['sales'] = $cart->sales;

			return response($response,200);

		} catch(\Exception $e){

			return response(["message"=>$e->getMessage()],400);
			return response(["message"=>"Something went wrong"],400);

		}

		return response(["message"=>"Something went wrong"],400);

	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $cartKey
	 * @return \Illuminate\Http\Response
	 */
	public function putLoyalty(Request $request, $cartKey)
	{

		$user = Auth::user('user');

		if($user===null){
			return response(["message"=>"login required","code"=>"401"],400);
		}
		
		$inputs = $request->all();

		$cart = Cart::find($cartKey);		

		$loyaltyAvailable = $this->getLoyaltyAvailable($cart); // LOYALTY POINTS AVAILABLE BEFORE ADD NEW PRODUCT
		
		if($loyaltyAvailable===false || $loyaltyAvailable<0){

			$cart->removeAllLoyaltyProduct();			
			$cart->save();
			return response(["message"=>"There is some thing wrong with loyalty products, Resetting loyalty products in cart","action"=>'refresh'],405);

		}

		$proIdToUpdate = $inputs['id'];

		$response = [
			"message"=>"Something went wrong",
			"code" => 000,
		];		

		if(!isset($cart->loyalty)){
			$cart->loyalty = [];
		}

		$product = Products::where("_id",$proIdToUpdate)
					->where("status",1)
					->where("isLoyalty",1)					
					// ->where(function($query){
					// 	$query->where("quantity",'>',0)
					// 		  ->orWhere("outOfStockType",2);
					// })
					->first([
						'chilled',
						'description',
						
						'loyaltyValueType',
						'loyaltyValuePoint',
						'loyaltyValuePrice',

						'imageFiles',
						'name',
						'slug',
						'shortDescription',
						'sku',
						'quantity',
						'deliveryType',
						'outOfStockType',
						'availabilityDays',
						'availabilityTime'
					]);

		if(is_null($product)){

			return response(["message"=>"Product not found"],405);

		}

		$productInCart = isset($cart->loyalty[$proIdToUpdate])?$cart->loyalty[$proIdToUpdate]:false;

		$chilledQty = (int)$inputs['quantity']['chilled'];
		$nonChilledQty = (int)$inputs['quantity']['nonChilled'];

		$totalQty = $chilledQty + $nonChilledQty;

		$updateProData = array(

				"_id" => new mongoId($proIdToUpdate),
				"chilled"=>array(
					"quantity"=>$chilledQty,
					"status"=>"chilled",
				),
				"nonchilled"=>array(
					"quantity"=>$nonChilledQty,
					"status"=>"nonchilled",
				),
				"quantity"=>$totalQty,
				"lastServedChilled" => (bool)$inputs['chilled'],
				"points"=>$product['loyaltyValuePoint']
			);

		$oldQuantity = 0;

		if($productInCart!==false){

			$oldQuantity = (int)$productInCart['quantity'];

			$updateProData['chilled']['status'] = $productInCart['chilled']['status'];
			$updateProData['nonchilled']['status'] = $productInCart['nonchilled']['status'];

		}

		$changeInQty = $updateProData['quantity'] - $oldQuantity;//Track change in quantity
		
		$loyaltyRequired = (float)($product['loyaltyValuePoint'] * $changeInQty);

		if($changeInQty>0){

			if($loyaltyAvailable < $loyaltyRequired){

				return response([
						"message"=>"not sufficient loyalty points",
						"quantity"=>[
							"chilled"=>$productInCart!==false?$productInCart['chilled']['quantity']:0,
							"nonchilled"=>$productInCart!==false?$productInCart['nonchilled']['quantity']:0
						]
					],400);
			}

		}		

		try {

			if($updateProData['quantity']>0){

				$result = DB::collection('cart')->where('_id', new MongoId($cartKey))
										->update(["loyalty.".$proIdToUpdate=>$updateProData], ['upsert' => true]);

			}else{

				$cart->unset('loyalty.'.$proIdToUpdate);

			}

			$updateProData['product'] = $product;			
			$response['message'] = "loyalty product updated successfully";

			$response['change'] = $changeInQty;
			$response['product'] = $updateProData;

			return response($response,200);

		} catch(\Exception $e){

			Log::warning("Loyalty Product Add : ".$e->getMessage());

		}

		return response(["message"=>"Something went wrong"],400);

	}


	public function putCreditCertificate(Request $request, $cartKey) {

		$user = Auth::user('user');
		
		$inputs = $request->all();
		$value = $inputs['id'];
		$cart = Cart::find($cartKey);

		$CreditsObj = new Credits;
		$result = $CreditsObj->getCredit($value);

		if($result->success === false){
			return response(["message"=>"Card not found"],400);
		}

		$card = $result->card;

		$loyaltyAvailable = $this->getLoyaltyAvailable($cart); // LOYALTY POINTS AVAILABLE BEFORE ADD NEW PRODUCT

		if($loyaltyAvailable===false || $loyaltyAvailable<0){

			$cart->removeAllLoyaltyProduct();			
			$cart->save();
			return response(["message"=>"There is some thing wrong with loyalty products, Resetting loyalty products in cart","action"=>'refresh'],400);

		}

		$loyaltyCards = $cart->getLoyaltyCards();

		$change = $inputs['quantity'];
		$alreadyInCartQty = 0;
		if(isset($loyaltyCards[$value])){

			$alreadyInCartQty = $loyaltyCards[$value]['quantity'];
			$change = $inputs['quantity'] - $alreadyInCartQty;
		}
		
		if($change>0){

			$ableToadd = floor($loyaltyAvailable/$card['loyalty']);
			
			if($ableToadd < $change){
				$change = $ableToadd;
			}

			if($change == 0){

				return response(["message"=>"In sufficient points",'quantity'=>$alreadyInCartQty],400);

			}

			$inputs['quantity'] = $change + $alreadyInCartQty;
		}

		$loyaltyCards[$value] = [
			'quantity'=>$inputs['quantity'],
			'points'=> $card['loyalty']
		];

		try{


			$cart->__set("loyaltyCards",$loyaltyCards);

			$cart->save();			

			return response(["message"=>"Credit added successfully",'change'=>$change,'card'=>$loyaltyCards[$value]],200);

		}catch(\Exception $e){

			Log::warning($e->getMessage());
			return response(["message"=>"Something went wrong"],400);			

		}	

	}

	private function getLoyaltyAvailable($cart){

		if(is_object($cart)){

			$user = Auth::user('user');
			$userLoyaltyPoints = isset($user['loyalty']['total'])?$user['loyalty']['total']:0;			
			$pointsUsed = $cart->getLoyaltyPointUsed();
			return $userLoyaltyPoints - $pointsUsed;

		}

		return false;

	}

	public function postPackage(Request $request, $cartKey){
	
			$inputs = $request->all();
			$packageId = $inputs['id'];
			$products = $inputs['products'];
			$quantity = $inputs['quantity'];

			$price = $inputs['price'];
			$saving = $inputs['savings'];

			$cart = Cart::find($cartKey);
	
			$packages = $cart->packages;
	
			if(empty($packages)){
	
				$packages = [];
	
			}


			$packageDetail = [
				'_unique' => new mongoId(),
				"products" => $products,
				"packageQuantity" => abs($quantity),
				"_id" => new mongoId($packageId),
				"packagePrice" => $price,
				"saving" => $saving
			];			
		
			$response = [
				"message"=>"cart updated successfully"
			];

			// if(isset($packageDetail['unique'])){
	
			// 	foreach ($packages as $key => $package) {
	
			// 		if(!isset($package["_unique"])){
			// 			unset($packages[$key]);
			// 			continue;
			// 		}

			// 		if($package["_unique"]==$packageDetail['unique']){
			// 			unset($packages[$key]);
			// 			$packageDetail['_unique'] = $package["_unique"];
			// 			break;
			// 		}
	
			// 	}
			// }

			try {
		
				$result = Cart::where('_id', $cartKey)->push('packages',$packageDetail);
				
				$response['key'] = (string)$packageDetail['_unique'];

				return response($response,200);
	
			} catch(\Exception $e){
				
				Log::warning("Package Insert : ".$e->getMessage());
	
			}

			$response = ["message"=>"Something went wrong"];
			return response($response,400);
	
	}

	public function putPackage($uniqueId, $cartKey, Request $request){
	
			$inputs = $request->all();
			
			$quantity = $inputs['quantity'];

			$response = [
				"message"=>"cart updated successfully"
			];

			try {
						
				if(isset($inputs['products'])){
					
					$update = [

						"packages.$.products" => $inputs['products'],
						"packages.$.packageQuantity" => abs($quantity),
						"packages.$.packagePrice" => $inputs['price'],
						"packages.$.saving" => $inputs['savings']
					];
					
				}else{

					$update = [
						"packages.$.packageQuantity" => abs($quantity)
					];

				}

				$result = DB::collection('cart')->raw()->update(
							[
								'_id' => new MongoId($cartKey),
								'packages._unique'=>new MongoId($uniqueId)
							],
							[
								'$set' => $update
							]
						);

				return response($response,200);
	
			} catch(\Exception $e){
				
				Log::warning("Package Update : ".$e->getMessage());
	
			}

			$response = ["message"=>"Something went wrong"];
			return response($response,400);
	
	}

	public function deletePackage($packageUId,$cartKey){
		
		$response = ["message"=>""];

		$cart = Cart::find($cartKey);
		
		$packages = $cart->packages;

		if(empty($packages)){

			$response['message'] = 'no package to remove';

			return response($response,405);

		}
		
		try{

			$isRemoved = DB::collection('cart')->where('_id', $cartKey)->pull('packages', ['_unique' => new MongoId($packageUId)]);

			$response['message'] = 'package removed successfully';

			$response['data'] = $isRemoved;

			return response($response,200);
			

		}catch(\Exception $e){

			$response['message'] = $e->getMessage();

			Log::warning($response['message']);

		}

		return response(["message"=>"Something went wrong"],400);

	}

	public function putPromotion(Request $request, $cartKey){

		$productId = $request->input('id');

		$promoId = $request->input('promoId');

		$chilled = $request->input('chilled');

		$cart = Cart::find($cartKey);

		if(empty($cart)){

			return response(array("success"=>false,"message"=>"cart not found"),400);

		}

		$cartPromotion = $cart->__get("promotions");

		if(!is_array($cartPromotion)){
			$cartPromotion = [];
		}

		$promotion = Promotion::find($promoId);

		if(empty($promotion)){
			return response(array("success"=>false,"message"=>"promotion not found"),400);
		}

		$isInPromotion = false;
		foreach($promotion['items'] as $product){

			if((string)$product["_id"] == $productId){
				$isInPromotion = true;
			}

		}

		if($isInPromotion===false){
			return response(array("success"=>false,"message"=>"product not in promotion"),400);
		}

		$isPromotionInCart = false;

		foreach($cartPromotion as $key => $promotion){

			if($promotion['promoId']===$promoId){

				unset($cartPromotion[$key]);

			}

		};

		$promoToInsert = [
			"productId" => $productId,
			"promoId" => $promoId,
			"chilled" => $chilled===true?1:0
		];

		$cartPromotion = array_merge([$promoToInsert],$cartPromotion);

		try{

			$cart->__set("promotions",$cartPromotion);

			$cart->save();

			return response(["success"=>true,"message"=>"promotion added successfully"],200);

		}catch(\Exception $e){

			return response(["success"=>false,"message"=>$e->getMessage()],400);

		}

	}

	public function mergecarts($cartKey){

		$user = Auth::user('user');

		$cart = "";

		if(isset($user->_id)){

			$userCart = Cart::where("user","=",new MongoId($user->_id))
							->where("_id","!=",new MongoId($cartKey))
							->whereNull("generatedBy")->first();

			$sessionCart = Cart::find($cartKey);

			if(!empty($sessionCart->products) || empty($userCart)){

				$sessionCart->user = new MongoId($user->_id);

				try{

					$sessionCart->save();

					if(!empty($userCart)){

						$userCart->delete();

					}
					
					$sessionCart->setWorkingHrs();
					$sessionCart->setAllDependencies();

					return (object)["success"=>true,"message"=>"cart merge successfully","cart"=>$sessionCart->toArray()];

				}catch(\Exception $e){
					return (object)["success"=>false,"message"=>$e->getMessage()];
				}

			}

			$userCart->setWorkingHrs();
			$userCart->setAllDependencies();
			
			return (object)["success"=>true,"message"=>"cart merge successfully","cart"=>$userCart->toArray()];

		}else{
			return (object)["success"=>false,"message"=>"login required to merge"];
		}

		return (object)["success"=>false,"message"=>"something went wrong"];

	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($id)
	{
		//
	}

	public function updateProductChilledStatus(Request $request,$cartKey){

		$cart = Cart::find($cartKey);

		$productId = $request->input('id');
		$chilled = $request->input('chilled');
		$nonchilled = $request->input('nonchilled');

		$product = $cart->products[$productId];

		$product['chilled']['status'] = $chilled?'chilled':'nonchilled';
		$product['nonchilled']['status'] = $nonchilled?'chilled':'nonchilled';

		$products = array_merge($cart->products,[$productId=>$product]);

		$cart->__set("products",$products);

		try{

			$cart->save();
			return response(["success"=>true,"message"=>"status changed"],200);

		}catch(\Exception $e){

			return (object)["success"=>false,"message"=>$e->getMessage()];

		}

	}

	public function updateLoyaltyChilledStatus(Request $request,$cartKey){

		$cart = Cart::find($cartKey);

		$productId = $request->input('id');
		$chilled = $request->input('chilled');
		$nonchilled = $request->input('nonchilled');

		$lProduct = $cart->getLoyaltyProductById($productId);

		$lProduct['chilled']['status'] = $chilled?'chilled':'nonchilled';
		$lProduct['nonchilled']['status'] = $nonchilled?'chilled':'nonchilled';

		$lProducts = $cart->getLoyaltyProducts();
		$lProducts[$productId] = $lProduct;

		$cart->__set("loyalty",$lProducts);

		try{

			$cart->save();
			return response(["message"=>"status changed"],200);

		}catch(\Exception $e){

			return response(["message"=>$e->getMessage()]);

		}

	}	

	public function updatePromoChilledStatus(Request $request,$cartKey){
		
		$promoId = $request->input('id');
		$chilled = $request->input('chilled');				

		try{

			$cart = Cart::where("_id",$cartKey)
					->where("promotions.promoId",$promoId)										
					->update(["promotions.$.chilled"=>$chilled]);
			
			return response(["message"=>"status changed"],200);

		}catch(\Exception $e){

			return response(["message"=>$e->getMessage()],400);

		}

	}	

	public function putGiftProductChilledStatus(Request $request,$giftUid){
		
		$productId = $request->input('id');
		$state = $request->input('state');
		
		$cartKey = $this->deliverykey;

		$cart = Cart::where("_id",$cartKey)
						->where("gifts._uid",new mongoId($giftUid))
						->where("gifts.products.quantity",3) //$productId
						->where("gifts.products.state",$state)
						->update(["gifts.0.products.$.chilled"=>"asdasdasasadads"]);

		$product = $cart->products[$productId];

		$product['chilled']['status'] = $chilled?'chilled':'nonchilled';
		$product['nonchilled']['status'] = $nonchilled?'chilled':'nonchilled';

		$products = array_merge($cart->products,[$productId=>$product]);

		$cart->__set("products",$products);

		try{

			$cart->save();
			return response(["success"=>true,"message"=>"status changed"],200);

		}catch(\Exception $e){

			return (object)["success"=>false,"message"=>$e->getMessage()];

		}

	}

	public function putSaleChilledStatus($cartKey,Request $request){
				
		$saleId = $request->input('id');
		$chilled = $request->input('chilled');				

		try{

			$cart = Cart::where("_id",$cartKey)
					->where("sales._id",new mongoId($saleId))										
					->update(["sales.$.chilled"=>$chilled]);
			
			return response(["message"=>"status changed"],200);

		}catch(\Exception $e){

			return response(["message"=>$e->getMessage()],400);

		}

	}

	public function getDeliverykey(Request $request){

		$arr = [];
		$deliverykey = $request->session()->get('deliverykey');

		// if(!empty($deliverykey)){
		// 	$arr['deliverykey'] = $deliverykey;
		// 	return response($arr,200);
		// }

		$user = Auth::user('user');

		$cart = "";

		if(isset($user->_id)){

			$cart = Cart::where("user","=",$user->_id);

		}

		if(!isset($cart->_id)){

			$cart = new Cart;
			$cart->products = [];

			try {

				$cart->save();
				$arr['deliverykey'] = $cart->_id;

			} catch(\Exception $e){

				return response(array("success"=>false,"message"=>$e->getMessage()));

			}

		}

		$arr['deliverykey'] = $cart->_id;

		$request->session()->put('deliverykey', $arr['deliverykey']);

		return response($arr,200);

	}

	public function getServices(){

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value'])->first();

		$services = $services['settings'];

		$serviceRes = [
			"express"=>$services['express_delivery']['value'],
			"smoke"=>$services['cigratte_services']['value'],
			"chilled"=>$services['non_chilled_delivery']['value'],
			"mincart"=>$services['minimum_cart_value']['value'],
			"delivery"=>$services['non_free_delivery']['value'],

		];

		return response($serviceRes,200);

	}

	public function getTimeslots($date){

		$timeSlots = Setting::where("_id","=","timeslot")->get(['settings'])->first();
		$timeSlots = $timeSlots['settings'];

		$minTimeStr = strtotime(date('Y-m-d'));
		$passedTimeStr = strtotime($date);

		$skipMinutes = 120;

		if($passedTimeStr < $minTimeStr){
			return response([
						"message"=>"In-valid date passed, Time slot is not available for previous date"
					],400);
		}

		$endDateTimeStr = strtotime("+7 day", $passedTimeStr);

		$query = [
					[
						'$match' => [
							"delivery.deliveryKey" => [ '$exists' => true ],
							"delivery.deliveryKey" => [
								'$gte'=> $passedTimeStr, 
								'$lt'=> $endDateTimeStr
							],
							"status" => [ '$ne'=>3 ]
						]
					],
					[
						'$project' => [
							'_id' => 0,
					 		'deliveryKey' => '$delivery.deliveryKey'
						]
					]
					// [
					// 	'$project'=> [
					// 		'_id' => 0,
					// 		'deliveryKey' => [
					// 			'$floor' => [
					// 				'$divide' => [
					// 					[
					// 						'$mod' => [
					// 							'$delivery.deliveryKey',86400
					// 						]
					// 					],
					// 					60
					// 				]
					// 			]
					// 		],
					// 	]
					// ],
					// [
					// 	'$group' => [
					// 		'_id'=>'$deliveryKey',							
					// 		'count' => [ '$sum'=>1 ] 
					// 	]
					// ]
				];

		$orders = Orders::raw()->aggregate($query);
		$orders = $orders['result'];
		$start = (float)$passedTimeStr*1000;
		$end = (float)(strtotime('+6 days',$passedTimeStr)*1000);
		
		// $holiday = new Holiday;
		// $holidays = $holiday->getHolidays(
		// 	[
		// 		'start'=>$start, 
		// 		'end'=>$end
		// 	]
		// )

		$currDate = date("Y-m-d", $minTimeStr);

		$passedDate = date("Y-m-d",$passedTimeStr);

		$weeknumber = date("N",strtotime($passedDate));//return "3" for wednesday

		$weekDaysOff = [];
		$holidayTimestamp = [];
		// foreach($holidays as $holiday){
		// 	if($holiday['_id']==="weekdayoff"){
		// 		$weekDaysOff = $holiday['dow'];
		// 	}else{
		// 		$holidayTimestamp[] = ($holiday['timeStamp'])/1000;
		// 	}
		// }

		$weekKeys = array(

			"1"=>"mon",
			"2"=>"tue",
			"3"=>"wed",
			"4"=>"thu",
			"5"=>"fri",
			"6"=>"sat",
			"7"=>"sun"
		);

		$slotArr = [];

		$tempDate = $passedDate;
		
		$currentTimeStr = getServerTime();

		$todayDateStr = strtotime(date("Y-m-d",$currentTimeStr));
		$slotsActiveAfter = round(($currentTimeStr - $todayDateStr)/60) + $skipMinutes;

		for($i=1;$i<=7;$i++){

			$datekey = strtotime($tempDate);
			$datestamp = date("d M",$datekey);
			$currTimeSlots = $timeSlots[$weeknumber-1];

			foreach($currTimeSlots as &$timeSlot){

				$floorTime = $datekey + $timeSlot['from'] * 60;
				$ceilTime = $datekey + $timeSlot['to'] * 60;

				foreach ($orders as $order) {
					if($order['deliveryKey']>=$floorTime && $order['deliveryKey']<$ceilTime){
						$timeSlot['orderlimit']-=1;						
					}
				}

				if($timeSlot['orderlimit']<1){
					$timeSlot['status'] = 0;
				}

			}

			$status = 1;

			if(in_array($weeknumber==7?0:$weeknumber, $weekDaysOff) || in_array($datekey,$holidayTimestamp) || $datekey<$todayDateStr){
				$status = 0;
			}


			if($datekey===$todayDateStr){

				foreach ($currTimeSlots as $key => &$slot) {
					if($slot['from']<$slotsActiveAfter){
						$slot['status'] = 0;
					};
				}
			}

			foreach ($currTimeSlots as $key => &$slot) {
				$slot['slotCeilKey'] = $datekey + ($slot['to'] * 60);
				$slot['slotFloorKey'] = $datekey + ($slot['from'] * 60);
			}

			$slotArr[$weekKeys[$weeknumber]] = [
				'slots' => $currTimeSlots,
				'datestamp' => $datestamp,
				'datekey' => $datekey,
				'status' => $status
			];

			$tempDate = date("Y-m-d",strtotime('+1 day', strtotime($tempDate)));

			if($weeknumber==7){
				$weeknumber = 0;
			}

			$weeknumber++;

		}

		return response($slotArr,200);
	}

	public function deleteProduct($cartKey,$proId,$type){		

		$cart = Cart::find($cartKey);

		$state = $type?'chilled':'nonchilled';

		if(empty($cart)){

			return response(["message"=>"cart not found"],400);

		}

		$products = $cart->products;
		$product = $products[$proId];
		
		if(empty($product)){

			return response(["message"=>"Invalid delete request","action"=>"refresh"],400);

		}

		$qtyRemaining = $product['remainingQty'];
		$qtyChilled = $product['chilled']['quantity'];
		$qtyNonChilled = $product['nonchilled']['quantity'];

		if($type=="true"){

			$qtyToRemove = $qtyRemaining - $qtyNonChilled;

			if($qtyToRemove<1){

				return response(["message"=>"Invalid delete request","action"=>"refresh"],400);

			}

			$qtyChilled-= $qtyToRemove;

		}else{			

			if($qtyRemaining>$qtyNonChilled){

				$qtyToRemove = $qtyNonChilled;

			}else{

				$qtyToRemove = $qtyRemaining;

			}

			$qtyNonChilled-= $qtyToRemove;
		}



		$product['chilled']['quantity'] = $qtyChilled;
		$product['nonchilled']['quantity'] = $qtyNonChilled;
		$product['quantity'] = $qtyChilled + $qtyNonChilled;
		$product['remainingQty']-= $qtyToRemove;
		
		$products[$proId] = $product;		

			try {

				if($products[$proId]['quantity']>0){

					$cart->products = $products;

					$cart->save();

					return response(["message"=>"cart updated successfully","removeCode"=>200,"product"=>$product,'change'=>$qtyToRemove],200);
					//200 to know only chilled/nonchilled is removed

				}else{

					$cart->unset('products.'.$proId);

					return response(["message"=>"cart updated successfully","removeCode"=>300,'change'=>$qtyToRemove],200);
					//300 to know complete product is removed

				}


			} catch(\Exception $e){
				
				Log::warning("Delete Product : ".$e->getMessage());

			}

		return response(array("success"=>false,"message"=>"Something went wrong"));

	}	

	public function deleteSale($cartKey,$saleId,Request $request){
		
		$cart = Cart::find($cartKey);

		if(empty($cart)){

			return response(array("success"=>false,"message"=>"cart not found"),400);

		}

		$sales = $cart->sales;		

		if(empty($sales)){
			return response(["success"=>false,"message"=>"no sale to remove"],400);
		}
		
		try{

			$isRemoved = $cart->removeSaleById($saleId);

			if($isRemoved){

			}

			$cart->save();

			$response = [
				"message"=>"sale removed successfully",
			];			

			return response($response,200);

		}catch(\Exception $e){
			
			Log::warning("Delete Sale : ".$e->getMessage());

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);

	}

	public function deleteGift($giftUId,$cartKey){

		// $cartKey = $this->deliverykey;

		$cart = Cart::find($cartKey);

		if(empty($cart)){

			return response(array("success"=>false,"message"=>"cart not found"),400);

		}

		$gifts = $cart->gifts;

		if(empty($gifts)){
			return response(["success"=>false,"message"=>"no gift to remove"],400);
		}
		
		try{

			$isRemoved = DB::collection('cart')->where('_id', $cartKey)->pull('gifts', ['_uid' => new MongoId($giftUId) ]);
			
			return response(["success"=>true,"message"=>"gift removed successfully"],200);

		}catch(\Exception $e){
			
			Log::warning("Delete Gift : ".$e->getMessage());

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);

	}

	public function deleteLoyaltyProduct($cartKey,$proId,$type){		

		$cart = Cart::find($cartKey);
		
		$loyalty = $cart->getLoyaltyProductById($proId);		

		if($loyalty === false){
			return response(["message"=>"Product not found"],405);
		}
		
		if($type){
			$loyalty['chilled']['quantity'] = 0;
		}else{
			$loyalty['nonchilled']['quantity'] = 0;
		}

		$total = $loyalty['chilled']['quantity'] + $loyalty['nonchilled']['quantity'];

		try{

			$loyaltyPros = $cart->loyalty;

			if($total>0){
				$loyaltyPros[$proId] = $loyalty;				
			}else{
				unset($loyaltyPros[$proId]);
			}

			if(empty($loyaltyPros)){
				$loyaltyPros = new stdClass();
			}

			$cart->__set("loyalty",$loyaltyPros);
			
			$cart->save();

			return response(["message"=>"Removed successfully"],200);

		}catch(\Exception $e){

			Log::warning("Delete Loyalty Product : ".$e->getMessage());

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);

	}

	public function deleteLoyaltyCard($cartKey,$value){		

		$cart = Cart::find($cartKey);
		
		$loyaltyCard = $cart->getLoyaltyCardByValue($value);

		if($loyaltyCard === false){
			return response(["message"=>"Card not found"],405);
		}

		try{

			$loyaltyCards = $cart->loyaltyCards;
					
			unset($loyaltyCards[$value]);
			
			if(empty($loyaltyCards)){
				$loyaltyCards = new stdClass();
			}
			
			$cart->__set("loyaltyCards",$loyaltyCards);
			
			$cart->save();

			return response(["message"=>"Removed successfully"],200);

		}catch(\Exception $e){

			Log::warning("Delete Loyalty Card : ".$e->getMessage());

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);

	}
	

	public function deleteCard($cartKey,$cardUId,Request $request){

		$cart = Cart::find($cartKey);
				
		$giftCards = $cart->giftCards;

		if(empty($giftCards)){
			return response(["success"=>false,"message"=>"no cards to remove"],400);
		}
		
		try{

			$isRemoved = DB::collection('cart')->where('_id', $cartKey)->pull('giftCards', ['_uid' => new MongoId($cardUId) ]);

			return response(["success"=>true,"message"=>"gift cards removed successfully"],200);

		}catch(\Exception $e){
			
			Log::warning("Delete Card : ".$e->getMessage());

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);

	}

	public function deletePromotion($cartKey,$promoId,Request $request){

		$cart = Cart::find($cartKey);

		if(empty($cart)){
			return response(array("success"=>false,"message"=>"cart not found"),400);
		}

		$promotions = $cart->promotions;

		if(empty($promotions)){
			return response(["success"=>false,"message"=>"no promotion to remove"],400);
		}

		foreach ($promotions as $key => $promotion) {
			if($promotion['promoId'] == $promoId){
				unset($promotions[$key]);
			}
		}

		try{

			$cart->__set("promotions",$promotions);
			$cart->save();

			return response(["success"=>true,"message"=>"promotion removed successfully"],200);

		}catch(\Exception $e){
			
			Log::warning("Delete Promotion : ".$e->getMessage());

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);
	}

	public function confirmorder(Request $request,$cartKey = null){
		
		$user = Auth::user('user');
		
		$userObj = User::find($user->_id);

		//$cart = Cart::where("_id","=",$cartKey)->where("freeze",true)->first();

		if($cartKey == null)
			$cartKey = $request->get('merchant_data1');
		
		$cart = Cart::findUpdated($cartKey);

		$isValidate = $cart->validate();

		if($isValidate['valid']===false){
			return response($isValidate,400);
		}		

		if(empty($cart) && $request->isMethod('get') && $request->get('order_number')){
			$order = Orders::where(['reference' => $request->get('order_number')])->first();
			if($order)
				return redirect('/orderplaced/'.$order['_id']);
		}

		if(empty($cart)){
			if($request->isMethod('get'))
				return redirect('/');	
			else	
				return response(["success"=>false,"message"=>"cart not found"],405); //405 => method not allowed
		}

		$cartArr = $cart->toArray();

		$cartArr['user'] = new MongoId($user->_id);		

		try {	

			//FORMAT CART TO ORDER
			$orderObj = $cart->cartToOrder($cartKey);		
			$cartArr['payment']['total'] = $orderObj['payment']['total'];
			//PREPARE PAYMENT FORM DATA
			if(!$request->isMethod('get') && $cartArr['payment']['method'] == 'CARD' && $cartArr['payment']['total']>0){
				$payment = new Payment();
				$paymentres = $payment->prepareform($cartArr,$user);
				return response($paymentres,200);
			}

			//CHECK FOR PAYMENT RESULT
			if($request->isMethod('get') && $cartArr['payment']['method'] == 'CARD'){
				$rdata = $request->all();
				//VALIDATE RESPONSE SO IT IS VALID OR NOT
				$payment = new Payment();				
				$failed = false;
				if(!$payment->validateresponse($rdata) || ($rdata['result']!='Paid')){					
					$failed = true;										
				}

				unset($rdata['signature']);					

				$paymentres = ['paymentres' => $rdata];

				$cart->payment = array_merge($cartArr['payment'],$paymentres);

				$cart->save();

				$this->logtofile($rdata);

				if($failed){
					return redirect('/cart/payment');
				}
			}

			

			$defaultContact = true;
			if(!isset($orderObj['delivery']['newDefault']) || $orderObj['delivery']['newDefault']!==true){
				$defaultContact = false;
			}
			$userObj->setContact($orderObj['delivery']['contact'],$defaultContact);
			
			//CREATE ORDER FROM CART & REMOVE CART
			$order = Orders::create($orderObj);

			$cart->delete();

			$process = $order->processGiftCards();

			$reference = $order->reference;

			if(isset($order->coupon)){

				$cRedeem = [
					"coupon" => $order->coupon['_id'],
					"reference"=>$order->reference,
					"user" => $order->user
				];
				$coupon = new coupon;
				$coupon->redeemed($cRedeem);

			}

			if(isset($order->discount['credits']) && $order->discount['credits']>0){

				$creditsUsed = $order->discount['credits'];
				$creditObj = [
								"credit"=>$creditsUsed,
								"method"=>"order",
								"reference" => $reference,
								"user" => new mongoId($user->_id),
								"comment"=> "You have used this credits with an order"
							];

				CreditTransactions::transaction('debit',$creditObj,$userObj);

			}

			if(isset($order->creditsFromLoyalty) && $order->creditsFromLoyalty>0){

				$creditsFromLoyalty = $order['creditsFromLoyalty'];
				
				$creditObj = [
								"credit"=>$creditsFromLoyalty,
								"method"=>"order",
								"reference" => $reference,
								"user" => new mongoId($user->_id),
								"comment"=> "You have earned this credits in exchange of loyalty points"
							];
				
				CreditTransactions::transaction('credit',$creditObj,$userObj);

			}

			if($order['loyaltyPointUsed']>0){

				$loyaltyObj = [
								"points"=>$order['loyaltyPointUsed'],
								"method"=>"order",
								"reference" => $reference,
								"user" => new mongoId((string)$userObj->_id),
								"comment"=> "You have used this points by making a purchase on our website"
							];

				LoyaltyTransactions::transaction('debit',$loyaltyObj,$userObj);

			}

			$loyaltyPoints = $order['loyaltyPointEarned'];

			if($loyaltyPoints>0){

				$loyaltyObj = [
						"points"=>$loyaltyPoints,
						"method"=>"order",
						"reference" => $reference,
						"user" => new mongoId((string)$userObj->_id),
						"comment"=> "You have earned this points by making a purchase"
					];
		
				LoyaltyTransactions::transaction('credit',$loyaltyObj,$userObj);

			}

			$request->session()->forget('deliverykey');
			
			//SAVE CARD IF USER CHECKED SAVE CARD FOR FUTURE PAYMENTS
			if($cartArr['payment']['method'] == 'CARD' && $cartArr['payment']['card'] == 'newcard' && $cartArr['payment']['savecard']){
				$cardInfo = $cartArr['payment']['creditCard'];		        
		        $userObj->push('savedCards',$cardInfo,true);
			}

			//Update inventory if order is 1 hour delivery
			if($order['delivery']['type'] == 0){
				$model = new Products();
				$model->updateInventory($order);
			}

			//CONFIRMATION EMAIL 
			$emailTemplate = new Email('orderconfirm');
			$mailData = [
                'email' => strtolower($userObj->email),
                'user_name' => ($userObj->name)?$userObj->name:$userObj->email,
                'order_number' => $reference
            ];

            $order->placed();

			if($request->isMethod('get')){
				return redirect('/orderplaced/'.$order['_id']);
			}

			return response(array("success"=>true,"message"=>"Order Placed Successfully","order"=>$order['_id']));

		} catch(\Exception $e){

				ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Cart Confirm'
				]);

		}

		return response(["message"=>'Something went wrong'],400);
		
	}


	public function confirmordertest(Request $request,$cartKey = null){

		if($request->getHost()!=="192.168.1.222"){
			prd("Don't try to be smart :)");
		}

		$order['loyaltyPointUsed'] = 200;
		$reference = "ABCDEFGH";
		$userObj = User::find("57c422d611f6a1450b8b456c"); // for testing

		$loyaltyObj = [
						"points"=>$order['loyaltyPointUsed'],
						"method"=>"order",
						"reference" => $reference,
						"user" => new mongoId((string)$userObj->_id),
						"comment"=> "You have used this points by making a purchase on our website"
					];

		LoyaltyTransactions::transaction('debit',$loyaltyObj,$userObj);

		prd("test complete");
		
		$cart = Cart::find($cartKey);

		$orderObj = $cart->cartToOrder($cartKey);

		prd("test converterd cart");


		return response(["message"=>'Something went wrong'],400);
		
	}


	private function setCartProductsList(&$cart){


		$products = isset($cart['products'])?$cart['products']:[];
		$packages = isset($cart['packages'])?$cart['packages']:[];
		$promotions = isset($cart['promotions'])?$cart['promotions']:[];
		$loyaltys = isset($cart['loyalty'])?$cart['loyalty']:[];

		$proArr = [];
		foreach($products as $proKey=>$pro){
			$proArr[$proKey] = $pro["quantity"];
		}

		foreach($packages as $package){

			foreach($package['products'] as $product){

				if(isset($proArr[$product['_id']])){

					$proArr[$product['_id']] += $product['quantity'];

				}else{

					$proArr[$product['_id']] = $product['quantity'];

				}

			}

		}

		foreach($promotions as $promotion){

			if(isset($proArr[$promotion['productId']])){

				$proArr[$promotion['productId']] += 1;

			}else{

				$proArr[$promotion['productId']] = 1;

			}
			
		}
		
		foreach($loyaltys as $lProKey=>$lPro){
			$proArr[$lProKey] = $lPro["quantity"];
		}

		$oPro = [];
		foreach($proArr as $proKey=>$quantity){
			$oPro[] = ["_id"=>new mongoId($proKey),"quantity"=>$quantity];
		}

		$cart['productsLog'] = $oPro;

	}

	public function deploycart(Request $request,$cartKey){

		$cart = Cart::find($cartKey);

		if(empty($cart)){
			return response(array("success"=>false,"message"=>"something went wrong with cart"));
		}

		$params = $request->all();

		if(isset($params['nonchilled'])){
			$cart->nonchilled = $params['nonchilled'];
		}

		if(isset($params['delivery'])){
			$cart->delivery = $params['delivery'];
		}

		if(isset($params['service'])){
			$cart->service = $params['service'];
		}

		if(isset($params['payment'])){
			$cart->payment = $params['payment'];
			//RESET PAYMENT RESPONSE
			$paymentinfo = $cart->payment; 
			unset($paymentinfo['paymentres']);
			$cart->payment = $paymentinfo;
		}

		if(isset($params['discount'])){
			$cart->discount = $params['discount'];
		}


		if(isset($params['timeslot'])){

			$cart->timeslot = $params['timeslot'];

		}

		//SET CART REFERENCE FOR ORDER ID
		$cart->setReference();

		try {

			$cart->save();

			return response(array("success"=>true,"message"=>"cart updated successfully"));

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));

		}

		return response(array("success"=>false,"message"=>"Something went wrong"));

	}

	public function freezcart($cartKey,Request $request){

		$cartObj = new Cart;

		$cart = Cart::findUpdated($cartKey);

		// if(isset($cart->freeze) && $cart->freeze===true){

		// 	return response(["success"=>true,"message"=>"Cart is already freezed"],200);
		// 	return response(["success"=>false,"message"=>"Cart is already freezed"],405); //405 => method not allowed

		// }
		
		//$isValid = $this->validateCart($cartArr);
		$isValid['valid'] = true;

		if($cart->delivery['type'] ==0 && !$cart->isUnderWorkingHrs()){
			$isValid['valid'] = false;
		}

		if($isValid['valid']==false){

			// $cart->freeze = false;

			// $cart->save();

			return response(["message"=>"Cart is not valid"],405); //405 => method not allowed

		}

		$cart->freeze = true;

		$cart->save();

		// $productWithCount = $cartObj->getProductIncartCount();

		// foreach($productWithCount as $productKey=>$productCount){

		// 	$product = Products::where('_id', $productKey)->decrement('quantity', $productCount);

		// }

		return response(["success"=>true,"message"=>"Cart freezed sucessfully"],200);

	}

	public function validateCart($cartData){

		$response = [
			"valid"=>false
		];

		$cartObj = new Cart;
		$productsData = $cartObj->getAllProductsInCart($cartData);	

		$isNotAvailable = false;

		if(isset($cartData['products'])){
			foreach($cartData['products'] as $key=>&$product){

				$quantity = (int)$product['chilled']['quantity'] + (int)$product['nonchilled']['quantity'];
				
				$productsData[$key]['quantity'] = $productsData[$key]['quantity'] - $quantity;

				if($productsData[$key]['quantity']<0){
					$product['isNotAvailable'] = true;
					$isNotAvailable = true;
				}

			}
		}

		if(isset($cartData['packages'])){
			foreach($cartData['packages'] as $key=>&$package){							

					foreach($package['products'] as $product){

						if($product['quantity']>0){

							$quantity = (int)$package['packageQuantity'] * (int)$product['quantity'];				
							
							$productsData[$product['_id']]['quantity']-= $quantity;

							if($productsData[$product['_id']]['quantity']<0){
								$package['isNotAvailable'] = true;
								$isNotAvailable = true;
							}

						}

					}			

			}
		}

		if(isset($cartData['promotions'])){
			foreach($cartData['promotions'] as &$promotion){

				$productsData[$promotion['productId']]['quantity']-= 1;

				if($productsData[$promotion['productId']]['quantity']<0){
					$promotion['isNotAvailable'] = true;
					$isNotAvailable = true;
				}
			}
		}

		$response['cartData'] = $cartData;

		if($isNotAvailable !== true){
			$response['valid'] = true;
		}
		$response['valid'] = true;

		return $response;

	}

	public function putBulk($cartKey,Request $request){
		
		$params = $request->all();

		$cart = Cart::find($cartKey);

		$cartProducts = $cart->products;

		if(isset($params['products']) && is_array($params['products'])){

			$productKeys = [];

			$params['products'] = valueToKey($params['products'],"id");
			$productKeys = array_keys($params['products']);

			$productObj = new Products;

			$products = $productObj->fetchProduct([
						"id"=>$productKeys,
					]);

			if($products['success']===false && empty($products['product'])){

				$response['message'] = "Products not found";
				$response['action'] = "refresh";
				return response($response,405);

			}else{
				$products = $products['product'];
			}
			
			$updatedData = [
				"products"=>[]				
			];

			foreach($products as $product){
				
				$proIdToUpdate = (string)$product['_id'];

				$proPutValues = $params['products'][$proIdToUpdate];

				$productInCart = isset($cartProducts[$proIdToUpdate])?$cartProducts[$proIdToUpdate]:false;

				$chilledQty = (int)$proPutValues['quantity']['chilled'];
				$nonChilledQty = (int)$proPutValues['quantity']['nonChilled'];

				$newQty = $chilledQty + $nonChilledQty;

				if($productInCart!==false){

					$chilledQty+= (int)$productInCart['chilled']['quantity'];
					$nonChilledQty+= (int)$productInCart['nonchilled']['quantity'];

				}

				$totalQty = $chilledQty + $nonChilledQty;
				
				$updateProData = array(

					"chilled"=>array(
						"quantity"=>$chilledQty,
						"status"=>"chilled",
					),
					"nonchilled"=>array(
						"quantity"=>$nonChilledQty,
						"status"=>"nonchilled",
					),
					"quantity"=>$totalQty,
					"lastServedChilled" => true,
					"sale"=>isset($product['proSales'])?$product['proSales']:false

				);
				$updateProData['remainingQty']= $newQty;
				if($productInCart!==false){

					$updateProData['chilled']['status'] = $productInCart['chilled']['status'];
					$updateProData['nonchilled']['status'] = $productInCart['nonchilled']['status'];
					$updateProData['lastServedChilled'] = $productInCart['lastServedChilled'];
					$updateProData['remainingQty']+= $productInCart['remainingQty'];

				}			

				$cartProducts[$proIdToUpdate] = $updateProData;
				$updateProData['product'] = $product; //product original detail required in cart

				array_push($updatedData['products'],$updateProData);

			}

			try{

				$cart->products = $cartProducts;
				$cart->createAllPossibleSales();

				$latestUpdate = [];
				foreach($updatedData['products'] as &$cProduct){

					$key = (string)$cProduct['product']['_id'];
					$cProduct['remainingQty'] = $cart->products[$key]['remainingQty'];

				}

				$cart->save();

				$response = [
					'message'=>'cart updated successfully',
					'sales' => $cart->sales,
					'products' => $updatedData['products']
				];
				
				return response($response,200);

			}catch(\Exception $e){

				return response(["success"=>false,"message"=>$e->getMessage()],400);

			}

		}
		
	}

	public function postRepeatlast(Request $request){
		
		$userLogged = Auth::user('user');		

		$params = Orders::where("user",new mongoId($userLogged->_id))->whereNotNull("products")->orderBy("created_at","desc")->first(["products._id","products.quantity.chilled","products.quantity.nonChilled"]);

		$cartKey = $request->get('cartKey');
		
		$cart = Cart::find($cartKey);

		$cartProducts = $cart->products;

		if(isset($params['products']) && is_array($params['products'])){
			
			$productKeys = [];

			$params['products'] = valueToKey($params['products'],"_id");
			
			$productKeys = array_keys($params['products']);

			$productObj = new Products;

			$products = $productObj->fetchProduct([
						"id"=>$productKeys,
					]);

			if($products['success']===false && empty($products['product'])){

				$response['message'] = "Products not found";
				$response['action'] = "refresh";
				return response($response,405);

			}else{
				$products = $products['product'];
			}
			
			$updatedData = [
				"products"=>[]				
			];

			foreach($products as $product){
				
				$proIdToUpdate = (string)$product['_id'];

				$proPutValues = $params['products'][$proIdToUpdate];

				$productInCart = isset($cartProducts[$proIdToUpdate])?$cartProducts[$proIdToUpdate]:false;

				$chilledQty = (int)$proPutValues['quantity']['chilled'];
				$nonChilledQty = (int)$proPutValues['quantity']['nonChilled'];

				$newQty = $chilledQty + $nonChilledQty;

				if($productInCart!==false){

					$chilledQty+= (int)$productInCart['chilled']['quantity'];
					$nonChilledQty+= (int)$productInCart['nonchilled']['quantity'];

				}

				$totalQty = $chilledQty + $nonChilledQty;
				
				$updateProData = array(

					"chilled"=>array(
						"quantity"=>$chilledQty,
						"status"=>"chilled",
					),
					"nonchilled"=>array(
						"quantity"=>$nonChilledQty,
						"status"=>"nonchilled",
					),
					"quantity"=>$totalQty,
					"lastServedChilled" => true,
					"sale"=>isset($product['proSales'])?$product['proSales']:false

				);
				$updateProData['remainingQty']= $newQty;
				if($productInCart!==false){

					$updateProData['chilled']['status'] = $productInCart['chilled']['status'];
					$updateProData['nonchilled']['status'] = $productInCart['nonchilled']['status'];
					$updateProData['lastServedChilled'] = $productInCart['lastServedChilled'];
					$updateProData['remainingQty']+= $productInCart['remainingQty'];

				}			

				$cartProducts[$proIdToUpdate] = $updateProData;
				$updateProData['product'] = $product; //product original detail required in cart

				array_push($updatedData['products'],$updateProData);

			}

			try{

				$cart->products = $cartProducts;
				$cart->createAllPossibleSales();

				$latestUpdate = [];
				foreach($updatedData['products'] as &$cProduct){

					$key = (string)$cProduct['product']['_id'];
					$cProduct['remainingQty'] = $cart->products[$key]['remainingQty'];

				}

				$cart->save();

				$response = [
					'message'=>'cart updated successfully',
					'sales' => $cart->sales,
					'products' => $updatedData['products']
				];
				
				return response($response,200);

			}catch(\Exception $e){

				return response(["success"=>false,"message"=>$e->getMessage()],400);

			}

		}
		
		
	}

	public function putGift($cartKey,GiftCartRequest $request){

		$response = [
			'message'=>'',
			'reload' => false,
		];

		$inputs = $request->all();
		// Get gift detail

		$giftModel = new Gift;

		$gift = $giftModel->getGift($inputs['id']);

		$cart = Cart::find($cartKey);
		
		$except = isset($inputs['_uid'])?$inputs['_uid']:'';

		if($gift->type==1){

			$giftProducts = $inputs['products'];

			$cartProducts = $cart->getProductsNotInGift($except);

			$totalProducts = 0;

			foreach ($giftProducts as $giftProduct) {

				$proId = $giftProduct['_id'];
							
				$quantity = (int)$giftProduct['quantity'];

				// Condition to check product is available in cart or not			

				if(isset($cartProducts[$proId]) && $cartProducts[$proId]>=$quantity){			

					$totalProducts+=(int)$quantity;
					
				}else{

					$response['message'] = 'Products attached quantity not match with in cart';
					$response['reload'] = true;
					return response($response,422);

				}

			}

			if($totalProducts<1){

				$response['message'] = 'Please attach products';
				return response($response,422);

			}

			if($totalProducts>$gift['limit']){

				$response['message'] = 'Products count is more than limit';
				return response($response,422);

			}

		}
		
		$gifts = empty($cart->gifts)?[]:$cart->gifts;

		$newGift = [
				"_id" => $gift['_id'],
				'_uid'=> new MongoId(),
				
				"recipient" => isset($inputs['recipient'])?$inputs['recipient']:['name'=>"",'message'=>""],
				"price" => $gift['price'],
				"title"=> $gift['title'],
				"subTitle"=> $gift['subTitle'],
				"description"=> $gift['description'],
				
				"image"=> $gift['coverImage']['source'],
			];

		if($gift->type==1){
			$newGift["products"] = $giftProducts;
			$newGift["limit"] = $gift['limit'];
		}
		
		if(isset($except) && $except!==""){
			foreach($gifts as $key=>$gift){
				if($gift['_uid'] == new MongoId($except)){
					unset($gifts[$key]);
				}
			}
		}

		
		$gifts = array_merge($gifts,[$newGift]);

		try{
			
			$cart->gifts = $gifts;

			$cart->save();

			return response(["message"=>"cart updated successfully","gift"=>$newGift],200);

		}catch(\Exception $e){

			return response(["message"=>$e->getMessage()],400);

		}


	}

	public function postGiftcard(GiftCartRequest $request,$cartKey){

		$user = Auth::user('user');

		$inputs = $request->all();			
		
		$cart = Cart::find($cartKey);
				
		$giftCard = [

			'_id'=>$inputs['id'],
			'_uid'=>new MongoId(),
			'recipient'=>[
				'price' => (float)$inputs['recipient']['price'],
				'quantity' => (int)$inputs['recipient']['quantity'],
				'name' => $inputs['recipient']['name'],
				'email' => $inputs['recipient']['email'],
				'message' => $inputs['recipient']['message'],
				'sms' => isset($inputs['recipient']['sms'])?(int)$inputs['recipient']['sms']:NULL,
				'mobile' => isset($inputs['recipient']['mobile'])?(int)$inputs['recipient']['mobile']:NULL
			]
		];			

		try{		

			$isInserted = DB::collection('cart')
							->where('_id', $cartKey)
							->push('giftCards', $giftCard);

			return response(["success"=>true,"message"=>"cart updated successfully","data"=>$giftCard],200);

		}catch(\Exception $e){

			return response(["success"=>false,"message"=>$e->getMessage()],400);

		}

	}

	public function putGiftcard($giftUid,GiftCartRequest $request){
		
		$inputs = $request->all();
		
		$cartKey = $this->deliverykey;
		
		$cart = Cart::find($cartKey);
				
		$giftCardRecipient = [
					'price' => (float)$inputs['recipient']['price'],
					'quantity' => (int)$inputs['recipient']['quantity'],
					'name' => $inputs['recipient']['name'],
					'email' => $inputs['recipient']['email'],
					'message' => $inputs['recipient']['message'],
					'sms' => isset($inputs['recipient']['sms'])?(int)$inputs['recipient']['sms']:NULL,
					'mobile' => isset($inputs['recipient']['mobile'])?(int)$inputs['recipient']['mobile']:NULL
				];

		$giftCards = $cart->giftCards;

		foreach($giftCards as &$card){

			if((string)$card['_uid']===$giftUid){
				$card['recipient'] = $giftCardRecipient;
				break;
			}

		}

		try{			

			$cart->giftCards = $giftCards;

			$cart->save();

			return response(["success"=>true,"message"=>"Gift updated successfully"],200);

		}catch(\Exception $e){

			return response(["success"=>false,"message"=>$e->getMessage()],400);

		}

	}

	public function missingMethod($parameters = array())
	{
		jprd("Missing");
	}

	function logtofile($message){
        //if($this->enableLog){
            $view_log = new Logger('Payment Logs');
            $view_log->pushHandler(new StreamHandler(storage_path().'/logs/payment.log', Logger::INFO));
            if(is_array($message)){
            	$message = json_encode($message);
            }
            $view_log->addInfo($message);
        //}
    }


    public function confirmordermanual(Request $request,$cartKey = null){

		if(!$request->get('sercuretrue')){
			return redirect('/');
		}
		//$user = Auth::user('user');
		
		//$userObj = User::find($user->_id);

		//$cart = Cart::where("_id","=",$cartKey)->where("freeze",true)->first();

		if($cartKey == null)
			$cartKey = $request->get('merchant_data1');
		
		$cart = Cart::find($cartKey);

		if(empty($cart) && $request->isMethod('get') && $request->get('order_number')){
			$order = Orders::where(['reference' => $request->get('order_number')])->first();
			if($order)
				return redirect('/orderplaced/'.$order['_id']);
		}

		if(empty($cart)){
			if($request->isMethod('get'))
				return redirect('/');	
			else	
				return response(["success"=>false,"message"=>"cart not found"],405); //405 => method not allowed
		}

		if($cart){
			$user = Auth::user('user');
		
			$userObj = User::find((string)$cart->user);
		}

		$cartArr = $cart->toArray();		

		$cartArr['user'] = new MongoId($user->_id);

		try {			

			//PREPARE PAYMENT FORM DATA
			if(!$request->isMethod('get') && $cartArr['payment']['method'] == 'CARD' && $cartArr['payment']['total']>0){
				$payment = new Payment();
				$paymentres = $payment->prepareform($cartArr,$user);
				return response($paymentres,200);
			}

			//CHECK FOR PAYMENT RESULT
			if($request->isMethod('get') && $cartArr['payment']['method'] == 'CARD'){}

			//FORMAT CART TO ORDER
			$orderObj = $cart->cartToOrder($cartKey);

			$defaultContact = true;
			if(!isset($orderObj['delivery']['newDefault']) || $orderObj['delivery']['newDefault']!==true){
				$defaultContact = false;
			}
			$userObj->setContact($orderObj['delivery']['contact'],$defaultContact);
			
			//CREATE ORDER FROM CART & REMOVE CART
			$order = Orders::create($orderObj);

			$cart->delete();

			$process = $order->processGiftCards();

			$reference = $order->reference;

			if(isset($order->coupon)){

				$cRedeem = [
					"coupon" => $order->coupon['_id'],
					"reference"=>$order->reference,
					"user" => $order->user
				];
				$coupon = new coupon;
				$coupon->redeemed($cRedeem);

			}

			if(isset($order->discount['credits']) && $order->discount['credits']>0){

				$creditsUsed = $order->discount['credits'];
				$creditObj = [
								"credit"=>$creditsUsed,
								"method"=>"order",
								"reference" => $reference,
								"user" => new mongoId($user->_id),
								"comment"=> "You have used this credits with an order"
							];

				CreditTransactions::transaction('debit',$creditObj,$userObj);

			}

			if(isset($order->creditsFromLoyalty) && $order->creditsFromLoyalty>0){

				$creditsFromLoyalty = $order['creditsFromLoyalty'];
				
				$creditObj = [
								"credit"=>$creditsFromLoyalty,
								"method"=>"order",
								"reference" => $reference,
								"user" => new mongoId($user->_id),
								"comment"=> "You have earned this credits in exchange of loyalty points"
							];
				
				CreditTransactions::transaction('credit',$creditObj,$userObj);

			}

			if($order['loyaltyPointUsed']>0){

				$loyaltyObj = [
								"points"=>$order['loyaltyPointUsed'],
								"method"=>"order",
								"reference" => $reference,
								"user" => new mongoId((string)$userObj->_id),
								"comment"=> "You have used this points by making a purchase on our website"
							];

				LoyaltyTransactions::transaction('debit',$loyaltyObj,$userObj);

			}

			$loyaltyPoints = $order['loyaltyPointEarned'];

			if($loyaltyPoints>0){

				$loyaltyObj = [
						"points"=>$loyaltyPoints,
						"method"=>"order",
						"reference" => $reference,
						"user" => new mongoId((string)$userObj->_id),
						"comment"=> "You have earned this points by making a purchase"
					];
		
				LoyaltyTransactions::transaction('credit',$loyaltyObj,$userObj);

			}

			$request->session()->forget('deliverykey');
			
			//SAVE CARD IF USER CHECKED SAVE CARD FOR FUTURE PAYMENTS
			if($cartArr['payment']['method'] == 'CARD' && $cartArr['payment']['card'] == 'newcard' && $cartArr['payment']['savecard']){
				$cardInfo = $cartArr['payment']['creditCard'];
		        // $user = User::find($user->_id);
		        $userObj->push('savedCards',$cardInfo,true);

			}

			//Update inventory if order is 1 hour delivery
			if($order['delivery']['type'] == 0){
				$model = new Products();
				$model->updateInventory($order);
			}

			//CONFIRMATION EMAIL 
			$emailTemplate = new Email('orderconfirm');
			$mailData = [
                'email' => strtolower($userObj->email),
                'user_name' => ($userObj->name)?$userObj->name:$userObj->email,
                'order_number' => $reference
            ];

            $order->placed();

            //$mailSent = $emailTemplate->sendEmail($mailData);

			if($request->isMethod('get')){
				return redirect('/orderplaced/'.$order['_id']);
			}

			return response(array("success"=>true,"message"=>"Order Placed Successfully","order"=>$order['_id']));

		} catch(\Exception $e){

				ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Cart Confirm'
				]);

		}

		return response(["message"=>'Something went wrong'],400);
		
	}

// 	public function availability($cartKey){

// 		$cart = Cart::find($cartKey);

// 		if(empty($cart)){
// 			return response(array("success"=>false,"message"=>"cart not found"),401);
// 		}

// 		$products = $cart->products;

// 		$productsIdInCart = array_keys((array)$products);

// 		$productObj = new Products;

// 		$productsInCart = $productObj->getProducts(
// 									array(
// 										"id"=>$productsIdInCart,
// 									)
// 								);

// 		jprd($productsInCart);

// 		$notAvail = [];

// 		foreach($productsInCart as $product){

// 			$cartProduct = $products[$product["_id"]];

// if($product['quantity']==0)
// jprd($product);


// 			if($product['quantity']==0 && $product['outOfStockType']===2){

// 				$notAvail[] = [
// 					"id"=>$product["_id"]

// 				];

// 			};

// 			if($cartProduct['quantity']<=$product['quantity']){

// 				$notAvail[] = [
// 					"id"=>$product["_id"]

// 				];

// 			}
// 		}

// 	}

	public function getNextAvailableSlot ($cartKey) {

		$cart = Cart::find($cartKey);
		$nextAvailableSlots = $cart->getNextAvailableSlots();

		return response($nextAvailableSlots,200);

	}

	public function getProductsLapsedTime ($cartKey) {

		$cart = Cart::find($cartKey);

		try{

			$products = $cart->getAllProductsInCart();
			$products = $this->setProductAvailabilityAfter($products);
			return response($products,200);

		}catch(\Exception $e){
			Log::warning("Get Products Lapsed Time : ".$e->getMessage());
		}

		return response(['refresh' => true],412);

	}

	private function setProductAvailabilityAfter($products){

		$sgtTimeStamp = strtotime("+8 hours");

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

	public function saleNotification(){
		
        $data = DB::collection('notifications')->raw()->aggregate(
            [
                '$limit' => 10
            ],
            [
                '$lookup' => [
                    'from' => 'user',
                    'localField' => 'userId',
                    'foreignField' => '_id',
                    'as' => 'consumer'
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$consumer',
                    'preserveNullAndEmptyArrays' => true
                ]
            ],
            [
            	'$project' => [
                    '_id' => 1,
                    'userId' => 1,                    
                    'matchingWish' => 1,
                    'saleID' => 1,
                    'consumer._id'=> '$consumer._id',
                    'consumer.email'=> '$consumer.email',
                    'consumer.status'=> '$consumer.status',
                    'consumer.name'=> '$consumer.name',
                    'consumer.mobile_number'=> '$consumer.mobile_number'

                ]
            ],
            [
                '$lookup' => [
                    'from' => 'sale',
                    'localField' => 'saleID',
                    'foreignField' => '_id',
                    'as' => 'saleDetail'
                ]
            ],
            [
                '$match' => [
                    'saleDetail' => ['$not'=>['$eq'=>[]]]
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$saleDetail',
                    'preserveNullAndEmptyArrays' => true
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$matchingWish',
                    'preserveNullAndEmptyArrays' => true
                ]
            ],
            [
                '$lookup' => [
                    'from' => 'products',
                    'localField' => 'matchingWish._id',
                    'foreignField' => '_id',
                    'as' => 'products'
                ]
            ],
            [
                '$project' => [
                    '_id' => '$_id',
                    'consumer' => '$consumer',                      
                    'saleDetail' => '$saleDetail',                      
                    'matchingWish' => '$matchingWish',
                    'products' => ['$arrayElemAt' => [ '$products', 0 ]]
                ]
            ],
            [
                '$group' => [
                    '_id' => '$_id',
                    'consumer' => ['$first'=>'$consumer'],
                    'saleDetail' => ['$first'=>'$saleDetail'],
                    'products' => ['$addToSet'=>'$products']
                ]
            ]
        );

        jprd($data['result']);

        if(isset($data['result'][0]) && !empty($data['result'][0])){
            $emailTemplate = new Email('salenotification');
            $userWiseSaleProduct = [];
            foreach ($data['result'] as $key => $value) {
                $email = $value['consumer']['email'];
                $userWiseSaleProduct[$email]['consumer'] = $value['consumer'];                
                
                //ATTACH SALE TO EACH PRODUCT
                foreach ($value['products'] as $pkey => $pvalue) {
                    $pvalue['pImg'] = $this->getCoverImage($pvalue['imageFiles']);
                    $pvalue['saleDetail'] = $value['saleDetail'];
                    $userWiseSaleProduct[$email]['productsWithSale'][] = $pvalue;
                }                
               // DB::collection('notifications')->delete($value['_id']);
            }

            foreach ($userWiseSaleProduct as $useremail => $value) {                
                $user_name = (isset($value['consumer']['name']))?$value['consumer']['name']:$useremail;
                $productList = '<table border="0" cellpadding="10" cellspacing="0" width="100%">';
                $i = 0;
                foreach ($value['productsWithSale'] as $pkey => $pvalue) {
                    $i += 1;
                    if($i%3==1)
                        $productList .= '<tr>';                        
                        
                        $productList .= '
                        <td style="border:0px solid #ccc; width:33%;">
                            <a href="'.url().'/product/'.$pvalue['slug'].'" style="text-decoration:none;color:#37474f;font-size:12px;">
                                <div align="center" style="min-height:153px;">
                                    <img style="max-width:100%;max-height:153px;" alt="'.$pvalue['name'].'" border="0" src="'.url().'/products/i/200/'.$pvalue['pImg'].'">
                                </div>
                                <div style="float:left;width:100%;margin-bottom:5px;">
                                    <div style="background:#b119ff;color:#FFF;font-size:0.9em;border-radius:2px;padding:1px 6px;float:left;">'.$pvalue['saleDetail']['listingTitle'].'</div>
                                </div>
                                <div>'.$pvalue['name'].'</div>
                            </a>
                        </td>';
                    
                    if(count($value['productsWithSale'])==1){
                        $productList .= '<td style="width:33%;"></td><td style="width:33%;"></td></tr>';
                    }

                    if(count($value['productsWithSale'])==2 && $pkey==1){
                        $productList .= '<td style="width:33%;"></td></tr>';
                    }    
                        
                    if($i%3==0)
                        $productList .= '</tr>';        
                }
                $productList .= '</table>';
                
		// asdasdasdasasdads
                $view = View::make('emails.sale', []);

				$contents = $view->render();

				$mailData = [
                    'email' => strtolower($useremail),
                    'user_name' => $user_name,
                    'sale_detail' => $contents
                ];
		// asdasdasdasdasd
                $mailSent = $emailTemplate->sendEmail($mailData);

				//$this->info($mailSent);
            }

        }

    	prd("its done");
	}

	public function getCoverImage($imgArr){
        $img = 'noimage.jpg'; 
        foreach ($imgArr as $key => $value) {
            if($value['coverimage'] == 1){
                $img = $value['source'];
                break;
            }
        }
        return $img;
    }



}
