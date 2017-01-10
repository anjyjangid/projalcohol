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
use AlcoholDelivery\ErrorLog;

class OrderController extends Controller
{

	public function __construct()
	{
		$this->middleware('auth',['except' => ['getOrderdetail','getMailOrderPlaced']]);
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

		if(MongoId::isValid($id)){
			$order = Orders::where("_id","=",new MongoId($id));
		}else{
			$order = Orders::where("reference","=",$id);
		}

		$order = $order->where("user",'=',new MongoId($user->_id))->first();

		if(!empty($order)){

			$orderArray = $order->toArray();

			$order = $order->formatorder($orderArray);

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

	public function getOrders(Request $request){

		$user = Auth::user('user');
		$userId = $user->_id;

		$params = $request->all();
		
		$limit = isset($params['limit'])?(int)$params['limit']:10;

		$offset = (int)$params['start'] * $limit;

		try{

			$count = DB::collection('orders')->where('user', new MongoId($userId))->count();

			$loyalty = DB::collection('loyaltyTransactions')->where('user', new MongoId($userId))->orderBy('_id','desc')->skip($offset)->take($limit)->get();

			$orders = DB::collection('orders')->raw(function($collection) use($user,$limit,$offset){
					return $collection->aggregate(array(
						array(
							'$match'=> array(
								'user'=> new MongoId($user->_id),
								// 'products' => array('$exists'=>true),
								// 'products' => array('$ne'=>null)
							)
						),
						array(
							'$sort' => array('created_at'=> -1)
						),
						array(
							'$skip' => $offset
						),
						array(
							'$limit' => $limit
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
								'doStatus' => 1
							),
						)
						
					));
				});

			return response([
					
					'orders'=>$orders['result'],					
					'count'=>$count

				],200);

		}catch(\Exception $e){

			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Show orders'
				]);
		}

		return response(['message'=>'Something went wrong'],400);
	
	}

	public function getToRepeat(){

		$user = Auth::user('user');

		$orders = DB::collection('orders')->raw(function($collection) use($user){
			return $collection->aggregate(array(
				array(
					'$match'=> array(
						'user'=> new MongoId($user->_id),
						'products' => array('$exists'=>true),
						'products' => array('$ne'=>null)
					)
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

	public function getOrderdetail(Request $request,$reference){

		//return strtotime('now').' = '.(round(microtime(true) * 1000));

		$order = Orders::where('reference','=',$reference)->first();		
		
		if(!$order)
			$order = Orders::find($reference);


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
				$order = $order->formatorder($order);
			}catch(\Exception $e){
				return view('invoice.404',['id'=>$reference,'error' => $e->getMessage()]);
			}
			
			//return response($order);
			
			return view('invoice.pos',['order'=>$order]);
			
		}else{

			return view('invoice.404',['id'=>$reference]);

		}
	}

	public function getMailOrderPlaced($order = false){
		
		$order = Orders::where("reference",'=',$order)->first();
		$order->placed();
		prd("order placed");

	}

	
}
