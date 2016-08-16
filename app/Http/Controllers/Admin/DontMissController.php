<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\DontMissRequest;
use AlcoholDelivery\Http\Controllers\Controller;

use AlcoholDelivery\Dontmiss;

use MongoId;

class DontMissController extends Controller
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
	public function index()
	{

		$result = Dontmiss::first(['quantity','products']);

		return response($result, 200);
		
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
	public function store(DontMissRequest $request)
	{

		$inputs = $request->all();
		

		$dontmiss = Dontmiss::first();

		if(is_array($dontmiss)){

			$dontmiss->delete();

		}

		try {

			Dontmiss::create($inputs);

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()),400);

		}
		
		return response(array("success"=>true,"message"=>"Dontmiss updated successfully"),200);
		
		
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show()
	{

		$result = Dontmiss::first();

		return response($result, 201);

	}	

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function update(PromotionRequest $request, $id)
	{   

		$promotion = Promotion::find($id);

		if(is_null($promotion)){

			return response(array("success"=>false,"message"=>"Invalid Request :: Record you want to update is not exist"));

		}

		$inputs = $request->all();            

		$products = $inputs['products'];

		$inputs['items'] = [];
		$inputs['products'] = [];

		foreach($products as $product){
			
			array_push($inputs['products'], $product['_id']);

			$inputs['items'][] = [
									'_id' => new MongoId($product['_id']),
									'type'=> (int)$product['type'],
									'price' => isset($product['dprice'])?(float)$product['dprice']:null
								];
		}

		$promotion->title = $inputs['title'];
		$promotion->status = (int)$inputs['status'];
		$promotion->count = count($inputs['items']);
		$promotion->items = $inputs['items'];
		$promotion->products = $inputs['products'];
		$promotion->price = (int)$inputs['price'];

		try {

			$promotion->save();

		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()),400);

		}
		
		return response(array("success"=>true,"message"=>"Promotion $promotion->title Updated successfully"));

	}

	

	


}
