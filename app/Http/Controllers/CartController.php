<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;
use AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\GiftCartRequest;
use Illuminate\Support\Facades\Log;

use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Cart as Cart;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Products as Products;
use AlcoholDelivery\Packages as Packages;
use AlcoholDelivery\Credits as Credits;

use AlcoholDelivery\Setting as Setting;
use AlcoholDelivery\Orders as Orders;
use AlcoholDelivery\Promotion as Promotion;
use AlcoholDelivery\Holiday as Holiday;
use AlcoholDelivery\User as User;
use AlcoholDelivery\Gift as Gift;
use AlcoholDelivery\Email;

use DB;
use MongoDate;
use MongoId;

use AlcoholDelivery\Payment;

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
					return response(["success"=>true,"message"=>"cart created successfully","cart"=>$cart->toArray()],200);

				}catch(\Exception $e){

					return (object)["success"=>false,"message"=>$e->getMessage()];

				}
			}
			else{

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

	public function show(Request $request,$id){

		$cart = Cart::findUpdated($id);		

		$user = Auth::user('user');

		if(empty($cart)){

			$cartObj = new Cart;

			$isCreated = $cartObj->generate();

			if($isCreated->success){

				$cart = $isCreated->cart;

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
		$packagesInCart = [];
		foreach($cart['packages'] as $package){

			array_push($packagesInCart, $package['_id']);

		}

		$packages = new Packages;
		$packages = $packages->whereIn("_id",$packagesInCart)->where('status',1)->get(['title','subTitle','description','coverImage','packageItems']);

		foreach($cart['packages'] as &$package){

			foreach($packages as $oPackage){

				if((string)$package['_id'] === $oPackage->_id){

					$package = array_merge($oPackage->toArray(),$package);
					$package['packagePrice'] =  100; // due:: this should be calculated from server

				}
			}

		}		

		// package validate and manage end

		$request->session()->put('deliverykey', $cart['_id']);

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
			return response(["message"=>"Something went worng"],400);

		}

		return response(["message"=>"Something went worng"],400);

	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function putLoyalty(Request $request, $id)
	{

		$user = Auth::user('user');

		if($user===null){
			return response(["message"=>"login required","code"=>"401"],400);
		}
		
		$inputs = $request->all();

		$cart = Cart::find($id);		

		$loyaltyAvailable = $this->getLoyaltyAvailable($cart); // LOYALTY POINTS AVAILABLE BEFORE ADD NEW PRODUCT

		$proIdToUpdate = $inputs['id'];

		$response = [
			"message"=>"Something went worng",
			"code" => 000,
		];

		if(empty($cart)){

			$response['message'] = "Not a valid request";
			return response($response,400);

		}

		if(!isset($cart->loyalty)){
			$cart->loyalty = [];
		}			

		$data = [
				"loyalty" => [

					"chilled" => 1,
					"_id" => new mongoId("57025683c31d53b2218b45a4"),
					"quantity" => 1

				]
			];

		$product = Products::where("_id",$proIdToUpdate)
					->where("status",1)
					->where("isLoyalty",1)					
					->where(function($query){
						$query->where("quantity",'>',0)
							  ->orWhere("outOfStockType",2);
					})
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

			return response(["message"=>"Product not found","reload"=>true],400);

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

				$result = DB::collection('cart')->where('_id', new MongoId($id))
										->update(["loyalty.".$proIdToUpdate=>$updateProData], ['upsert' => true]);
				// $cart->loyalty = array_merge($cart->loyalty,array($proIdToUpdate=>$updateProData));


			}else{

				$cart->unset('loyalty.'.$proIdToUpdate);

			}

			$updateProData['product'] = $product;
			$response['success'] = true;
			$response['message'] = "loyalty product updated successfully";

			$response['change'] = $changeInQty;
			$response['product'] = $updateProData;

			return response($response,200);

		} catch(\Exception $e){

			return response(["message"=>"Something went worng"],400);
			return response(["message"=>$e->getMessage()],400);

		}

		return response(["message"=>"Something went worng"],400);

	}


	public function putCreditCertificate(Request $request, $id) {

		$user = Auth::user('user');		

		// if($user===null){
		// 	return response(["message"=>"login required"],401);
		// }
		
		$inputs = $request->all();
		$value = $inputs['id'];
		$cart = Cart::find($id);

		$CreditsObj = new Credits;
		$result = $CreditsObj->getCredit($value);

		if($result->success === false){
			return response(["message"=>"Card not found"],400);
		}

		$card = $result->card;

		$loyaltyAvailable = $this->getLoyaltyAvailable($cart); // LOYALTY POINTS AVAILABLE BEFORE ADD NEW PRODUCT

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
			$userLoyaltyPoints = $user['loyaltyPoints'];
			$userLoyaltyPoints = 400;
			
			$loyaltyPros = is_array($cart->loyalty)?$cart->loyalty:[];
			$loyaltyCardPros = is_array($cart->loyaltyCards)?$cart->loyaltyCards:[];

			$pointsUsed = 0;

			foreach($loyaltyPros as $loyaltyPro){
				$pointsUsed += ($loyaltyPro['points'] * $loyaltyPro['quantity']);
			}

			foreach($loyaltyCardPros as $loyaltyCardPro){
				$pointsUsed += ($loyaltyCardPro['points'] * $loyaltyCardPro['quantity']);
			}

			return $userLoyaltyPoints - $pointsUsed;

		}

		return false;

	}

	public function createpackage(Request $request, $cartKey){{
	
			$inputs = $request->all();
			$packageId = $inputs['id'];
			$packageDetail = $inputs['package'];
	
			$cart = Cart::find($cartKey);
	
			if(empty($cart)){
	
				return response(array("success"=>false,"message"=>"Not a valid request"),400);
	
			}
	
			$packages = $cart->packages;
	
			if(empty($packages)){
	
				$packages = [];
	
			}
	
			$packageDetail['_unique'] = new mongoId();
	
			if(isset($packageDetail['unique'])){
	
				foreach ($packages as $key => $package) {
	
					if(!isset($package["_unique"])){
						unset($packages[$key]);
						continue;
					}
					if($package["_unique"]==$packageDetail['unique']){
						unset($packages[$key]);
						$packageDetail['_unique'] = $package["_unique"];
						break;
					}
	
				}
			}
	
			if(!isset($packageDetail['packageQuantity'])){
				$packageDetail['packageQuantity'] = 1;
			}
			
			$packageDetail['products'] = (array)$packageDetail['products'];
			$packageDetail['_id'] = new mongoId($packageId);
	
			try {
	
				$result = Cart::where('_id', $cartKey)->push('packages',[$packageDetail]);
				return response(["success"=>true,"message"=>"cart updated successfully","key"=>$packageDetail['_unique']]);
	
			} catch(\Exception $e){
	
				return response(["success"=>false,"message"=>"Something went worng"]);
				return response(["success"=>false,"message"=>$e->getMessage()]);
	
			}
	
		}}

	public function putPromotion(Request $request, $cartKey){

		$productId = $request->input('id');

		$promoId = $request->input('promoId');

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
			"promoId" => $promoId
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

			$userCart = Cart::where("user","=",new MongoId($user->_id))->where("_id","!=",new MongoId($cartKey))->first();

			$sessionCart = Cart::find($cartKey);

			// if(!empty($userCart)){

				// $sessionCart->products = array_merge($sessionCart->products,$userCart->products);

			// }

			if(!empty($sessionCart->products) || empty($userCart)){

				$sessionCart->user = new MongoId($user->_id);

				try{

					$sessionCart->save();

					if(!empty($userCart)){

						$userCart->delete();

					}
					return (object)["success"=>true,"message"=>"cart merge successfully","cart"=>$sessionCart->toArray()];

				}catch(\Exception $e){
					return (object)["success"=>false,"message"=>$e->getMessage()];
				}

			}

			return (object)["success"=>true,"message"=>"cart merge successfully","cart"=>$userCart->toArray()];

		}else{
			return (object)["success"=>false,"message"=>"login required to merge"];
		}

		return (object)["success"=>false,"message"=>"something went wrong"];

	}

	public function availability($cartKey){

		$cart = Cart::find($cartKey);

		if(empty($cart)){
			return response(array("success"=>false,"message"=>"cart not found"),401);
		}

		$products = $cart->products;

		$productsIdInCart = array_keys((array)$products);

				$productObj = new Products;

				$productsInCart = $productObj->getProducts(
											array(
												"id"=>$productsIdInCart,
												"with"=>array(
													"discounts"
												)
											)
										);

		$notAvail = [];

		foreach($productsInCart as $product){

			$cartProduct = $products[$product["_id"]];

if($product['quantity']==0)
jprd($product);


			if($product['quantity']==0 && $product['outOfStockType']===2){

				$notAvail[] = [
					"id"=>$product["_id"]

				];

			};

			if($cartProduct['quantity']<=$product['quantity']){

				$notAvail[] = [
					"id"=>$product["_id"]

				];

			}
		}


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

	public function putGiftProductChilledStatus(Request $request,$giftUid){
		
		$productId = $request->input('id');
		$state = $request->input('state');
		
		$cartKey = $this->deliverykey;

		// $cart = Cart::where("_id",$cartKey)
		//			->where("gifts._uid",new mongoId($giftUid))
		//			->where("gifts.products._id",$productId)
		//			->where("gifts.products.state",$state)
		//			->get(['gifts']);

		// ->update(["gifts.products.$._id"=>false]);

		$cart = Cart::where("_id",$cartKey)
						->where("gifts._uid",new mongoId($giftUid))
						->where("gifts.products.quantity",3) //$productId
						->where("gifts.products.state",$state)
						->update(["gifts.0.products.$.chilled"=>"asdasdasasadads"]);


		// $cart = DB::collection('cart')->raw(function($collection)
		// 	{
		// 			return $collection->update(array(
		// 					array(
		// 							'$project' => array(
		// 									'name'=>'$name',
		// 									'quantity'=>'$quantity',
		// 									'maxQuantity'=>'$maxQuantity',
		// 									'threshold'=>'$threshold',
		// 									'sum' => array(
		// 											'$subtract' => array(
		// 												'$maxQuantity',
		// 												'$quantity'
		// 											)
		// 									),                      
		// 							),                  
		// 					),
		// 					array(
		// 							'$sort' => array('sum'=>-1)
		// 					),
		// 					array(
		// 							'$skip' => 0
		// 					),
		// 					array(
		// 							'$limit' => 5
		// 					)
		// 					array(
		// 							'$match' => array(
		// 								'sum' => 70
		// 							)
		// 					)   
		// 			));
		// 	});

		

		

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

		$tomorrowTimeStr = strtotime('tomorrow');
		$passedTimeStr = strtotime($date);
		
	
		if($passedTimeStr < $tomorrowTimeStr){
			return response(["message"=>"In-valid date passed, Time slot is not available for previous date"],400);
		}

		$start = (float)$passedTimeStr*1000;
		$end = (float)(strtotime('+6 days',$passedTimeStr)*1000);
		
		$holiday = new Holiday;
		$holidays = $holiday->getHolidays(
			[
				'start'=>$start, 
				'end'=>$end
			]
		);	

		$currDate = date("Y-m-d", $tomorrowTimeStr);

		$passedDate = date("Y-m-d",$passedTimeStr);

		$weeknumber = date("N",strtotime($passedDate));//pass "3" for 2016-06-08(wednesday)

		$weekDaysOff = [];
		$holidayTimestamp = [];
		foreach($holidays as $holiday){
			if($holiday['_id']==="weekdayoff"){
				$weekDaysOff = $holiday['dow'];
			}else{
				$holidayTimestamp[] = ($holiday['timeStamp'])/1000;
			}
		}

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

		for($i=1;$i<=7;$i++){

			$datekey = strtotime($tempDate);
			$datestamp = date("d M",$datekey);			
			$status = 1;
			if(in_array($weeknumber==7?0:$weeknumber, $weekDaysOff) || (in_array($datekey,$holidayTimestamp))){
				$status = 0;
			}

			$slotArr[$weekKeys[$weeknumber]] = [
				'slots' => $timeSlots[$weeknumber-1],
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

				return response(array("success"=>false,"message"=>$e->getMessage()));

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

			return response(["success"=>false,"message"=>$e->getMessage()],400);

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

			return (object)["success"=>false,"message"=>$e->getMessage()];

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);

	}

	public function deleteCard($cardUId,Request $request){

		$cartKey = $this->deliverykey;

		$cart = Cart::find($cartKey);

		if(empty($cart)){
			return response(array("success"=>false,"message"=>"cart not found"),400);
		}

		$giftCards = $cart->giftCards;

		if(empty($giftCards)){
			return response(["success"=>false,"message"=>"no cards to remove"],400);
		}
		
		try{

			$isRemoved = DB::collection('cart')->where('_id', $cartKey)->pull('giftCards', ['_uid' => new MongoId($cardUId) ]);

			return response(["success"=>true,"message"=>"gift cards removed successfully"],200);

		}catch(\Exception $e){

			return (object)["success"=>false,"message"=>$e->getMessage()];

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);

	}

	public function deletePromotion($promoId,Request $request){

		$cartKey = $request->session()->get('deliverykey');
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

			return (object)["success"=>false,"message"=>$e->getMessage()];

		}

		return response(["success"=>false,"message"=>"Something went wrong"],400);
	}

	public function confirmorder(Request $request,$cartKey = null){

		//$cart = Cart::where("_id","=",$cartKey)->where("freeze",true)->first();

		if($cartKey == null){
			$cartKey = $request->get('merchant_data1');
		}		

		$cartObj = new Cart;

		$cart = $cartObj->where("_id","=",$cartKey)->first();

		if(empty($cart) && $request->isMethod('get') && $request->get('order_number')){

			$order = Orders::where(['reference' => $request->get('order_number')])->first();

			if($order)
				return redirect('/#/orderplaced/'.$order['_id']);
		}

		$cart->setLoyaltyPointUsed();


		if(empty($cart)){
			if($request->isMethod('get'))
				return redirect('/');	
			else	
				return response(["success"=>false,"message"=>"cart not found"],405); //405 => method not allowed
		}

		$cartArr = $cart->toArray();

		$this->setCartProductsList($cartArr);		

		$user = Auth::user('user');		

		//PREPARE PAYMENT FORM DATA
		if(!$request->isMethod('get') && $cartArr['payment']['method'] == 'CARD'){

			$payment = new Payment();
			$payment = $payment->prepareform($cartArr,$user);
			return response($payment,200);

		}

		$cartArr['user'] = new MongoId($user->_id);
		// $cartArr['user'] = new MongoId("57c422d611f6a1450b8b456c");//for testing on postman

		$cartProductsArr = [];

		$productsIdInCart = array_keys((array)$cartArr['products']);

		$productObj = new Products;

		$productsInCart = $productObj->getProducts(
									array(
										"id"=>$productsIdInCart,
										"with"=>array(
											"discounts"
										)
									)
								);

////// Loyalty point Earned calculation

		$loyaltyPoints = 0;
		
		$productsData = $cartObj->getAllProductsIncart($cartArr);

		// return response($productsData,400);

		foreach ($productsData as $key => $value) {

			if((int)$value['loyaltyType']==0){

				if(!isset($value['loyalty'])){$value['loyalty']=0;}

				$loyaltyPoints+= $value['count'] * ($value['price'] * $value['loyalty']/100);

			}else{

				$loyaltyPoints+= $value['count'] * $value['loyalty'];

			}

		}

		$cartArr["loyaltyPointEarned"] = $loyaltyPoints;

//////
		if($productsInCart)
		foreach($productsInCart as $key=>$product){

			$cartArr['products'][$product["_id"]]['_id'] = new MongoId($product["_id"]);

			$cartArr['products'][$product["_id"]]['original'] = $product;
			$cartProductsArr[] = $cartArr['products'][$product["_id"]];

		}

		$cartArr['products'] = $cartProductsArr;

		$cartArr['packages'] = $cartArr['packages'];

		try {

			$order = Orders::create($cartArr);

			$cart->delete();
			
			$reference = $order->reference;			

			$userObj = User::find($user->_id);

			if($cart->loyaltyPointUsed>0){

				$userObj->decrement('loyaltyPoints', $cart->loyaltyPointUsed);

				$userObj->push('loyalty', 
											[
												"type"=>"debit",
												"points"=>$cart->loyaltyPointUsed,
												"reason"=>[
													"type"=>"order",
													"key" => $reference,
													"comment"=> "You have used this points by making a purchase on our website"
												],
												"on"=>new MongoDate(strtotime(date("Y-m-d H:i:s")))
											]
										);

			}

			$userObj->increment('loyaltyPoints', $loyaltyPoints);

			$userObj->push('loyalty', 
										[
											"type"=>"credit",
											"points"=>$loyaltyPoints,
											"reason"=>[
												"type"=>"order",
												"key" => $reference,
												"comment"=> "You have earned this points by making a purchase on our website"
											],
											"on"=>new MongoDate(strtotime(date("Y-m-d H:i:s")))
										]
									);

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

            $mailSent = $emailTemplate->sendEmail($mailData);


			if($request->isMethod('get')){
				return redirect('/#/orderplaced/'.$order['_id']);
			}

			return response(array("success"=>true,"message"=>"order placed successfully","order"=>$order['_id']));

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));

		}
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

		return response(array("success"=>false,"message"=>"Something went worng"));

	}

	public function freezcart(Request $request){

		$cartKey = $request->session()->get('deliverykey');

		$cartObj = new Cart;

		$cart = Cart::findUpdated($cartKey);

		// if(isset($cart->freeze) && $cart->freeze===true){

		// 	return response(["success"=>true,"message"=>"Cart is already freezed"],200);
		// 	return response(["success"=>false,"message"=>"Cart is already freezed"],405); //405 => method not allowed

		// }
		$cart->freeze = true;

		$cart->save();

		$cartArr = $cart->toArray();

		//$isValid = $this->validateCart($cartArr);
		$isValid['valid'] = true;

		if($isValid['valid']==false){

			$cart->freeze = false;

			$cart->save();

			return response(["success"=>false,"valid"=>false,"message"=>"Cart is not valid"],405); //405 => method not allowed
		}

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

	public function putBulk(Request $request){
		
		$params = $request->all();
		$cartKey = $params['cartKey'];//$request->session()->get('deliverykey');

		$cart = Cart::find($cartKey);

		$cartProducts = $cart->products;

		if(isset($params['products']) && is_array($params['products'])){

			$productKeys = [];

			$params['products'] = valueToKey($params['products'],"id");

			foreach($params['products'] as $key=>$product){

				array_push($productKeys, $key);

			}

			$productObj = new Products;

			$products = $productObj->getProducts(
											array(
												"id"=>$productKeys,
												"with"=>array(
													"discounts"
												)
											)
										);

			$updatedData = [
				"products"=>[]				
			];

			foreach($products as $product){

				$proPutValues = $params['products'][$product['_id']];

				$updateProData = array(

							// "maxQuantity"=>$product['maxQuantity'],
							"chilled"=>array(
								"quantity"=>0,
								"status"=>"chilled",
							),
							"nonchilled"=>array(
								"quantity"=>0,
								"status"=>"nonchilled",
							),
							"quantity"=>0,
							"lastServedChilled" => (bool)$proPutValues['chilled']
						);

				if(isset($cartProducts[$product['_id']])){

					$cartPro = $cartProducts[$product['_id']];

					if((bool)$proPutValues['chilled']){

						$updateProData['chilled']['quantity'] = (int)$cartPro['chilled']['quantity'] + (int)$proPutValues['quantity'];

					}else{

						$updateProData['nonchilled']['quantity'] = (int)$cartPro['nonchilled']['quantity'] + (int)$proPutValues['quantity'];
					}	

				}else{
					
					if((bool)$proPutValues['chilled']){

						$updateProData['chilled']['quantity'] = (int)$proPutValues['quantity'];

					}else{

						$updateProData['nonchilled']['quantity'] = (int)$proPutValues['quantity'];

					}				

				}

				$updateProData['quantity'] = (int)$updateProData['chilled']['quantity'] + (int)$updateProData['nonchilled']['quantity'];

				$cartProducts[$product['_id']] = $updateProData;
				$updateProData['product'] = $product; //product original detail required in cart

				array_push($updatedData['products'],$updateProData);

			}
		

			try{

				$cart->products = $cartProducts;

				$cart->save();

				return response(["success"=>true,"message"=>"cart updated successfully","data"=>$updatedData],200);

			}catch(\Exception $e){

				return response(["success"=>false,"message"=>$e->getMessage()],400);

			}

		}
		
	}

	public function postRepeatlast(Request $request){
		
		$userLogged = Auth::user('user');

		if(empty($userLogged)){
			
			$return['message'] = 'login required';
			
			return response($return,401);
		}

		$params = Orders::where("user",new mongoId($userLogged->_id))->orderBy("created_at","desc")->first(["products","packages","updated_at","reference"]);			

		$cartKey = $request->get('cartKey');
		$cart = Cart::find($cartKey);
		$cartProducts = $cart->products;

		if(isset($params['products']) && is_array($params['products'])){

			$productKeys = [];

			$params['products'] = valueToKey($params['products'],"_id");

			foreach($params['products'] as $key=>$product){

				array_push($productKeys, $key);

			}

			$productObj = new Products;

			$products = $productObj->getProducts(
											array(
												"id"=>$productKeys,
												"with"=>array(
													"discounts"
												)
											)
										);

			$updatedData = [
				"products"=>[]				
			];

			foreach($products as $product){

				$proPutValues = $params['products'][$product['_id']];

				$updateProData = array(
							"chilled"=>array(
								"quantity"=>0,
								"status"=>"chilled",
							),
							"nonchilled"=>array(
								"quantity"=>0,
								"status"=>"nonchilled",
							),
							"quantity"=>0,
							"lastServedChilled" => (bool)$proPutValues['chilled']
						);

				if(isset($cartProducts[$product['_id']])){

					$cartPro = $cartProducts[$product['_id']];
					
						$updateProData['chilled']['quantity'] = (int)$cartPro['chilled']['quantity'] + (int)$proPutValues['chilled']['quantity'];				
						$updateProData['nonchilled']['quantity'] = (int)$cartPro['nonchilled']['quantity'] + (int)$proPutValues['nonchilled']['quantity'];						

				}else{

					$updateProData['chilled']['quantity'] = (int)$proPutValues['chilled']['quantity'];
					$updateProData['nonchilled']['quantity'] = (int)$proPutValues['nonchilled']['quantity'];

				}

				$updateProData['quantity'] = (int)$updateProData['chilled']['quantity'] + (int)$updateProData['nonchilled']['quantity'];

				$cartProducts[$product['_id']] = $updateProData;
				$updateProData['product'] = $product; //product original detail required in cart

				array_push($updatedData['products'],$updateProData);

			}
		

			try{

				$cart->products = $cartProducts;				
				$cart->save();

				return response(["success"=>true,"message"=>"cart updated successfully","data"=>$updatedData],200);

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
		
		$giftProducts = $inputs['products'];

		$except = isset($inputs['_uid'])?$inputs['_uid']:'';

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


		//$cart->products = $cartProducts;
		
		$gifts = empty($cart->gifts)?[]:$cart->gifts;

		$newGift = [
				"_id" => $gift['_id'],
				'_uid'=> new MongoId(),
				"products"=> $giftProducts,
				"recipient" => $inputs['recipient'],
				"price" => $gift['price'],
				"title"=> $gift['title'],
				"subTitle"=> $gift['subTitle'],
				"description"=> $gift['description'],
				"limit"=> $gift['limit'],
				"image"=> $gift['coverImage']['source'],
			];
		
		if($except!==""){
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

	public function postGiftcard(GiftCartRequest $request){

		$user = Auth::user('user');

		$inputs = $request->all();
		
		$cartKey = $this->deliverykey;
		
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

			$isInserted = DB::collection('cart')->where('_id', $cartKey)->push('giftCards', $giftCard);

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
}
