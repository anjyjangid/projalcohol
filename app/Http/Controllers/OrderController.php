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
		$this->middleware('auth');
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
						'rate'=>1
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


}