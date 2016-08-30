<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Setting as Setting;
use DB;
use mongoId;

class Products extends Eloquent
{
	protected $primaryKey = "_id";
	protected $collection = 'products';

	protected $fillable = [
			'name',
			'slug',
			'description',
			'shortDescription',
			'categories',
			'categoriesObj',
			'sku',
			'quantity',
			'price',            
			'chilled',
			'status',
			'metaTitle',
			'metaKeywords',
			'metaDescription',
			'images',
			'isFeatured',
			'bulkDisable',			
			'regular_express_delivery',			
			'express_delivery_bulk',
			'loyalty',
			'isLoyalty',
            'loyaltyType',

            'loyaltyValueType',
            'loyaltyValuePoint',
            'loyaltyValuePrice',

			'threshold',
			'maxQuantity',
			'dealers',
			'packages',
			'outOfStockType',
			'availabilityDays',
			'availabilityTime',
			'deliveryType',
			'suggestions'

			
	];

	public function pcategories()
	{        
		//return $this->belongsToMany('AlcoholDelivery\Categories', null, 'products', 'categories');
	}

	public function supplier()
	{        
		return $this->belongsToMany('AlcoholDelivery\Dealer', null, 'products', 'dealers');
	}

	public function getSingleProduct($id)
	{

		return Products::where('_id', $id)->first();		

		// DUE : Code to get suggestion (22-AUG-2016)
		// $product = DB::collection("products")->raw(function($collection) use($id){

		// 				return $collection->aggregate([
		// 					[
		// 						'$match' => [
		// 							'_id' => new mongoId($id)
		// 						]
		// 					],
		// 					[
		// 						'$unwind' => [
		// 							'path' =>  '$suggestions',
		// 							"preserveNullAndEmptyArrays" => true

		// 						]
		// 					],
		// 					[
		// 						'$lookup' => [
		// 							'from'=>'products',
		// 							'localField'=>'suggestions',
		// 							'foreignField'=>'_id',
		// 							'as'=>'suggestions'
		// 						]
		// 					],							
		// 					[
		// 						'$group' => [
		// 							'_id' => '$_id',
		// 							'suggestions' => [
		// 								'$push' => '$suggestions'
		// 							],
									
		// 							'name' => [ '$first' => '$name'],
		// 							'slug' => [ '$first' => '$slug'],
		// 							'description' => [ '$first' => '$description'],
		// 							'shortDescription' => [ '$first' => '$shortDescription'],
		// 							'categories' => [ '$first' => '$categories'],
		// 							'sku' => [ '$first' => '$sku'],
		// 							'quantity' => [ '$first' => '$quantity'],
		// 							'price' => [ '$first' => '$price'],            
		// 							'chilled' => [ '$first' => '$chilled'],
		// 							'status' => [ '$first' => '$status'],
		// 							'metaTitle' => [ '$first' => '$metaTitle'],
		// 							'metaKeywords' => [ '$first' => '$metaKeywords'],
		// 							'metaDescription' => [ '$first' => '$metaDescription'],
		// 							'images' => [ '$first' => '$images'],
		// 							'isFeatured' => [ '$first' => '$isFeatured'],
		// 							'bulkDisable' => [ '$first' => '$bulkDisable'],			
		// 							'regular_express_delivery' => [ '$first' => '$regular_express_delivery'],			
		// 							'express_delivery_bulk' => [ '$first' => '$express_delivery_bulk'],
		// 							'loyalty' => [ '$first' => '$loyalty'],
		// 							'isLoyalty' => [ '$first' => '$isLoyalty'],
		// 							'loyaltyType' => [ '$first' => '$loyaltyType'],

		// 							'loyaltyValueType' => [ '$first' => '$loyaltyValueType'],
		// 							'loyaltyValuePoint' => [ '$first' => '$loyaltyValuePoint'],
		// 							'loyaltyValuePrice' => [ '$first' => '$loyaltyValuePrice'],

		// 							'threshold' => [ '$first' => '$threshold'],
		// 							'maxQuantity' => [ '$first' => '$maxQuantity'],
		// 							'dealers' => [ '$first' => '$dealers'],
		// 							'packages' => [ '$first' => '$packages'],
		// 							'outOfStockType' => [ '$first' => '$outOfStockType'],
		// 							'availabilityDays' => [ '$first' => '$availabilityDays'],
		// 							'availabilityTime' => [ '$first' => '$availabilityTime'],
		// 							'deliveryType' => [ '$first' => '$deliveryType'],
		// 							'quantity'=> [ '$first' => '$quantity' ],

									
		// 						]
		// 					],
		// 					// [
		// 					// 	'$project' => [
		// 					// 		"suggestions" => [ 
		// 					// 			'$arrayElemAt' => [ '$suggestions', 0 ] 
		// 					// 		]
		// 					// 	]
		// 					// ],
		// 				]);

		// 			});

		// jprd($product);

	}

	public function getProducts($params){

		if(isset($params['id']) and  $params['id']){

			$params['id'] = is_string($params['id'])?(array)$params['id']:$params['id'];

			$products = Products::whereIn('_id',$params['id']);

			$products = $products->where('status','=',1);

			$params['fields'] = isset($params['fields'])?$params['fields']:[];

			$products = $products->get($params['fields']);

			if(isset($params['with'])){

				foreach($params['with'] as $with){

					$this->getProductWith($with,$products);
				}
			}

			return $products;

		}

	}

	private function getProductWith($with,&$products){
		switch($with){
			case "discounts":
				
				$this->attachProductPricing($products);

			break;
		}
	}

	private function attachProductPricing(&$products){

		$categyIds = [];

		foreach($products as $product){

			$categyIds = array_merge($categyIds,$product['categories']);
		}

		$categories = Categories::whereIn("_id",$categyIds)->get(['_id', 'ancestors','regular_express_delivery','express_delivery_bulk']);

		//Fetch Global Pricing
		$globalPricing = Setting::where("_id",'=',"pricing")
									->first([
										'settings.regular_express_delivery',
										'settings.express_delivery_bulk',										
									]);
		$globalPricing = $globalPricing->settings;

		///////////////////////
		//conver categories object to array so can use for further processing
		$categories = $categories->toArray();
		///////////////////////


		////////////////////////
		//Set _id as array key//
		////////////////////////
		$categories = array_combine(array_column($categories, '_id'),$categories);


		foreach($categories as &$category){

			

			if(isset($category['ancestors'])){

				$anceskey = (string)$category['ancestors'][0]['_id'];

				if(isset($categories[$anceskey])){

					$parentCat = $categories[$anceskey];



					$category = array_merge($globalPricing,$parentCat,$category);


				}
				 

			}else{

				$category = array_merge($globalPricing,$category);

			}
		}

		$products = $products->toArray();

		foreach($products as &$product){			
			$tempCat = $categories[end($product['categories'])];
			unset($tempCat["_id"]);
			$product = array_merge($tempCat,$product);
		}
				
	}


	public function fetchProducts($params){

		$match = [
					'$match' => [
						// "categoriesObj" => [ '$exists' => true ],
						"status" => 1
					]
				];
		
		$sortParam = [
			'$sort' => [ 'created_at' => 1 ]
		];

		$skip = [
			'$skip' => 0
		];
		$limit = [
			'$limit' => 100
		];

		if(isset($params['type'])){

			if($params['type']==1){
				$match['$match']['isLoyalty'] = 1;
			}
			
		}

		if(isset($params['filter'])){

			if($params['filter']=="featured"){
				$match['$match']['isFeatured'] = 1;
			}

			if($params['filter']=="new"){
				$match['$match']['created_at'] = ['$gt'=> new DateTime('-1 months')];
			}

			if($params['filter']=="in-stock"){
				$match['$match']['quantity'] = ['$gt'=>0];
			}

		}

		if(isset($params['parent']) && !empty($params['parent'])){
			
			$category = Categories::raw()->findOne(['slug' => $params['parent']]);

			if(empty($category)){
				return response(['message'=>'Category not found'],404);
			}

			$catKey = (string)$category['_id'];

			$match['$match']['categories'] = $catKey;

		}

		if(isset($params['sort']) && !empty($params['sort'])){

			$sortParam = [
				'$sort' => []
			];

			$sortArr = explode("_", $params['sort']);                    
			$sort = array_pop($sortArr);
			$sortDir = $sort=='asc'?-1:1;
			$sort = array_pop($sortArr);

			$sortParam['$sort'][$sort] = (int)$sortDir;
			
		}


		if(isset($params['limit']) && !empty($params['limit'])){

			if(isset($params['skip']) && !empty($params['skip'])){
				$skip['$skip'] = (int)$params['skip'];
			}

			$limit['$limit'] = (int)$params['limit'];
			
		}

		$fields = [
			'$project' => [
							'chilled' => 1,
							'description' =>  1,
							'price' => [
								'$multiply' => [ '$price', 2.2 ]
							],
							'categories' => 1,							
							// 'discountPrice' => 1,
							'imageFiles' => 1,
							'name' => 1,
							'slug' => 1,
							'shortDescription' => 1,
							'sku' => 1,
							'quantity' => 1,
							'regular_express_delivery' => 1,
							'express_delivery' => 1,
							'express_delivery_bulk' => 1,
							'outOfStockType' => 1,
							// 'maxQuantity' => 1,
							'availabilityDays' => 1,
							'availabilityTime' => 1
						]
		];

		if(isset($params['type'])){

			if($params['type']==1){

				$fields = [
						'$project' => [
								'chilled' => 1,
								'description' =>  1,
								'loyaltyValueType' => 1,
								'loyaltyValuePoint' => 1,
								'loyaltyValuePrice' => 1,
								
								'imageFiles' => 1,
								'name' => 1,
								'slug' => 1,
								'shortDescription' => 1,
								'sku' => 1,
								'quantity' => 1,
								'deliveryType' => 1,
								'outOfStockType' => 1,
								'availabilityDays' => 1,
								'availabilityTime' => 1
							]
					];

			}

		}

		try {
			
			// $count = $this::where($match['$match'])->count();

			$products = DB::collection("products")->raw(function($collection) use($match,$skip,$sortParam,$limit,$fields){

				return $collection->aggregate([
							$match,
							$sortParam,
							$skip,
							$limit,
							$fields
						]);
			});

		} catch(\Exception $e){

			return ['success'=>false,"message"=>$e->getMessage()];

        }

        return ['success'=>true,'products'=>$products['result']];

	}

	public function fetchProduct($params){

		
		
	}

	public function packagelist()
	{
		return $this->belongsToMany('AlcoholDelivery\Packages', null, 'products', 'packages');
	}
}
