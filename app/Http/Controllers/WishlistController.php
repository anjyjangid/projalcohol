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
			return response($response,401);

		}

		$user = User::find($loggeduser->_id);

		$response['auth'] = true;

		if(empty($user->wishlist)){
			
			$user->wishlist = [];

		}	

		$productObj = new Products;


		$productIds = [];

		foreach ($user->wishlist as $key => $value) {
			$productIds[(string)$value["_id"]] = $value['added_at'];
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
				'added_at'=>$productIds[$value['_id']],
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

		$user = User::find($loggeduser->_id);

		$response['auth'] = true;

		if(empty($user->wishlist) || !is_array($user->wishlist)){
			
			$user->wishlist = [];

		}else{

			$isAlreadyAdded = in_array(new MongoId($id), array_column($user->wishlist, '_id'));

			if($isAlreadyAdded){

				$response['message'] = "Already added to wishlist";
				return response($response,400);

			}
		}

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

		$wishlist = $user->wishlist;
			
		$newWish = [
						"_id"=>new MongoId($id),
						"added_at"=> date("Y-m-d H:i:s")
					];

		$user->wishlist = array_merge($wishlist, [$newWish]);

		$response['product']['wishlist'] = [
				'added_at'=>$newWish["added_at"],
				'added_slug'=>date("F d, Y",strtotime($newWish["added_at"]))
			];


		try {

			$user->save();

			$response['success'] = true;
			$response['message'] = "Added to wishlist";

			return response($response,200);
						
		} catch(\Exception $e){
			$return['message'] = $e->getMessage();//$e->getMessage();
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
