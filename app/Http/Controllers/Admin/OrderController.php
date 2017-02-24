<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\DealerRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Illuminate\Support\Facades\Auth;

use AlcoholDelivery\Orders;
use AlcoholDelivery\Products;
use AlcoholDelivery\CartAdmin as CartAdmin;
use AlcoholDelivery\Cart;
use AlcoholDelivery\Coupon;
use AlcoholDelivery\User;
use AlcoholDelivery\Email;
use AlcoholDelivery\Payment;
use AlcoholDelivery\ErrorLog;
use AlcoholDelivery\CreditTransactions;
use AlcoholDelivery\LoyaltyTransactions;

use Storage;
use Validator;

use MongoId;
use MongoDate;
use DB;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class OrderController extends Controller
{
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		return response([],400);
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

	public function getRemoveUnProcessed(Request $request){

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
		$cart->setReference();

		try {

			$cart->save();

			return response(["message"=>"cart updated successfully"],200);

		} catch(\Exception $e){

			return response(["message"=>$e->getMessage()],400);

		}

		return response(["message"=>'Something went wrong'],400);
		

	}

	public function postOrders(Request $request, $filter = ''){
		
		$params = $request->all();

		extract($params);

		$query = [];
		
		//DEFAULT SORTING
		$sort = ['created_at' => -1]; 

		if($filter != ''){
			if($filter == 'todaysorders'){
				$query[]['$match']['delivery.deliveryDate'] = date('Y-m-d');			
				$sort = ['delivery.deliveryKey' => 1]; 				
			}


		}

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

			$query[]['$match'] = ['$or' => [
					['consumer.name' => ['$regex'=>new \MongoRegex($s)]],
					['consumer.mobile_number' => ['$regex'=>new \MongoRegex($s)]],
					['consumer.alternate_number' => ['$regex'=>new \MongoRegex($s)]]		
			]];
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
				'doStatus'=>1,
				'rate'=>1
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

		$columns = ['reference','consumer.name','payment.total','created_at','delivery.type','doStatus','rate'];

		if($filter != ''){
			if($filter == 'todaysorders'){
				$columns = ['reference','consumer.name','delivery.deliveryKey','delivery.type','doStatus','rate'];				
			}
		}

		if(isset($params['order']) && !empty($params['order'])){
			$field = $columns[$params['order'][0]['column']];			
			$sortBy = ($params['order'][0]['dir'] == 'desc')?-1:1;
			$sort = [$field=>$sortBy];
		}

		if(isset($created_at) && trim($created_at)!=''){						
			$query[]['$match']['orderDate'] = $created_at;
		}

		$query[]['$sort'] = $sort;

		//return response($query);

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
			'data' => $model['result'],
			'filter' => $filter
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

	public function postUpdatestatus(Request $request){
		
		$data = $request->all();

		$valid = [];
		$valid['doStatus'] = 'required';	

		$data['notify'] = (int)$data['notify'];
		
		if(isset($data['notify']) && $data['notify'] == 1){			
			if($data['notifysms'] == 0 && $data['notifymail'] == 0){
				$valid['checkone'] = 'required';
			}			
			$valid['notifytime'] = 'required';
			$valid['message'] = 'required';
		}


		$validator = Validator::make($data, $valid,[
			'checkone.required' => 'Please select atleast 1 option.',
			'required_if' => 'This field is required'
		]);

		if ($validator->fails()) {
            return response($validator->errors(), 422);
        }else{

        	$order = Orders::find($data['id']);
        	$inventorylog = [];
        	//ORDER STATUS IS UPDATED
        	if($order['doStatus'] != $data['doStatus']){				

				$error = true;
				//IF CHANGE FROM READY OR UNDER PROCESS
				if($order['doStatus'] == 0 || $order['doStatus'] == 1){
					//DELIVERED
					if($data['doStatus'] == 2 && $order['doStatus'] == 1){
						$order->delivered_at = new MongoDate();
						$order->doStatus = 2;
						$order->save();
						$error = false;
					}

					//CANCELLED
					if($data['doStatus'] == 3){

						//IF ORDER IS READY STATE & CANCELLED THEN ROLLBACK INVENTORY
						if($order['doStatus'] == 1){

							//ROLL BACK THE INVENTORY INTO STOCK AND PRODUCT
							$inventorylog = DB::collection('inventoryLog')->where([
								'orderId' => new MongoId($data['id']),
								'type' => 0
							])->get();

							$newLog = [];			

							if($inventorylog){
								//return response($inventorylog);
								foreach ($inventorylog as $key => $value) {

									$value['type'] = 1;
									$value['_id'] = new MongoId();
									$newLog[] = $value;

									//STOCK UPDATE STORE WISE
									DB::collection('stocks')->raw()->update(
										['storeObjId' => $value['storeId'],'productObjId' => $value['productId']],
										[
											'$inc' => [
				                                'quantity' => $value['quantity']
				                            ]
										]
									);

									//UPDATE PRODUCT QTY
									DB::collection('products')->raw()->update(
										['_id' => $value['productId']],
										[
											'$inc' => [
				                                'quantity' => $value['quantity']
				                            ]
										]
									);
									
								}
							}

							if($newLog){
								$r = DB::collection('inventoryLog')->insert($newLog);
							}

						}

						//UPDATE USER TRANSACTIONS
						$userObj = User::find($order['user']);

						//DEDUCT LOYALTY FROM USER ACCOUNT
						if(isset($order['loyaltyPointEarned']) && $order['loyaltyPointEarned'] > 0){
							
							if($userObj->loyaltyPoints < $order['loyaltyPointEarned']){
								$decrement = $userObj['loyaltyPoints'];
							}else{
								$decrement = $order['loyaltyPointEarned'];
							}
							
							$loyaltyObj = [
								"points"=>$decrement,
								"method"=>"order",
								"reference" => $order['reference'],
								"user" => new mongoId((string)$userObj->_id),
								"comment"=> "Your order has been cancelled."
							];

							LoyaltyTransactions::transaction('debit',$loyaltyObj,$userObj);

						}

						//ROLL BACK LOYALTY TO USER ACCOUNT
						if(isset($order['loyaltyPointUsed']) && $order['loyaltyPointUsed'] > 0){

							$loyaltyObj = [
								"points"=>$order['loyaltyPointUsed'],
								"method"=>"order",
								"reference" => $order['reference'],
								"user" => new mongoId((string)$userObj->_id),
								"comment"=> "Your order has been cancelled."
							];

							LoyaltyTransactions::transaction('credit',$loyaltyObj,$userObj);

						}

						//DEDUCT CREDITS ADDED FROM LOYALTY CREDITS
						if(isset($order['creditsFromLoyalty']) && $order['creditsFromLoyalty'] > 0){
							
							$creditsFromLoyalty = $order['creditsFromLoyalty'];
			
							$creditObj = [
											"credit"=>$creditsFromLoyalty,
											"method"=>"order",
											"reference" => $order['reference'],
											"user" => new mongoId($userObj->_id),
											"shortComment"=> "Order cancelled.",
											"comment"=> "Your order has been cancelled."
										];

							CreditTransactions::transaction('debit',$creditObj,$userObj);
						}

						//ROLL BACK CREDITS USED IN CART
						if(isset($order->discount['credits']) && $order->discount['credits']>0){

							$creditsUsed = $order->discount['credits'];
							$creditObj = [
											"credit"=>$creditsUsed,
											"method"=>"order",
											"reference" => $order['reference'],
											"user" => new mongoId($userObj->_id),
											"shortComment"=> "Order cancelled.",
											"comment"=> "Your order has been cancelled."
										];

							CreditTransactions::transaction('credits',$creditObj,$userObj);

						}

						$order->cancelled_at = new MongoDate();
						$order->doStatus = 3;
						$order->save();
						$error = false;
					}
				}
				
				if($error){
					$orderStatus = [
						0 => 'Under Process',
						1 => 'Ready',
						2 => 'Delivered',
						3 => 'Cancelled'
					];
					$emsg = 'Cannot update order from '.$orderStatus[$order['doStatus']].' to '.$orderStatus[$data['doStatus']].'.';
					return response(['doStatus'=>[$emsg],'data'=>$inventorylog],422);
				}

        	}	

        	if($order && $data['notify'] == 1){
	           	
	           	$mailsent = 0;
	           	$smssent = 0;

	            $user = User::find((string)$order['user'])->toArray();
	            
	            if($data['notifymail'] == 1){

	                $mail = new Email('customtemplate');
	                
	                $subjectType = [
	                	0 => 'Order under process!',
	                	1 => 'Your order is on the way!',
	                	2 => 'Your order is delivered!',
	                	3 => 'Your order is cancelled',
	                ];	

	                $mdata = [
	                	'email' => $user['email'],
	                	'name' => (isset($user['name']) && $user['name']!='')?$user['name']:'',
	                	'message' => $data['message'],
	                	'subject' => $subjectType[$data['doStatus']]
	                ];

	                $mailsent = $mail->sendEmail($mdata);
	            }
	            
	            if(isset($user['mobile_number']) && $data['notifysms'] == 1){
	                $msgtxt = $data['message'];

	                /*$msgtxt = str_ireplace(['{site_title}','{order_number}','{time_of_delivery}'],[config('app.appName'),$order->reference,$data['time']],$msgtxt);*/

	                $smssent = Email::sendSms($user['mobile_number'],$msgtxt);
	            }
	            return response(['message'=>'Notification sent successfully.','mailsent'=>$mailsent,'smssent'=>$smssent],200);
	        }

        	return response(['status updated'], 200);
        }
	}


	public function confirmorder(Request $request,$cartKey = null){

		$creator = Auth::user('admin');
		//$cart = Cart::where("_id","=",$cartKey)->where("freeze",true)->first();

		if($cartKey == null){

			$cartKey = $request->get('merchant_data1');

		}

		$cart = Cart::findUpdated($cartKey,$creator->_id);

		/*if(!isset($cart->reference)){
			$cart->setReference();
		}*/
		

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

		$userObj = User::find($cartArr['user']);		

		$cartArr['user'] = new MongoId($cartArr['user']);


		try {

			//PREPARE PAYMENT FORM DATA
			if(!$request->isMethod('get') && $cartArr['payment']['method'] == 'CARD' && $cartArr['payment']['total']>0){

				$payment = new Payment();
				$payment = $payment->prepareform($cartArr,$userObj,true);
				return response($payment,200);
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
					return redirect('admin#/orders/consumer');
				}
			}

			$orderObj = $cart->cartToOrder($cartKey,'2');

			$defaultContact = true;
			if(!isset($orderObj['delivery']['newDefault']) || $orderObj['delivery']['newDefault']!==true){
				$defaultContact = false;
			}
			
			$userObj->setContact($orderObj['delivery']['contact']);
			$order = Orders::create($orderObj);
				

			if(isset($order->coupon)){

				$cRedeem = [
					"coupon" => $order->coupon['_id'],
					"reference"=>$order->reference,
					"user" => $order->user
				];
				$coupon = new coupon;
				$coupon->redeemed($cRedeem);

			}
			
			$cart->delete();

			$process = $order->processGiftCards();			

			$reference = $order->reference;

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
			
			//SAVE CARD IF USER CHECKED SAVE CARD FOR FUTURE PAYMENTS
			if($cartArr['payment']['method'] == 'CARD' && $cartArr['payment']['card'] == 'newcard' && (isset($cartArr['payment']['savecard']) && $cartArr['payment']['savecard'])){
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
				return redirect('admin#/orders/show/'.$order['_id']);
			}

			return response(["message"=>"Order Placed Successfully","order"=>$order['_id']],200);

		} catch(\Exception $e){
			
			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Cart Confirm'
				]);

		}

		return response(["message"=>'Something went wrong'],400);
		
	}

	function logtofile($message){
        //if($this->enableLog){
            $view_log = new Logger('Payment Logs');
            $view_log->pushHandler(new StreamHandler(storage_path().'/logs/admin_payment.log', Logger::INFO));
            if(is_array($message)){
            	$message = json_encode($message);
            }
            $view_log->addInfo($message);
        //}
    }
    
}
