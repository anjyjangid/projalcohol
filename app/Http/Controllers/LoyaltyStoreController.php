<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Products;
use AlcoholDelivery\GiftCategory;


use DateTime;
use DB;

class LoyaltyStoreController extends Controller
{

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function getCredits(Request $request){
		
		try{

			$cards = DB::collection('giftcategories')->raw(function($collection){

			return $collection->aggregate(array(
				[
					'$match' => [
						'type' => ['$ne'=>'category']
					]
				],
				[
					'$unwind' => '$cards'
				],
				[
					'$sort' => ['cards.loyalty'=> -1]
				],
				[
					'$match' => [
									'cards.loyalty' => ['$gt'=>0]
							]
				],
				[
					'$project' => [
									'_id' => 0,
									'value' => '$cards.value',
									'loyalty' => '$cards.loyalty'
								]
				]

			));
		});

			return response($cards['result'],200);

		}catch(Exception $e){

			return response(["success"=>false,"message"=>$e->getMessage()],400);

		}
				
	}
	
	
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request)
	{		
		$params = $request->all();

		$productObj = new Products;

		$result = $productObj->fetchProducts($params);
		
		if($result['success']===true){
			return response($result['products'],200);
		}

		return response($result,422);


		

		$products = new Products;

		$products = $products->where('status',1);

		if(isset($keyword) && trim($keyword)!=''){
			$products = $products->where('name','regexp', "/.*$keyword/i");
		}

		if(isset($loyalty) && $loyalty){
			$products = $products->where('isLoyalty',1);
		}

		if(isset($filter) && trim($filter)!=''){

			switch ($filter) {
				case 'new':
					$products = $products->where('created_at', '>', new DateTime('-1 months'));
					break;
				case 'in-stock':
					$products = $products->where('quantity','>',0);
					break;
				default:
					# code...
					break;
			}
		}

		if(isset($sortby) && trim($sortby)!=''){
			$products = $products->orderBy('price', $sortby);
		}else{
			$products = $products->orderBy('created_at','desc');
		}

		$totalItem = $products->count();
		
		$fields = [
					'availabilityDays','availabilityTime','categories','chilled',
					'deliveryType','description','imageFiles','isLoyalty','loyalty','loyaltyType',
					'loyaltyValueType','loyaltyValuePoint','loyaltyValuePrice',
					'metaDescription','metaKeywords','metaTitle','name',
					'outOfStockType','price','quantity','shortDescription','slug'
				];

		$products = $products->skip($skip)->take($take)->get($fields);
		
		$response = [
			'items' => $products,
			'total' => $totalItem,
		];

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
		//
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
}
