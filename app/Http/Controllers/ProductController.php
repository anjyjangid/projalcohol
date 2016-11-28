<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Products as Products;
use AlcoholDelivery\Cart;
use DB;
use DateTime;
use mongoId;


class ProductController extends Controller
{    
	/***************************************
	 * Display a listing of the resource.
	 * 
	 * @return \Illuminate\Http\Response
	***************************************/

	public function getproduct(Request $request){

		

		$params = $request->all();
		
		$products = new Products;

		$columns = array('_id',"categories","chilled","description","discountPrice","imageFiles","name","slug","price","shortDescription","sku","quantity","regular_express_delivery","express_delivery","advance_order","express_delivery_bulk","advance_order_bulk","outOfStockType","maxQuantity","availabilityDays","availabilityTime");

		$products = $products->where('status', 1);

		if(isset($params['type'])){

			if($params['type']=="featured"){
				$products = $products->where('isFeatured', 1);
			}

			if($params['type']=="new"){
				$products = $products->where('created_at', '>', new DateTime('-1 months'));
			}

			if($params['type']=="in-stock"){
				$products = $products->where('quantity', '>', 0);
			}

		}


		$products = $products->where('status', 1);

		if(isset($params['category']) && !empty($params['category'])){

			$category = Categories::raw()->findOne(['slug' => $params['category']]);

			if(empty($category)){
				return response(['message'=>'Category not found'],404);
			}

			$catKey = (string)$category['_id'];

			$products = $products->where('categories', 'all', [$catKey]);

		}

		$sort = 'created_at';
		$sortDir = 'desc';

		if(isset($params['sort']) && !empty($params['sort'])){
			$sortArr = explode("_", $params['sort']);                    
			$sort = array_pop($sortArr);
			$sortDir = $sort=='asc'?$sort:'desc';
			$sort = array_pop($sortArr);			
		}

		if($sort=='price' || $sort=='created_at'){			
			$products = $products->orderBy($sort, $sortDir);
		}

		if(isset($params['limit']) && !empty($params['limit'])){

			if(isset($params['offset']) && !empty($params['offset'])){
				$products = $products->skip($params['offset']);
			}

			$products = $products->take($params['limit']);
			
		}

		$products = $products->get($columns);

		return response($products,200);

	}


	// public function fetchProduct(Request $request){

	// 	$params = $request->all();
		
	// 	$products = new Products;

	// 	$columns = array("categories","chilled","description","discountPrice","imageFiles","name","slug","price","shortDescription","sku","quantity","regular_express_delivery","express_delivery","express_delivery_bulk","outOfStockType","availabilityDays","availabilityTime");

	// 	$products = $products->where('status', 1);

	// 	if(isset($params['filter'])){

	// 		if($params['filter']=="featured"){
	// 			$products = $products->where('isFeatured', 1);
	// 		}

	// 		if($params['filter']=="new"){
	// 			$products = $products->where('created_at', '>', new DateTime('-1 months'));
	// 		}

	// 		if($params['filter']=="in-stock"){
	// 			$products = $products->where('quantity', '>', 0);
	// 		}

	// 	}


	// 	$products = $products->where('status', 1);

	// 	if(isset($params['parent']) && !empty($params['parent'])){

	// 		$category = Categories::raw()->findOne(['slug' => $params['parent']]);

	// 		if(empty($category)){
	// 			return response(['message'=>'Category not found'],404);
	// 		}

	// 		$catKey = (string)$category['_id'];

	// 		$products = $products->where('categories', 'all', [$catKey]);

	// 	}


	// 	if(isset($params['sort']) && !empty($params['sort'])){


	// 		$sortArr = explode("_", $params['sort']);                    
	// 		$sort = array_pop($sortArr);
	// 		$sortDir = $sort=='asc'?$sort:'desc';
	// 		$sort = array_pop($sortArr);

	// 		if($sort=='price'){
	// 			$products = $products->orderBy($sort, $sortDir);
	// 		}
	// 	}


	// 	if(isset($params['limit']) && !empty($params['limit'])){

	// 		if(isset($params['skip']) && !empty($params['skip'])){
	// 			$products = $products->skip($params['skip']);
	// 		}

	// 		$products = $products->take($params['limit']);

	// 	}

	// 	$products = $products->get($columns);

	// 	return response($products,200);

	// }

	/***************************************
	 * Display a listing of the resource.
	 * 
	 * @return \Illuminate\Http\Response
	***************************************/

	public function fetchProducts(Request $request){

		
		$params = $request->all();

		$product = new Products;

		$result = $product->fetchProducts($params);

		if($result['success']===true){
			return response($result['products'],200);
		}

		return response(["message"=>$result],422);

	}

	public function getproductdetail(Request $request){
		
		$params = $request->all();

		$productObj = new Products;

		$product = $productObj->fetchProducts($params);

		// $product = Products::where("slug","=",$params['product'])->first();

		if(!empty($product['products'])){
			return response($product['products'][0],200);
		}

		return response(['message'=>'Product not found'],404);

	}

	public function getAlsobought(Request $request, $productSlug){		
		
		$response = [
			'message'=>'',			
		];

		$cartKey = $request->session()->get('deliverykey');
		
		$cart = Cart::findUpdated($cartKey);
		$productWithCount = $cart->getProductIncartCount();
		$proInCartIds = array_keys($productWithCount);

		foreach ($proInCartIds as $key => &$value) {
			$value = new mongoId($value);
		}

		$product = Products::where("slug",'=',$productSlug)->first();

		$suggestions = DB::collection("products")->raw(function($collection) use($productSlug,$proInCartIds){

			return $collection->aggregate([
					[
						'$match' => [
							"slug" => $productSlug
						]
					],
					[
						'$project' => [
							'suggestions'=> '$suggestionObjectId'
						]
					],
					[
						'$unwind' => '$suggestions'
					],
					[
						'$match' => [
							'suggestions' => [
								'$nin' => $proInCartIds
							]
						]
					],
					[
						'$sample' => [
							'size' => 5
						] 
					],
					[
						'$lookup' => [

							'from'=>'products',
							'localField'=>'suggestions',
							'foreignField'=>'_id',
							'as'=>'product'

						]
					],
					[
						'$project' => [
							"product" => [ 
								'$arrayElemAt' => [ '$product', 0 ] 
							]
						]
					],
					[
						'$group' => [
							'_id' => '$_id',
							'products' => [
								'$push' => '$product'
							],
							'productIds' => [
								'$push' => '$product._id'
							]
						]
					]

				]);
		});

		$suggestionPros = [];
		$suggestionProsIds = [];
		$suggestionsLength = 0;
		
		if(!empty($suggestions['result'])){
			$suggestionPros = $suggestions['result'][0]['products'];
			$suggestionProsIds = $suggestions['result'][0]['productIds'];
			$suggestionsLength = count($suggestionPros);
		}
		
		// if($suggestionsLength>4){
		// 	$response['products'] = $suggestionPros;
		// 	return response($response,200);
		// }


		// further process if required quantity is not fullfilled

		array_push($proInCartIds, new mongoId($product->_id));
		$proInCartIds = array_merge($proInCartIds,$suggestionProsIds);

		$requiredLimit = 6 - $suggestionsLength;

		$products = DB::collection('orders')->raw(function($collection) use($product,$proInCartIds,$requiredLimit){

			return $collection->aggregate(array(
				[
					'$match' => [
						'productsLog._id' => new mongoId($product->_id)
					]
				],
				[
					'$project' => [
						'productsLog._id' => 1
					]
				],
				[
					'$unwind' => '$productsLog'
				],
				[
					'$match' => [
						'productsLog._id' => [
							'$nin' => $proInCartIds
						]
					]
				],
				[
					'$sample' => [
						'size' => 5
					]
				],
				[
					'$limit' => abs($requiredLimit)
				],
				[
					'$lookup' => [

						'from'=>'products',
						'localField'=>'productsLog._id',
						'foreignField'=>'_id',
						'as'=>'product'

					]
				],				
				[
					'$project' => [
						"product" => [ 
							'$arrayElemAt' => [ '$product', 0 ] 
						]
					]
				],
				
				[
					'$group' => [
						'_id' => '$_id',
						'products' => [
							'$push' => '$product'
						]
					]
				],
				
			));
		});

		if(!empty($products['result'])){

			$products = $products['result'][0]['products'];
			$suggestionPros = array_merge($suggestionPros,$products);

		}
		

		$response['products'] = $suggestionPros;
		return response($response,200);
				
	}

}
