<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Cart as Cart;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Products as Products;
use AlcoholDelivery\Setting as Setting;
use AlcoholDelivery\Orders as Orders;
use AlcoholDelivery\Promotion as Promotion;
use MongoDate;
use MongoId;

class CartController extends Controller
{

	/**
	 * ErrorCode
	 * 100 => Quantity requested is not available
	 * 101 => Product is not available for sale	 
	 */

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

				$productsIdInCart = array_keys((array)$userCart['products']);

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

						$userCart['products'][$product['_id']]['product'] = $product;

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
	public function show(Request $request,$id)
	{
		$cart = Cart::findUpdated($id);

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

		$productsIdInCart = array_keys((array)$cart['products']);

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

				$cart['products'][$product['_id']]['product'] = $product;

			}

		}

		$cart['products'] = (object)$cart['products'];
		$cart['packages'] = (object)$cart['packages'];


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
	public function update(Request $request, $id)
	{

		$inputs = $request->all();

		$proIdToUpdate = $inputs['id'];

		$cart = Cart::find($id);

		$response = [
			"success"=>false,
			"message"=>"Something went worng",
			"code" => 000,
		];
		
		if(empty($cart)){

			$response['message'] = "Not a valid request";
			return response($response,400);

		}	

		$productInCart = isset($cart->products[$proIdToUpdate])?$cart->products[$proIdToUpdate]:false;

		$productObj = new Products;

		$product = $productObj->getProducts(
									array(
										"id"=>$proIdToUpdate,
										"with"=>array(
											"discounts"
										)
									)
								);

		$product = $product[0];

		if((int)$product['quantity']>0){
			
			$maxAvailQuantity = (int)$product['quantity'];

		}elseif($product['outOfStockType']==2){
			
			$maxAvailQuantity = (int)$product['maxQuantity'];

		}else{

			// Handel if product goes dis-continue in middle of processing
			$response['success'] = true;
			$response['code'] = 101;
			$response['message'] = "Product is no longer available";

			$product['change'] = -$productInCart['quantity'];
			$response['product']['quantity'] = 0;

			$response['product']['product'] = $product;

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

				"maxQuantity"=>$maxAvailQuantity,
				"chilled"=>array(
					"quantity"=>$productInCart!==false?$productInCart['chilled']['quantity']:0,
					"status"=>"chilled",
				),
				"nonchilled"=>array(
					"quantity"=>$productInCart!==false?$productInCart['nonchilled']['quantity']:0,
					"status"=>"nonchilled",
				),
				"quantity"=>0,
				"lastServedChilled" => (bool)$inputs['chilled']
			);

		if((bool)$inputs['chilled']){

			$updateProData['chilled']['quantity'] = (int)$inputs['quantity'];

		}else{

			$updateProData['nonchilled']['quantity'] = (int)$inputs['quantity'];

		}

		$oldQuantity = $productInCart!==false?(int)$productInCart['quantity']:0;

		$cart->products = array_merge($cart->products,[$proIdToUpdate=>$updateProData]);

		// Code to update total quantity
		$updateProData = $cart->products[$proIdToUpdate];

		$updateProData['quantity'] = (int)$updateProData['chilled']['quantity'] + (int)$updateProData['nonchilled']['quantity'];
		
		$product['change'] = $updateProData['quantity'] - $oldQuantity;//Track change in quantity

		// Condition to check quantity is not more than available quantity
		// if($product['quantity']==0 && $product['outOfStockType']==2){

		// 	$product['quantity'] = $product['maxQuantity'];

		// }


		if($updateProData['quantity']>(int)$updateProData['maxQuantity']){

			// Handel if product quantity is greater than available quantity
			$response['code'] = 100;
			$response['message'] = "Requested quantity is not available, max available is added to cart";

			$extraQuantity = $updateProData['quantity'] - $updateProData['maxQuantity'];
			$product['change'] = $updateProData['maxQuantity'] - $oldQuantity;
			
			if($extraQuantity>0){

				if($extraQuantity > $updateProData['chilled']['quantity']){

					$extraQuantity-= $updateProData['chilled']['quantity'];
					$updateProData['chilled']['quantity'] = 0;

				}else{
					

					$updateProData['chilled']['quantity']-=$extraQuantity;
					$extraQuantity = 0;

				}

				if($extraQuantity > $updateProData['nonchilled']['quantity']){

					$extraQuantity-= $updateProData['nonchilled']['quantity'];
					$updateProData['nonchilled']['quantity'] = 0;

				}else{

					$updateProData['nonchilled']['quantity']-=$extraQuantity;
					$extraQuantity = 0;

				}
			}

			$updateProData['quantity'] = (int)$updateProData['chilled']['quantity'] + (int)$updateProData['nonchilled']['quantity'];
			
			
		}

		try {

			if($updateProData['quantity']>0){

				$cart->products = array_merge($cart->products,array($proIdToUpdate=>$updateProData));
				$cart->save();

			}else{

				$cart->unset('products.'.$proIdToUpdate);

			}

			$updateProData['product'] = $product;
			$response['success'] = true;
			$response['message'] = "cart updated successfully";
			$response['product'] = $updateProData;

			return response($response);

		} catch(\Exception $e){

			return response(["success"=>false,"message"=>"Something went worng"]);
			return response(["success"=>false,"message"=>$e->getMessage()]);

		}

		return response(["success"=>false,"message"=>"Something went worng"]);


	}

	public function createpackage(Request $request, $cartKey){

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

		$packageDetail['_unique'] = sha1(time());

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

		if($packageDetail['packageQuantity']>0){
			array_unshift($packages, $packageDetail);
		}

		$cart->packages = $packages;


		try {

			$cart->save();

			return response(array("success"=>true,"message"=>"cart updated successfully","key"=>$packageDetail['_unique']));

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>"Something went worng"));
			return response(array("success"=>false,"message"=>$e->getMessage()));

		}


	}

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

	public function mergecarts($cartkey){

		$user = Auth::user('user');

        $cart = "";

        if(isset($user->_id)){

            $userCart = Cart::where("user","=",new MongoId($user->_id))->where("_id","!=",new MongoId($cartkey))->first();

            $sessionCart = Cart::find($cartkey);

            if(!empty($userCart)){

            	$sessionCart->products = array_merge($sessionCart->products,$userCart->products);

            }

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


		$currDate = date("Y-m-d", strtotime('tomorrow'));

    	if(isset($data)!==""){

    		$passedDate = date("Y-m-d",strtotime($date));

    		if(strtotime($passedDate)<strtotime($currDate)){
    			$passedDate = $currDate;
    		}

    	}else{

    		$passedDate = $currDate;

    	}

    	$weeknumber = date("N",strtotime($passedDate));

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
			//$slotArr[$weekKeys[$weeknumber]] = [];
			$slotArr[$weekKeys[$weeknumber]]['slots'] = $timeSlots[$weeknumber-1];
			$slotArr[$weekKeys[$weeknumber]]['datestamp'] = date("d M",strtotime($tempDate));
			$slotArr[$weekKeys[$weeknumber]]['datekey'] = strtotime($tempDate);

			$tempDate = date("Y-m-d",strtotime('+1 day', strtotime($tempDate)));

			if($weeknumber==7){
				$weeknumber = 0;
			}
			$weeknumber++;

		}

    	return response($slotArr,200);
    }

    public function removeproduct($proId,$type,Request $request){

    	$cartKey = $request->session()->get('deliverykey');

		$cart = Cart::find($cartKey);

		$products = $cart->products;
		$products[$proId][$type]=0;

		$products[$proId]['quantity'] = (int)$products[$proId]['chilled'] + (int)$products[$proId]['nonchilled'];

			try {

				if($products[$proId]['quantity']>0){

					$cart->products = $products;

					$cart->save();

					return response(array("success"=>true,"message"=>"cart updated successfully","removeCode"=>200));
					//200 to know only chilled/nonchilled is removed

				}else{

					$cart->unset('products.'.$proId);

					return response(array("success"=>true,"message"=>"cart updated successfully","removeCode"=>300));
					//300 to know complete product is removed

				}


			} catch(\Exception $e){

				return response(array("success"=>false,"message"=>$e->getMessage()));

			}

		return response(array("success"=>false,"message"=>"Something went wrong"));

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

    public function confirmorder(Request $request,$cartKey){

		$cart = Cart::find($cartKey);

		$cartArr = $cart->toArray();

		$user = Auth::user('user');

		$cartArr['user'] = new MongoId($user->_id);

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
			
			$reference = "ADSG";

			$reference.= ((int)date("ymd",strtotime($order->created_at)) - 123456);			
			$reference.="O";			
			$reference.= (string)date("Hi",strtotime($order->created_at));

			$order->reference = $reference;

			$order->save();


			$request->session()->forget('deliverykey');

			return response(array("success"=>true,"message"=>"order placed successfully","order"=>$order['_id']));

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));

		}

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

    	try {

			$cart->save();

			return response(array("success"=>true,"message"=>"cart updated successfully"));

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));

		}

		return response(array("success"=>false,"message"=>"Something went worng"));

    }

    public function missingMethod($parameters = array())
	{
	    jprd("Missing");
	}
}
