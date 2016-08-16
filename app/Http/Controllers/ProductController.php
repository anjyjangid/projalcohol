<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Products as Products;

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


		if(isset($params['sort']) && !empty($params['sort'])){


			$sortArr = explode("_", $params['sort']);                    
			$sort = array_pop($sortArr);
			$sortDir = $sort=='asc'?$sort:'desc';
			$sort = array_pop($sortArr);

			if($sort=='price'){
				$products = $products->orderBy($sort, $sortDir);
			}
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

	public function getproductdetail(Request $request){
		
		$params = $request->all();

		$product = Products::where("slug","=",$params['product'])->first();

		if(!empty($product)){
			return response($product,200);
		}

		return response(['message'=>'Product not found'],404);

	}

	public function getAlsobought(Request $request, $productSlug){		

		$product = Products::where("slug","=",$productSlug)->first(['alsoBought']);

$product->alsoBought = "asd";
prd(empty($product->alsoBought));

		if(!empty($product->alsoBought) && is_array($product->alsoBought)){
			
		}

		if(!empty($product)){
			return response($product,200);
		}

		$products = DB::collection('giftcategories')->raw(function($collection){

			return $collection->aggregate(array(
				
				[
					'$match' => [
						'products._id' => $product->_id
					]
				],
				[
					'$unwind' => '$products'
				],
				[
					'$match' => [
						'products._id' => [
							'$nin' => [
								$product->_id,
								['array fetch from cart']
							]							
						]
					]
				],
				[
					'$group' => [
						'_id' => '$products._id'
					]
				],
				[
					'$limit' => 5
				],
				[
					'$project' => [
						'_id' => 1
					]
				]
			));
		});

		// db.test.aggregate([

		// 	{ $match : { "products._id":ObjectId("57038728c31d53b2218b45d4") } },
		// 	{ $unwind : "$products" },
		// 	{ $match : { products : { 

		// 			$nin: [
		// 					ObjectId("57034c8dc31d53b2218b45c2"),
		// 					ObjectId("57038728c31d53b2218b45d4")
		// 				]

		// 	}  } },
		// 	{ $group: { _id: "$products._id" } },
		// 	{ $limit : 5 },
		// 	{ $project: { _id: 1 } }

		// ]).pretty()

		prd($products);

		return response(['message'=>'Product not found'],404);
	}

}
