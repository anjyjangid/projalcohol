<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use AlcoholDelivery\Dontmiss;
use AlcoholDelivery\Cart;
use DB;

class SuggestionController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function getDontmiss(Request $request)
	{

		$cartKey = $request->session()->get('deliverykey');
		
		$cart = Cart::findUpdated($cartKey);
		$productWithCount = $cart->getProductIncartCount();
		$proInCartIds = array_keys($productWithCount);		

		$quantity = Dontmiss::first(['quantity']);
		$quantity = $quantity->quantity;

		$result = DB::collection('dontmiss')->raw(function($collection) use($quantity,$proInCartIds)
			{
					return $collection->aggregate([
							[
								'$unwind' => '$products'
							],
							[
								'$match' => [
									'products.$id' => [
										'$nin' => $proInCartIds
									]
								]
							],
							// [
							// 	'$lookup' => [

							// 		'from'=>'products',
							// 		'localField'=>'products',
							// 		'foreignField'=>'_id',
							// 		'as'=>'dontMiss'

							// 	]
							// ],
							// [
							// 	'$unwind' => '$dontMiss'
							// ],

							// [
							// 	'$match' => [
							// 		'dontMiss.status' => 1									
							// 	]
							// ],
							// [
							// 	'$sample' => [
							// 		'size' => $quantity
							// 	] 
							// ],

							// [
							// 	'$group' => [
							// 		'_id' => '$_id',									
							// 		'dontMiss' => [
							// 			'$push' => '$dontMiss'
							// 		]
							// 	]
							// ],
							// [
							// 	'$project' => [	
									
							// 		'dontMiss._id' => 1,
									
							// 	]
							// ]

							
					]);
			});

		if($result['ok']==1){
			//$result = array_pop($result['result']);
			return response($result, 200);
		}else{
			return response($result, 400);
		}
	}

}
