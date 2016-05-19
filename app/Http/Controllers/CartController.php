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
use MongoDate;
use MongoId;

class CartController extends Controller
{
	
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request)
	{

	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function create()
	{
		//
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function store(Request $request)
	{

		try {

			Brand::create($inputs);

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));

		}
		
		return response(array("success"=>true,"message"=>"Brand created successfully"));
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show(Request $request,$id)
	{		

		//$cartKey = $request->session()->get('deliverykey', $id);
		$cartKey = $id;
		$request->session()->put('deliverykey', $cartKey);
		
		$cart = Cart::find($cartKey);

		if(empty($cart)){
			return response(array("success"=>false,"message"=>"something went wrong with cart"));
		}

		$productsIdInCart = array_keys($cart->products);

		$productObj = new Products;

		$productsInCart = $productObj->getProducts(
									array(
										"id"=>$productsIdInCart,
										"with"=>array(
											"discounts"
										)
									)
								);

		$cart = $cart->toArray();
		

		if(!empty($productsInCart)){

			foreach($productsInCart as $product){

				$cart['products'][$product['_id']]['product'] = $product;			

			}

		}
	

		return response($cart,200);
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

		if(empty($cart)){
			return response(array("success"=>false,"message"=>"There is some issue with cart"));
		}

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

		$updateProData = array(
				"maxQuantity"=>(int)$product['quantity'],
				"chilled"=>array(
					"quantity"=>isset($cart->products[$proIdToUpdate])?$cart->products[$proIdToUpdate]['chilled']['quantity']:0,
					"status"=>"chilled",
				),
				"nonchilled"=>array(
					"quantity"=>isset($cart->products[$proIdToUpdate])?$cart->products[$proIdToUpdate]['nonchilled']['quantity']:0,
					"status"=>"nonchilled",
				),
				"quantity"=>0
			);

		if((bool)$inputs['chilled']){
			
			$updateProData['chilled']['quantity'] = (int)$inputs['quantity'];

		}else{
			$updateProData['nonchilled']['quantity'] = (int)$inputs['quantity'];
		}

		$oldQuantity = 0;
		if(isset($cart->products[$proIdToUpdate])){
			$oldQuantity = $cart->products[$proIdToUpdate]['quantity'];
		}

		$cart->products = array_merge($cart->products,array($proIdToUpdate=>$updateProData));


		// Code to update total quantity
		$updateProData = $cart->products[$proIdToUpdate];

		$quantity = isset($cart->products[$proIdToUpdate]['chilled'])?$cart->products[$proIdToUpdate]['chilled']['quantity']:0;
		$quantity+= isset($cart->products[$proIdToUpdate]['nonchilled'])?$cart->products[$proIdToUpdate]['nonchilled']['quantity']:0;

		$updateProData['quantity'] = $quantity;

		$product['change'] = $quantity - $oldQuantity;//Track change in quantity

		// Condition to check quantity is not more than available quantity
		if((int)$quantity>(int)$product['quantity']){
			return response(array("success"=>false,"errorCode"=>"100","message"=>"Product quantity is not available","data"=>$product));
		}


		try {
					
			if($quantity>0){

				$cart->products = array_merge($cart->products,array($proIdToUpdate=>$updateProData));
				$cart->save();

			}else{

				$cart->unset('products.'.$proIdToUpdate);

			}

			return response(array("success"=>true,"message"=>"cart updated successfully","data"=>$product));

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>"Something went worng"));
			return response(array("success"=>false,"message"=>$e->getMessage()));

		}

		return response(array("success"=>false,"message"=>"Something went worng"));

		
	}

	public function mergecarts($cartkey){

		$user = Auth::user('user');
        
        $cart = "";

        if(isset($user->_id)){
            
            $userCart = Cart::where("user","=",new MongoId($user->_id))->first();
            
            $sessionCart = Cart::find($cartkey);

            if(empty($userCart)){
            				
				$sessionCart->user = new MongoId($user->_id);

            }else{
            	
            	$sessionCart->products = array_merge($sessionCart->products,$userCart->products);

            }

            try{

            	$sessionCart->save();

            	if(!empty($userCart)){

            		$userCart->delete();

            	}
            	return response(["success"=>true,"message"=>"cart merge successfully"],200);

            }catch(\Exception $e){
            	return response(["success"=>false,"message"=>$e->getMessage()],400);
            }


        }else{
        	return response(["success"=>false,"message"=>"login required to merge"],400);
        }

        return response(["success"=>false,"message"=>"something went wrong"],400);

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

    public function confirmorder(Request $request){

    	$cartKey = $request->session()->get('deliverykey');
				
		$cart = Cart::find($cartKey);

		$cartArr = $cart->toArray();
	
		$user = Auth::user('user');
		
		$cartArr['user'] = new MongoId($user->_id);

		$cartProductsArr = [];
		
		foreach($cartArr['products'] as $key=>$product){		

			$product['_id'] = new MongoId($key);
			$cartProductsArr[] = $product;
						
		}

		$cartArr['products'] = $cartProductsArr;

		try {

			$order = Orders::create($cartArr);

			$cart->delete();
			
			$request->session()->forget('deliverykey');
			
			return response(array("success"=>true,"message"=>"order placed successfully","order"=>$order['_id']));

		} catch(\Exception $e){
			
			return response(array("success"=>false,"message"=>$e->getMessage()));

		}

    }

    public function deploycart(Request $request){

    	$cartKey = $request->session()->get('deliverykey');
				
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

    	if(isset($params['discount'])){
    		$cart->discount = $params['discount'];
    	}

    	if(isset($params['timeslot'])){
    		$cart->timeslot = $params['timeslot'];
    	}

    	if(isset($params['total'])){
    		$cart->total = $params['total'];
    	}

    	if(isset($params['subtotal'])){
    		$cart->subtotal = $params['subtotal'];
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
	    prd("Missing");
	}
}
