<?php

namespace AlcoholDelivery;

use Moloquent;
use MongoId;
use AlcoholDelivery\Products as Products;
use AlcoholDelivery\User as Users;
use AlcoholDelivery\Email as Email;

class Orders extends Moloquent
{
	protected $primaryKey = "_id";
	protected $collection = 'orders';

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
							'timeslot', 
							'status' , 
							'service', 
							'delivery' , 
							'nonchilled',
							'products',
							'packages', 
							'giftCards',
							'user',
							'total',
							'payment',
							'discount'
						];

	public function getOrders($where = [], $extra = []){

		$orders = $this;

		if(isset($extra['fields']) and  $extra['fields']){
			if(is_array($extra['fields'])){
				$fields = $extra['fields'];
			}else{
				$fields = explode(",",$extra['fields']);
			}
		}

		foreach($where as $conKey=>$con){
			$orders = $orders->where($conKey,$con);
		}

		$orders = $orders->orderBy('created_at', 'desc')->get($fields);

		$orders = $orders->toArray();

		if(empty($orders)){
			return false;
		}


		if(isset($extra['with']) and $extra['with']){

			foreach($extra['with'] as $with){

				if($with==="product"){

					$products = $this->getProducts($orders,false);
					$orders = $this->mergeProducts($orders,$products);
				}

			}

		}

		return $orders;
	}


	public function getProducts($orders=[],$fetchOrder){

		if($fetchOrder===true){
			$orders = [];//in case first we have to fetch ordres then code will written here.
		}

		$productKeys = [];
		
		foreach ($orders as $key => $order) {

			foreach($order['products'] as $product){
				array_push($productKeys, (string)$product['_id']);
			}		

		}

		$productsModel = new Products;
		$productKeys = array_unique($productKeys);

		$products = $productsModel->getProducts(
											array(
												"id"=>$productKeys,
												"with"=>array(
													"discounts"
												)
											)
										);

		if(!empty($products)){

			foreach($products as $key=>$product){

				$products[$product['_id']] = $product;
				unset($products[$key]);

			}

		}

		return $products;

	}

	public function mergeProducts($orders,$products){

		foreach ($orders as $key => &$order) {

			foreach($order['products'] as $proKey=>&$product){

				if(isset($products[(string)$product['_id']])){
					$product['original'] = $products[(string)$product['_id']];
				}else{
					unset($orders[$key]['products'][$proKey]);
				}

			}

		}

		return $orders;

	}


	public function generate($params = array()){
		
		$order = new Orders;
		$order->timeslot = array(

			"date" => new MongoDate(strtotime("2016-05-15 00:00:00")),
			"from" => 720,
			"to"   => 840

		);
		$order->save();
		
	}

	public function getOrdersToRepeat($userId){

		$fields = ["products","packages","updated_at","reference"];
		$orders = $this::where("user",new MongoId($userId))->orderBy('created_at', 'desc')->get($fields);
		return $orders;
		
	}

	public function completed($orderId){
		
		$response = [
			'success'=>false,
			'message'=>"",
		];

		$order = $this->find($orderId);

		$order->user = Users::find($order->user);

		if(isset($order->giftCards)){
			
			return $this->processGiftCards($order);	
		}

		$response['success'] = true;
		$response['message'] = "status changed successfully";

		return response($response,200);

	}

	public function processGiftCards($order){

		foreach ($order->giftCards as $key => $card){

			$email = new Email('giftcard');

			$data['sender'] = $order->user;
			$data['key'] = $card['_uid'];
			$data['beneficiary'] = $card['recipient'];
			
			$emailSent = $email->sendEmail($data);

			if(isset($card['recipient']['sms']) && $card['recipient']['sms'] && isset($card['recipient']['mobile']) && $card['recipient']['mobile']){

				$smsSent = Email::sendSms($data['beneficiary']['mobile'],$data['beneficiary']['message']);

			}

		}

		return ['success'=>true];

	}


}
