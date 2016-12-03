<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\DealerRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Illuminate\Support\Facades\Auth;

use Storage;
use Validator;
use AlcoholDelivery\Products as Products;
use MongoId;
use MongoDate;
use DB;


use AlcoholDelivery\Orders as Orders;
use AlcoholDelivery\CartAdmin as CartAdmin;
use AlcoholDelivery\User as User;

class OrderController extends Controller
{
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{

	}
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request)
	{
		$user = Auth::user('admin');

		$response = [
			'isUnprocessed' => false,
			'message'=> "",
			'cart' => []
		];

		try{

			$cartObj = new CartAdmin;
			
			$cart = $cartObj->getLastUnProcessed(new MongoId($user->_id));

			if(empty($cart)){

				$result = $cartObj->generate(new MongoId($user->_id));
				$response['cart'] = $result->cart;

			}else{

				$response['isUnprocessed'] = true;

				$cart = $cart->toArray();
				
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

				$response['cart'] = $cart;

				$request->session()->put('deliverykeyAdmin', $cart['_id']);

			}			

		}catch(Exception $e){

			$response["message"] = $e->getMessage();

			return response($response,400);

		}
		
		return response($response,200);

	}

	public function getNewcart(Request $request){

		$user = Auth::user('admin');

		$response = [
			'cart' => []
		];
		
		try{

			$cartObj = new CartAdmin;
			$userId = new MongoId($user->_id);
			$cart = $cartObj->getLastUnProcessed($userId);

			if(!empty($cart)){

				$result = $cartObj->deleteLastUnProcessed($userId);

			}

			$result = $cartObj->generate($userId);
			$response['cart'] = $result->cart;

			$request->session()->put('deliverykeyAdmin', $result->cart['_id']);

		}catch(Exception $e){

			$response["message"] = $e->getMessage();

			return response($response,400);

		}

		return response($response,200);

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
	public function store(DealerRequest $request)
	{        
		$inputs = $request->all();

		$inputs['status'] = (int)$inputs['status'];

		$dealer = Dealer::create($inputs);    

		return $dealer;
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function getDetail($id)
	{
		$order = Orders::find($id);

		if(!empty($order)){

			$orderarray = $order->toArray();
			$order = $order->formatorder($orderarray);

			$order['user'] = user::where('_id',"=",$order['user'])->first(['name','email','mobile_number','status','created_at','address']);
			$order['user'] = $order['user']->toArray();

			$order['dateslug'] = date("F d, Y H:ia",strtotime('+8 hours',strtotime($order['created_at'])));
			$order['status'] = 0;
			$order['timeslot']['dateslug'] = date("F d, Y",$order['timeslot']['datekey']);


			return response($order,200);

		}

		return response(['success'=>false,"message"=>"Order not found"],400);		
		
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
	**/
	public function update(DealerRequest $request, $id)
	{
		$inputs = $request->all();

		$dealer = dealer::find($id);
		
		$dealer->title = $inputs['title'];
		$dealer->address = $inputs['address'];
		$dealer->contacts = $inputs['contacts'];
		$dealer->status = (int)$inputs['status'];    
		$dealer->description = $inputs['description'];
		
		if($dealer->save()){
			return response(array("success"=>true,"message"=>"Dealer updated successfully"));
		}
		
		return response(array("success"=>false,"message"=>"Something went wrong"));
		
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($ids)
	{        
		$keys = explode(",", $ids);
		
		try {

			$dealers = Dealer::whereIn('_id', $keys)->delete();

		} catch(\Illuminate\Database\QueryException $e){

			return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

		}

		return response(array("success"=>true,"message"=>"Record(s) Removed Successfully"));
	}

	public function getOrder($dealerId){

		$dealerObj = new Orders;

		$result = $dealerObj->getDealers(array(
						"key"=>$dealerId,
						"multiple"=>false
					));
		
		return response($result, 201);

	}

	public function putDeploycart(Request $request,$cartKey){

		$cart = CartAdmin::find($cartKey);

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

		if(isset($params['orderType'])){

			$cart->orderType = $params['orderType'];

		}

		if(isset($params['user'])){

			$cart->user = new MongoId($params['user']);

		}

		//SET CART REFERENCE FOR ORDER ID
		//$cart->setReference();

		try {

			$cart->save();

			return response(["message"=>"cart updated successfully"],200);

		} catch(\Exception $e){

			return response(["message"=>$e->getMessage()],400);

		}

		return response(["message"=>'Something went wrong'],400);
		

	}

	public function postOrders(Request $request){
		
		$params = $request->all();

		extract($params);

		$query = [];

		if(isset($reference) && trim($reference)!=''){			
			$s = "/".$reference."/i";
			$query[]['$match']['reference'] = ['$regex'=>new \MongoRegex($s)];
		}	

		if(isset($deliveryType) && trim($deliveryType)!=''){						
			if($deliveryType == 2){
				$query[]['$match']['delivery.type'] = 0;
				$query[]['$match']['service.express.status'] = true;
			}else{
				$query[]['$match']['delivery.type'] = (int)$deliveryType;
			}
		}

		if(isset($doStatus) && trim($doStatus)!=''){						
			$query[]['$match']['doStatus'] = (int)$doStatus;
		}

		$query[]['$lookup'] = [
			'from' => 'user',
			'localField'=>'user',
			'foreignField'=>'_id',
			'as'=>'consumer'
		];

		$query[]['$unwind'] = [
			'path' => '$consumer',
			'preserveNullAndEmptyArrays' => true,
		];

		if(isset($consumerName) && trim($consumerName)!=''){			
			$s = "/".$consumerName."/i";
			$query[]['$match']['consumer.name'] = ['$regex'=>new \MongoRegex($s)];
		}

		$project = [
				'reference'=>1,
				'delivery'=>1,
				'status'=>1,
				'_id'=>1,
				'created_at'=>1,
				'payment'=>1,
				'service'=>1,
				'reference'=> 1,
				'doStatus'=>1
			];

		$project['orderDate'] = ['$dateToString'=>['format' => '%Y-%m-%d','date'=>'$created_at']];

		$project['consumer'] = '$consumer';

		/*$project['noOfProducts'] = [
			'$sum' =>[
				['$size'=>'$productsLog'],
				//['$size'=>'$packages'],
			]
		];*/

		//$project['noOfProducts'] = ['$size'=>'$productsLog'];			

		$query[]['$project'] = $project;

		$columns = ['reference','consumer.name','payment.total','created_at','delivery.type','doStatus'];

		$sort = ['created_at' => -1]; 

		if(isset($params['order']) && !empty($params['order'])){
			$field = $columns[$params['order'][0]['column']];			
			$sortBy = ($params['order'][0]['dir'] == 'desc')?-1:1;
			$sort = [$field=>$sortBy];
		}

		if(isset($created_at) && trim($created_at)!=''){						
			$query[]['$match']['orderDate'] = $created_at;
		}

		$query[]['$sort'] = $sort;

		$model = Orders::raw()->aggregate($query);

		$iTotalRecords = count($model['result']);

		$query[]['$skip'] = (int)$start;
        	
    	if($length > 0){
    		$query[]['$limit'] = (int)$length;
			$model = Orders::raw()->aggregate($query);
		}

		$response = [
			'recordsTotal' => $iTotalRecords,
			'recordsFiltered' => $iTotalRecords,
			'draw' => $draw,
			'data' => $model['result']            
		];

		return response($response,200);		
	}


	public function putStatus($orderId,$status){

		$result = [];

		$orderModel = new Orders;

		switch($status){

			case 'success':

				$result = $orderModel->completed($orderId);
			
			break;

		}

		if($result['success']){
			return response($result,200);
		}
		
		return response($result,400);
		
	}

	public function missingMethod($parameters = array())
	{
	    prd('Method Missing');
	}


}
