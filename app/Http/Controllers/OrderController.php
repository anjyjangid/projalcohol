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
use DB;

class OrderController extends Controller
{

	public function __construct()
	{
		$this->middleware('auth',['except' => 'getOrderdetail']);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */

	public function show($id)
	{

		$user = Auth::user('user');

		$order = Orders::where("_id","=",new MongoId($id))->where("user",'=',new MongoId($user->_id))->first();

		if(!empty($order)){

			$order = $order->toArray();

			$order['dateslug'] = date("F d, Y H:i:s",strtotime($order['created_at']));
			$order['status'] = 0;
			$order['timeslot']['dateslug'] = date("F d, Y",$order['timeslot']['datekey']);

			return response($order,200);

		}

		return response(['success'=>false,"message"=>"Order not found"],400);

	}

	public function update(Request $request,$id)
	{
		$params = $request->all();
		// jprd($params);
		$user = Auth::user('user');

		if(isset($params['rate'])){
			Orders::raw()->update(['_id'=> new MongoId($id), 'user' => new MongoId($user->_id), '$or'=>[['rate'=>null], ['rate'=>['lt'=>1]]]],
				['$set'=>['rate'=>$params['rate']]]);
			$resp = Orders::raw()->findOne(['_id'=> new MongoId($id)], ['rate'=>1]);

			return response($resp['rate'], 200);
		}
	}

	public function getSummary(Request $request,$id)
	{

		$user = Auth::user('user');

		$order = Orders::where("_id",$id)->where("user",'=',new MongoId($user->_id))->first();

		if(empty($order)){
			return response(["message"=>"Order not found"],400);
		}

		$order->dop = strtotime($order->created_at);

		return response($order,200);
	}

	public function getOrders(){

		$user = Auth::user('user');

		$orders = DB::collection('orders')->raw(function($collection) use($user){
			return $collection->aggregate(array(
				array(
					'$match'=> array('user'=> new MongoId($user->_id))
				),
				/*array(
					'$limit' => 10
				),*/
				array(
					'$skip' => 0
				),
				array(
					'$project' => array(
						'_id'=>1,
						'reference'=>1,
						'service'=>1,
						'delivery.type'=>1,
						'nonchilled'=>1,
						'total'=>1,
						'quantity' => array(
							'$size' => '$products'
						),
						'created_at'=>1,
						'timeslot'=>1,
						'rate'=>1,
						//'productsLog' => 1,
						'quantity' => array(
							'$sum' => '$productsLog.quantity'
						),
					),
				),
				array(
					'$sort' => array('created_at'=> -1)
				)
			));
		});

		return response($orders['result'],200);
	}

	public function getTorepeat($id){

	}

	public function getOrderdetail(Request $request,$reference){

		$order = Orders::where('reference','=',$reference)->first();		


		//return response($order);
		//$logupdate = [];

		/*foreach ($order['productsLog'] as $key => $value) {
			$products = Products::find($value['_id']);			
			$logupdate[$key] = $value;
			$logupdate[$key]['name'] = $products['name'];
			$logupdate[$key]['slug'] = $products['slug'];
			$logupdate[$key]['description'] = $products['description'];
			$logupdate[$key]['shortDescription'] = $products['shortDescription'];
			$logupdate[$key]['sku'] = $products['sku'];
			$logupdate[$key]['chilled'] = $products['chilled'];
		}

		$order->productsLog = $logupdate;

		$order->save();*/		

		if($order){

			
			try{

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
								'description' => $product['description'],
								'shortDescription' => $product['shortDescription'],
								'sku' => $product['sku'],
								'chilled' => true,
								'quantity' => $value['quantity']['chilled'],
								'unitPrice' => $value['unitprice'],
								'total' => $value['quantity']['chilled']*$value['unitprice'],
								'products' => []
							];
						}

						//HAS NON-CHILLED 
						if(isset($value['quantity']['nonChilled']) && $value['quantity']['nonChilled']>0){							
							$particulars[] = [
								'_id' => $value['_id'],
								'name' => $product['name'],
								'slug' => $product['slug'],
								'description' => $product['description'],
								'shortDescription' => $product['shortDescription'],
								'sku' => $product['sku'],
								'chilled' => false,
								'quantity' => $value['quantity']['nonChilled'],
								'unitPrice' => $value['unitprice'],
								'total' => $value['quantity']['nonChilled']*$value['unitprice'],
								'products' => []
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
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'sku' => $product['sku'],
							'chilled' => $chillstatus,
							'quantity' => $pvalue['quantity'],							
						];
					}
					
					$particulars[] = [
						'_id' => $value['_id'],
						'name' => $value['sale']['title'],
						'detailTitle' => $value['sale']['detailTitle'],
						'slug' => '',
						'description' => '',
						'shortDescription' => '',
						'sku' => '',
						'chilled' => $value['chilled'],
						'quantity' => '',
						'unitPrice' => '',
						'total' => $value['price']['sale'],
						'products' => $saleProduct
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
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'sku' => $product['sku'],
							'chilled' => $product['chilled'],
							'quantity' => $pvalue['quantity'],							
						];
					}
					$particulars[] = [
						'_id' => $value['_id'],
						'name' => $value['title'],
						'slug' => '',
						'description' => $value['description'],
						'shortDescription' => $value['subTitle'],
						'sku' => '',
						'chilled' => false,
						'coverImage' => $value['coverImage'],
						'quantity' => $value['packageQuantity'],
						'unitPrice' => $value['packagePrice'],
						'total' => $value['price'],
						'products' => $packageProduct
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
						'description' => $value['description'],
						'shortDescription' => $value['subTitle'],
						'chilled' => false,
						'quantity' => $value['quantity'],
						'unitPrice' => $value['price']/$value['quantity'],
						'total' => $value['price'],
						'recipient' => $value['recipient']						
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
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'chilled' => true,
							'quantity' => $value['quantity']['chilled'],
							'unitPrice' => $value['price']['amount'],
							'total' => $value['price']['amount']*$value['quantity']['chilled'],
							'unitLoyalty' => $value['price']['points'],
							'totalLoyalty' => $value['price']['points']*$value['quantity']['chilled']
						];						
					}
					if($value['quantity']['nonChilled']>0){
						$particulars[] = [
							'_id' => $product['_id'],
							'name' => $product['name'],
							'slug' => '',
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'chilled' => false,
							'quantity' => $value['quantity']['nonChilled'],
							'unitPrice' => $value['price']['amount'],
							'total' => $value['price']['amount']*$value['quantity']['nonChilled'],
							'unitLoyalty' => $value['price']['points'],
							'totalLoyalty' => $value['price']['points']*$value['quantity']['nonChilled']
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
						'description' => '',
						'shortDescription' => '',
						'chilled' => false,
						'quantity' => $value['quantity'],
						'unitPrice' => '',
						'total' => '',
						'unitLoyalty' => $value['points'],
						'totalLoyalty' => $value['points']*$value['quantity']
					];				
				}				
			}	

			//GIFT PACAGING
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
								'description' => $product['description'],
								'shortDescription' => $product['shortDescription'],
								'sku' => $product['sku'],
								'chilled' => false,
								'quantity' => $cpvalue['quantity']								
							];
						}

						$particulars[] = [
							'_id' => $containervalue['_id'],
							'name' => $containervalue['title'],
							'slug' => '',
							'description' => $containervalue['description'],
							'shortDescription' => $containervalue['subTitle'],
							'chilled' => false,
							'quantity' => 1,
							'unitPrice' => $containervalue['price'],							
							'total' => $containervalue['price'],
							'products' => $giftpackage
						];
					
				}
			}		

			//PROMOTIONS 
			
			if(isset($order['promotion']) && !empty($order['promotion'])){
				foreach ($order['promotion'] as $promotionkey => $promotionvalue) {

					if(isset($promotionvalue['product'])){
						$productId = (string)$promotionvalue['product'];
						$product = $productInfo[$productId];

						$promotionalProduct[] = [
							'_id' => $product['_id'],
							'name' => $product['name'],
							'slug' => $product['slug'],
							'description' => $product['description'],
							'shortDescription' => $product['shortDescription'],
							'sku' => $product['sku'],
							'chilled' => false,
							'quantity' => 1						
						];

						$particulars[] = [
							'_id' => '',
							'name' => $promotionvalue['title'],
							'slug' => '',
							'description' => '',
							'shortDescription' => '',
							'chilled' => false,
							'quantity' => 1,
							'unitPrice' => $promotionvalue['price'],							
							'total' => $promotionvalue['price'],
							'products' => $promotionalProduct
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

		}catch(\Exception $e){
			return view('invoice.404',['id'=>$reference,'error' => $e->getMessage()]);
		}
			//return response($order);

			//UNSET ALL THE ARRAY OF ITEMS



			return view('invoice.pos',['order'=>$order]);
			
		}else{

			return view('invoice.404',['id'=>$reference]);

		}
	}

	
}