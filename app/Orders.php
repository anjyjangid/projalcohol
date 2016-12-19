<?php

namespace AlcoholDelivery;

use Moloquent;
use MongoId;
use AlcoholDelivery\Products as Products;
use AlcoholDelivery\User as Users;
use AlcoholDelivery\Email as Email;
use View;

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
							'sales',
							'loyalty',
							'loyaltyCards',
							'promotion',
							'gift',
							'giftCards',
							'user',
							'total',
							'payment',
							'discount',
							'loyaltyPointUsed',
							'loyaltyPointEarned',
							'creditsFromLoyalty',
							'reference',
							'productsLog',
							'doStatus',
							'interface',
							'coupon',
							'delivered_at',
							'cancelled_at',
							'generatedBy',
							'printed'
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
		
		$products = $productsModel->fetchProduct(["id"=>$productKeys]);

		// $products = $productsModel->getProducts(
		// 									array(
		// 										"id"=>$productKeys,
		// 										"with"=>array(
		// 											"discounts"
		// 										)
		// 									)
		// 								);

		if($products['success'] && !empty($products['product'])){
			$products = $products['product'];

			foreach($products as $key=>$product){

				$products[(string)$product['_id']] = $product;
				unset($products[$key]);

			}

		}
		
		return $products;

	}

	public function mergeProducts($orders,$products){

		foreach ($orders as $key => &$order) {

			foreach($order['products'] as $proKey=>&$product){

				if(isset($products[(string)$product['_id']])){

					$tempProduct = $product;

					$product = $products[(string)$product['_id']];

					$product["orderQty"]=[

							'chilled'=>$tempProduct['quantity']['chilled'],
							'nonChilled'=>$tempProduct['quantity']['nonChilled']
						];
					
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
		$orders = $this::where("user",new MongoId($userId))->whereNotNull("products")->orderBy('created_at', 'desc')->get($fields);
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

	public function processGiftCards(){

		$user = Users::find($this->user);

		if(!isset($this->giftCards) || !is_array($this->giftCards)){
			return ['success'=>true];
		}

		foreach ($this->giftCards as $key => $card){

			$email = new Email('giftcard');

			$data['sender'] = $user;
			$data['key'] = $card['_uid'];
			$data['beneficiary'] = $card['recipient'];
			
			$emailSent = $email->sendEmail($data);

			if(isset($card['recipient']['sms']) && $card['recipient']['sms'] && isset($card['recipient']['mobile']) && $card['recipient']['mobile']){

				$smsSent = Email::sendSms($data['beneficiary']['mobile'],$data['beneficiary']['message']);

			}

		}

		return ['success'=>true];

	}

	public function formatorder($order){

		$productInfo = [];
		if(isset($order['productsLog']) && !empty($order['productsLog'])){
			foreach ($order['productsLog'] as $key => $value) {
				$productInfo[(string)$value['_id']] = $value;
			}
		}

		$particulars = [];
		//INDIVIDUAL PRODUCTS IN CART
		if(isset($order['products']) && !empty($order['products'])){
			foreach ($order['products'] as $key => $value) {
				if(isset($value['qtyfinal']) && $value['qtyfinal']>0){

					$productId = (string)$value['_id'];
					$product = $productInfo[$productId];
					
					//HAS CHILLED 
					if(isset($value['quantity']['chilled']) && $value['quantity']['chilled']>0){							
						$particulars[] = [
							'_id' => $value['_id'],
							'name' => $product['name'],
							'slug' => $product['slug'],
							'coverImage' => @$product['coverImage'],
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'sku' => $product['sku'],
							'chilled' => true,
							'quantity' => $value['quantity']['chilled'],
							'unitPrice' => $value['unitprice'],
							'total' => $value['quantity']['chilled']*$value['unitprice'],
							'products' => [],
							'category' => 'product',
							'sale' => isset($product['sale'])?$product['sale']:false
						];
					}

					//HAS NON-CHILLED 
					if(isset($value['quantity']['nonChilled']) && $value['quantity']['nonChilled']>0){							
						$particulars[] = [
							'_id' => $value['_id'],
							'name' => $product['name'],
							'slug' => $product['slug'],
							'coverImage' => @$product['coverImage'],
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'sku' => $product['sku'],
							'chilled' => false,
							'quantity' => $value['quantity']['nonChilled'],
							'unitPrice' => $value['unitprice'],
							'total' => $value['quantity']['nonChilled']*$value['unitprice'],
							'products' => [],
							'category' => 'product'
						];
					}

				}
			}		
		}

		//SALE & TAGS PRODUCT
		if(isset($order['sales']) && !empty($order['sales'])){
			foreach ($order['sales'] as $key => $value) {					
				
				$saleProduct = [];

				foreach ($value['products'] as $pkey => $pvalue) {
					$productId = (string)$pvalue['_id'];
					$product = $productInfo[$productId];											
					$chillstatus = ($product['chilled'] && $value['chilled'])?true:false;
					$saleProduct[] = [
						'_id' => $pvalue['_id'],
						'name' => $product['name'],
						'slug' => $product['slug'],
						'coverImage' => @$product['coverImage'],
						'description' => $product['description'],
						'shortDescription' => $product['shortDescription'],
						'sku' => $product['sku'],
						'chilled' => $chillstatus,
						'quantity' => $pvalue['quantity'],
						'category' => 'saleproduct'							
					];
				}

				if(isset($value['action']) && !empty($value['action'])){
					foreach ($value['action'] as $pkey => $pvalue) {
						$productId = (string)$pvalue['_id'];
						$product = $productInfo[$productId];											
						$chillstatus = ($product['chilled'] && $value['chilled'])?true:false;
						$saleProduct[] = [
							'_id' => $pvalue['_id'],
							'name' => $product['name'],
							'slug' => $product['slug'],
							'coverImage' => @$product['coverImage'],
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'sku' => $product['sku'],
							'chilled' => $chillstatus,
							'quantity' => $pvalue['quantity'],
							'category' => 'saleproduct'							
						];
					}
				}
				
				$particulars[] = [
					'_id' => $value['_id'],
					'name' => $value['sale']['title'],
					'detailTitle' => $value['sale']['detailTitle'],
					'slug' => '',
					'coverImage' => '',
					'description' => '',
					'shortDescription' => '',
					'sku' => '',
					'chilled' => $value['chilled'],
					'quantity' => '',
					'unitPrice' => '',
					'total' => $value['price']['sale'],
					'products' => $saleProduct,
					'category' => 'saleproduct'
				];					
			}
		}

		//PACKAGES
		if(isset($order['packages']) && !empty($order['packages'])){

			foreach ($order['packages'] as $key => $value) {
				$packageProduct = [];
				foreach ($value['products'] as $pkey => $pvalue) {
					$productId = (string)$pvalue['_id'];
					$product = $productInfo[$productId];						
					$packageProduct[] = [
						'_id' => $pvalue['_id'],
						'name' => $product['name'],
						'slug' => $product['slug'],
						'coverImage' => @$product['coverImage'],
						'description' => $product['description'],
						'shortDescription' => $product['shortDescription'],
						'sku' => $product['sku'],
						'chilled' => $product['chilled'],
						'quantity' => $pvalue['quantity'],
						'category' => 'packageproduct'
					];
				}
				$particulars[] = [
					'_id' => $value['_id'],
					'name' => $value['title'],
					'slug' => '',
					'coverImage' => $value['coverImage'],
					'description' => $value['description'],
					'shortDescription' => $value['subTitle'],
					'sku' => '',
					'chilled' => false,
					'quantity' => $value['packageQuantity'],
					'unitPrice' => $value['packagePrice'],
					'total' => $value['price'],
					'products' => $packageProduct,
					'category' => 'packageproduct'
				];
			}
		}

		//GIFT CARDS
		if(isset($order['giftCards']) && !empty($order['giftCards'])){
			foreach ($order['giftCards'] as $key => $value) {
				$particulars[] = [
					'_id' => $value['_id'],
					'name' => $value['title'],
					'slug' => '',
					'coverImage' => '',
					'description' => $value['description'],
					'shortDescription' => $value['subTitle'],
					'chilled' => false,
					'quantity' => $value['quantity'],
					'unitPrice' => $value['price']/$value['quantity'],
					'total' => $value['price'],
					'recipient' => $value['recipient'],
					'category' => 'giftcard'
				];
			}
		}

		//LOYALTY PRODUCTS
		if(isset($order['loyalty']) && !empty($order['loyalty'])){
			foreach ($order['loyalty'] as $key => $value) {
				$productId = (string)$value['_id'];
				$product = $productInfo[$productId];
				
				if($value['quantity']['chilled']>0){
					$particulars[] = [
						'_id' => $product['_id'],
						'name' => $product['name'],
						'slug' => '',
						'coverImage' => @$product['coverImage'],
						'description' => $product['description'],
						'shortDescription' => $product['shortDescription'],
						'chilled' => true,
						'quantity' => $value['quantity']['chilled'],
						'unitPrice' => $value['price']['amount'],
						'total' => $value['price']['amount']*$value['quantity']['chilled'],
						'unitLoyalty' => $value['price']['points'],
						'totalLoyalty' => $value['price']['points']*$value['quantity']['chilled'],
						'category' => 'loyaltyproduct'
					];						
				}
				if($value['quantity']['nonChilled']>0){
					$particulars[] = [
						'_id' => $product['_id'],
						'name' => $product['name'],
						'slug' => '',
						'coverImage' => @$product['coverImage'],
						'description' => $product['description'],
						'shortDescription' => $product['shortDescription'],
						'chilled' => false,
						'quantity' => $value['quantity']['nonChilled'],
						'unitPrice' => $value['price']['amount'],
						'total' => $value['price']['amount']*$value['quantity']['nonChilled'],
						'unitLoyalty' => $value['price']['points'],
						'totalLoyalty' => $value['price']['points']*$value['quantity']['nonChilled'],
						'category' => 'loyaltyproduct'
					];						
				}

			}
		}

		//LOYALTY CARDS
		if(isset($order['loyaltyCards']) && !empty($order['loyaltyCards'])){
			foreach ($order['loyaltyCards'] as $key => $value) {
				$particulars[] = [
					'_id' => '',
					'name' => 'Convert '.$value['points'].' to $'.$value['value'].' credits',
					'slug' => '',
					'coverImage' => '',
					'description' => '',
					'shortDescription' => '',
					'chilled' => false,
					'quantity' => $value['quantity'],
					'unitPrice' => '',
					'total' => '',
					'unitLoyalty' => $value['points'],
					'totalLoyalty' => $value['points']*$value['quantity'],
					'category' => 'loyaltycard'
				];				
			}				
		}	

		//GIFT PACKAGING
		if(isset($order['gift']) && !empty($order['gift'])){
			foreach ($order['gift']['container'] as $containerkey => $containervalue) {						
					$giftpackage = [];
					foreach ($containervalue['products'] as $cpkey => $cpvalue) {
						$productId = (string)$cpvalue['_id'];
						$product = $productInfo[$productId];
						$giftpackage[] = [
							'_id' => $product['_id'],
							'name' => $product['name'],
							'slug' => $product['slug'],
							'coverImage' => @$product['coverImage'],
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'sku' => $product['sku'],
							'chilled' => false,
							'quantity' => $cpvalue['quantity'],
							'category' => 'giftpackage'
						];
					}

					$particulars[] = [
						'_id' => $containervalue['_id'],
						'name' => $containervalue['title'],
						'slug' => '',
						'coverImage' => '',
						'description' => $containervalue['description'],
						'shortDescription' => $containervalue['subTitle'],
						'chilled' => false,
						'quantity' => 1,
						'unitPrice' => $containervalue['price'],							
						'total' => $containervalue['price'],
						'products' => $giftpackage,
						'category' => 'giftpackage'
					];
				
			}
		}		

		//PROMOTIONS 
		
		if(isset($order['promotion']) && !empty($order['promotion'])){
			foreach ($order['promotion'] as $promotionkey => $promotionvalue) {
				$promotionalProduct = [];
				if(isset($promotionvalue['product'])){
					$productId = (string)$promotionvalue['product'];
					$product = $productInfo[$productId];

					$promotionalProduct[] = [
						'_id' => $product['_id'],
						'name' => $product['name'],
						'slug' => $product['slug'],
						'coverImage' => @$product['coverImage'],
						'description' => $product['description'],
						'shortDescription' => $product['shortDescription'],
						'sku' => $product['sku'],
						'chilled' => false,
						'quantity' => 1,
						'category' => 'promotion'
					];

					$particulars[] = [
						'_id' => '',
						'name' => $promotionvalue['title'],
						'slug' => $product['slug'],
						'coverImage' => $product['coverImage'],
						'description' => $product['description'],
						'shortDescription' => $product['shortDescription'],
						'chilled' => false,
						'quantity' => 1,
						'unitPrice' => $promotionvalue['price'],							
						'total' => $promotionvalue['price'],
						'products' => $promotionalProduct,
						'category' => 'promotion'
					];
				}
			}
		}

		$order['particulars'] = $particulars;
		
		unset($order['promotion']);
		unset($order['gift']);
		unset($order['loyaltyCards']);
		unset($order['loyalty']);
		unset($order['giftCards']);
		unset($order['packages']);
		unset($order['sales']);
		unset($order['products']);
		unset($order['productsLog']);

		return $order;
	}

	public function processAdvanceOrder($orderIds){

		/*if(){
			
		}*/

	}

	public function placed(){

		$order = $this->toArray();
		$user = User::find($order['user']);

		$order = $this->formatorder($order);

		$view = View::make('emails.order', $order);

		$contents = $view->render();
		prd($contents);
		$email = new Email('orderconfirm');

		$data = [
			'name' => (isset($user->name) && !empty($user->name))?$user->name:$user->email,
			'email' => $user->email,
			'order_number' => $order['reference'],
			'order_detail' => $contents
		];

		$emailSent = $email->sendEmail($data);

	}

}
