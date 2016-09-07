<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Controllers\Controller;

use AlcoholDelivery\Products as Products;
use AlcoholDelivery\User as User;

use MongoDate;
use MongoId;
use DB;

class WishlistController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{

		$response = ['success'=>false,"message"=>"","auth"=>false];

		$loggeduser = Auth::user('user');

		if(!$loggeduser){

			$response['message'] = "Login Required";			
			return response($response,200);

		}

		$user = User::find($loggeduser->_id);

		$response['auth'] = true;

		if(empty($user->wishlist)){
			
			$user->wishlist = [];

		}	

		$productObj = new Products;


		$productIds = [];
		$wishData = [];

		foreach ($user->wishlist as $key => $value) {
			$productIds[(string)$value["_id"]] = $value['added_at'];
			$wishData[(string)$value["_id"]] = $value;
		}
		

		$products = $productObj->getProducts(
									array(
										"id"=>array_keys($productIds),
										"with"=>array(
											"discounts"
										)
										
									)
								);	

		if(empty($products)){

			$response['message'] = "Product not found";
			return response($response,400);

		}

		foreach ($products as $key => &$value) {
			$value['wishlist'] = [
				'_id'=>$value['_id'],
				'added_at'=>$productIds[$value['_id']],
				'notify'=>$wishData[$value['_id']]['notify'],
				'added_slug'=>date("F d, Y",strtotime($productIds[$value['_id']]))
			];
		}

		$response['success'] = true;
		$response['message'] = "success";
		$response['list'] = $products;

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
	public function store(Request $request)
	{
		$params = $request->all();
		$id = $params['id'];
		$response = ['success'=>false,"message"=>"","auth"=>false];

		$loggeduser = Auth::user('user');
		
		if(!$loggeduser){
			$response['message'] = "Login Required";			
			return response($response,400);
		}				

		$response['auth'] = true;

		//CHECK FOR THE PRODUCT
		$productObj = new Products;
		$product = $productObj->getProducts(
									array(
										"id"=>$id,
										"with"=>array(
											"discounts"
										)
									)
								);

		if(empty($product)){
			$response['message'] = "Product not found";
			return response($response,400);
		}

		$response['product'] = array_pop($product);							

		$query = [];
		$query[]['$match'] = ['_id' => new MongoId($loggeduser->_id)];
		$query[]['$project'] = [
			'mywish' => [
				'$cond' => [
					'$wishlist',
					[
						'$filter'=>[
	                		'input' => '$wishlist',
	                		'as' => 'wishlist',
	                		'cond' => ['$eq'=>['$$wishlist._id',new MongoId($id)]]
            			]
            		],
            		null	            		
				]
			]
		];	
		$query[]['$unwind'] = ['path' => '$mywish','preserveNullAndEmptyArrays' => true];       
		$model = DB::collection('user')->raw()->aggregate($query);

		if(isset($model['result']) && !empty($model['result'])){
			$exist = $model['result'][0];
			$wish = [];
			//WISH EXIST AND TOGGLE THE NOTIFICATION FIELD
			if(isset($exist['mywish']) && $exist['mywish']!=null){
				$wish = $exist['mywish'];				
				$notify = ($wish['notify']==1)?0:1;
				$wish['notify'] = $notify;
				$update = DB::collection('user')->raw()->update(
					[
						'_id' => new MongoId($loggeduser->_id),
						'wishlist._id'=>new MongoId($id)
					],
					[
						'$set' => [						
							'wishlist.$.notify' => $notify
						]
					]	
				);
				
				$response['message'] = ($notify==1)?"On sale notification enabled":"On sale notification disabled";

			}else{
				$notify = 0;
				$response['message'] = "Added to wishlist";
				if(isset($params['addInSale']) && $params['addInSale']==1){
					$notify = 1;
					$response['message'] .= ' & notification enabled';
				}
				$date = date('Y-m-d H:i:s');
				$wish = [				
					'_id' => new MongoId($id),
					'added_at' => $date,					
					'notify' => $notify,				
				];
				$update = DB::collection('user')
				->where('_id', $loggeduser->_id)
				->push('wishlist',$wish,true);
			}

			$wish['added_slug'] = date("F d, Y",strtotime($wish['added_at']));

			$response['product']['wishlist'] = $wish;
			$response['success'] = true;
			
			return response($response,200);
		}		
		
		return response($response,400);

	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show($id)
	{
		//
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
		//
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($id)
	{
							
		$response = ['success'=>false,"message"=>""];

		$loggeduser = Auth::user('user');
		
		if(!$loggeduser){

			$response['message'] = "Login Required";			
			return response($response,400);

		}	
		
		try {

			$isRemoved = DB::collection('user')->where('_id', $loggeduser->_id)->pull('wishlist', ['_id' => new MongoId($id)]);				

			$response['success'] = true;
			$response['message'] = "Removed from wishlist";

			return response($response,200);
						
		} catch(\Exception $e){

			$response['message'] = $e->getMessage();

		}
		
		return response($response,400);

	
	}
}
