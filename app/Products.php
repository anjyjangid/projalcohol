<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

use AlcoholDelivery\Categories;
use AlcoholDelivery\Setting;
use AlcoholDelivery\Dontmiss;

use DB;
use MongoId;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Stocks;
use MongoDate;

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
		'categoriesObject',
		'chilled',
		'isFeatured',
		'isLoyalty',
        'loyaltyValueType',
        'loyaltyValuePoint',
        'loyaltyValuePrice',
        'loyalty',
        'loyaltyType',
		'status',
		
		'sku',
		
		'quantity',
		
		'deliveryType',
		'outOfStockType',
		'availabilityDays',
		'availabilityTime',
		
		'dealerData',
		
		'price',            		
		'regular_express_delivery',			
		'express_delivery_bulk',
		'bulkDisable',			
		
		'metaTitle',
		'metaKeywords',
		'metaDescription',
		
		'images',

		'packages',		
		'dealerId',
		'dealerObjectId',
		'suggestionId',
		'suggestionObjectId',
		'suggestedId',
		'suggestedObjectId'
	];


	protected $hidden = [
		'dealerId',
		'dealerObjectId',
		'suggestionId',
		'suggestionObjectId',
		'suggestedId',
		'suggestedObjectId',
		'categoriesObject'
	];

	public function pcategories()
	{        
		//return $this->belongsToMany('AlcoholDelivery\Categories', null, 'products', 'categories');
	}

	public function supplier()
	{        
		return $this->belongsToMany('AlcoholDelivery\Dealer', null, 'productId', 'dealerId');
	}

	public function getSingleProduct($id)
	{

		return Products::where('_id', $id)->first();		

		// DUE : Code to get suggestion (22-AUG-2016)
		// $product = DB::collection("products")->raw(function($collection) use($id){

		// 				return $collection->aggregate([
		// 					[
		// 						'$match' => [
		// 							'_id' => new MongoId($id)
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
						"categoriesObject" => [ '$exists' => true ],
						"status" => 1
					]
				];

		if(isset($params['product'])){
			
			$match['$match']['slug'] = $params['product'];
			
		}

		if(isset($params['id'])){
			
			$match['$match']['_id'] = $params['id'];

		}

		if(!empty($params['search'])){

			$match['$match']['name'] = [ '$regex' => $params['search'], '$options' => 'ig' ];

		}

		if(!empty($params['categories'])){

			$match['$match']['categories'] = [ '$all' => $params['categories'] ];

		}
		
		$sortParam = [
			'$sort' => [ 'created_at' => -1 ]
		];

		if(isset($params['productList']) && $params['productList']==1){
			$sortParam = [
				'$sort' => [ 'name' => 1 ]
			];			
		}

		$skip = [
			'$skip' => 0
		];
		$limit = [
			'$limit' => 100
		];

		if(isset($params['type']) && $params['type']!=0){

			if($params['type']==1){
				$match['$match']['isLoyalty'] = 1;
			}
			
		}


		if(isset($params['filter'])){

			if($params['filter']=="featured"){
				$match['$match']['isFeatured'] = 1;
			}

			if($params['filter']=="new"){
				
				$onemonthOld = strtotime('-1 months');

				$match['$match']['created_at'] = ['$gt'=> new \MongoDate($onemonthOld)];
			}

			if($params['filter']=="in-stock"){
				$match['$match']['quantity'] = ['$gt'=>0];
			}

			if($params['filter']=="on-sale"){
				//$match['$match']['quantity'] = ['$gt'=>0];
			}

		}

		if(isset($params['keyword']) && !empty($params['keyword'])){
			$s = "/".$params['keyword']."/i";
			//$match['$match']['name'] = ['$regex'=>new \MongoRegex($s)];
			$match['$match']['$or'] = [
                ['name' => ['$regex'=>new \MongoRegex($s)]],
                ['parentCategory.cat_title' => ['$regex'=>new \MongoRegex($s)]],
                ['childCategory.cat_title' => ['$regex'=>new \MongoRegex($s)]]
            ];
		}



		/*if(isset($params['parent']) && !empty($params['parent'])){
			
			$category = Categories::raw()->findOne(['slug' => $params['parent']]);

			if(empty($category)){
				return response(['message'=>'Category not found'],404);
			}

			$catKey = (string)$category['_id'];

			$match['$match']['categories'] = $catKey;

		}*/

		if(isset($params['sort']) && !empty($params['sort'])){

			$sortParam = [
				'$sort' => []
			];

			$sortArr = explode("_", $params['sort']);                    
			$sortDir = array_pop($sortArr);
			$sortDir = $sortDir=='asc'?1:-1;
			$sortby = array_pop($sortArr);

			if($sortby == 'new'){
				$sortby = 'created_at';
			}

			$sortParam['$sort'][$sortby] = (int)$sortDir;
			
		}


		if(isset($params['limit']) && !empty($params['limit'])){

			if(isset($params['skip']) && !empty($params['skip'])){
				$skip['$skip'] = (int)$params['skip'];
			}

			$limit['$limit'] = (int)$params['limit'];
			
		}


		$lookupParentCatSale = [
			'$lookup' => [
				'from' => 'sale',
				'localField' => 'catParent', 
				'foreignField' => 'saleCategoryObjectId', 
				'as' => 'pCatSale'
			]
		];

		$lookupCatSale = [
			'$lookup' => [
				'from' => 'sale',
				'localField' => 'catSubParent',
				'foreignField' => 'saleCategoryObjectId',
				'as' => 'catSale'
			]
		];

		$lookupProSale = [
			'$lookup' => [
				'from' => 'sale',
				'localField' => '_id',
				'foreignField' => 'saleProductObjectId', 
				'as' => 'productSale'
			]
		];

		$unwind = [
			'$unwind' => [
				'path' => '$proSales',
				'preserveNullAndEmptyArrays' => true
			]
		];

		$unwindAction = [
			'$unwind' => [
				'path' => '$proSales.actionProductObjectId',
				'preserveNullAndEmptyArrays' => true
			]
		];

		$unwindCategory = [
			'$unwind' => [
				'path' => '$parentCategory',
				'preserveNullAndEmptyArrays' => true
			]
		];

		$unwindSubCategory = [
			'$unwind' => [
				'path' => '$childCategory',
				'preserveNullAndEmptyArrays' => true
			]
		];

		$lookupSaleProduct = [
			'$lookup' => [
				'from' => 'products',
				'localField' => 'proSales.actionProductObjectId',
				'foreignField' => '_id', 
				'as' => 'saleProduct'
			]
		];

		$lookupParentCategory = [
			'$lookup' => [
				'from' => 'categories',
				'localField' => 'catParent',
				'foreignField' => '_id', 
				'as' => 'parentCategory'
			]
		];

		$lookupChildCategory = [
			'$lookup' => [
				'from' => 'categories',
				'localField' => 'catSubParent',
				'foreignField' => '_id', 
				'as' => 'childCategory'
			]
		];

		//CATEGORY WISE SEARCH 
		if(isset($params['parent']) && !empty($params['parent'])){			

			$matchCategoryCondition['$match']['$or'] = [
				['parentCategory.slug' => $params['parent']],
				['childCategory.slug' => $params['parent']],
			];

		}

		//FILTER PRODUCTS HAVING INACTIVE CATEGORIES & SUBCATEGORIES
		$matchCategoryCondition['$match']['parentCategory.cat_status'] = 1;
		$matchCategoryCondition['$match']['childCategory.cat_status'] = 1;

		$fields = [
			'$project' => [
							'chilled' => 1,
							'description' =>  1,
							'price' => [
								'$multiply' => [ '$price', 1 ]
							],
							'categories' => 1,
							'categoriesObject'=>1,
							// 'discountPrice' => 1,
							'isLoyalty' => 1,
							'loyaltyValueType' => 1,
							'loyaltyValuePoint' => 1,
							'loyaltyValuePrice' => 1,
							'loyaltyType'=>1,
							'loyalty'=>1,
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
							'availabilityTime' => 1,
							'parentCategory' => 1,
							'childCategory' => 1,
							'status' => 1,
							'created_at' => 1,
							'isFeatured' => 1,
							'metaTitle'=>1,
							'metaDescription'=>1,
							'metaKeywords'=>1,
							'bulkDisable'=>1
						]
		];


		$saleProject = [
			'$project' =>[
				'nameSales' => [
					'$filter' => [
						'input' => [
							'$setUnion'  => ['$productSale','$catSale','$pCatSale']
						],
						'as' => 'sale',
						'cond' => [
							'$eq' => [ '$$sale.type', 0 ]							
						]
					]
				],
				'proSales' => [
					'$filter' => [
						'input' => [
							'$setUnion' => ['$productSale','$catSale','$pCatSale']
						],
						'as' => 'sale',
						'cond' => [
							'$eq' => [ '$$sale.type', 1 ]
						]
					]
				]
			]
		];

		$saleProject['$project'] = array_merge($fields['$project'],$saleProject['$project']);

		$firstProSaleProject = [
			'$project' => [
				'nameSales' => 1,
				'proSales' => [
					'$arrayElemAt'=> [ '$proSales', -1 ]
				]
			]
		];

		$firstProSaleProject['$project'] = array_merge($fields['$project'],$firstProSaleProject['$project']);

		

		$fields['$project']['catParent'] = ['$arrayElemAt'=> [ '$categoriesObject', 0 ]];
		$fields['$project']['catSubParent'] = ['$arrayElemAt'=> [ '$categoriesObject', -1 ]];

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
								'availabilityTime' => 1,
								'catParent' => ['$arrayElemAt'=> [ '$categoriesObject', 0 ]],
								'catSubParent' => ['$arrayElemAt'=> [ '$categoriesObject', -1 ]],
								'status' => 1,
								'created_at' => 1,
								'isFeatured' => 1,
								'isLoyalty' => 1,
								'categoriesObject' => 1,
								'metaTitle'=>1,
								'metaDescription'=>1,
								'metaKeywords'=>1,
								'bulkDisable'=>1
							]
					];

			}

		}


		try {
			
			// $count = $this::where($match['$match'])->count();

			$query = [						
						$fields,
						$lookupParentCategory,
						$lookupChildCategory,
						$unwindCategory,
						$unwindSubCategory,
						$match,
						$matchCategoryCondition,
						$sortParam,
						$skip,
						$limit,
					];

			if(isset($params['type'])){

				if($params['type']==0){
					//$query = array_merge($query,[$lookupParentCatSale,$lookupCatSale,$lookupProSale,$saleProject,$unwind,$unwindAction,$lookupSaleProduct]);
					$query = array_merge(
								$query,
								[
									/*$lookupParentCategory,
									$lookupChildCategory,*/
									$lookupParentCatSale,
									$lookupCatSale,
									$lookupProSale,
									$saleProject,
									$firstProSaleProject,
									/*$unwindCategory,
									$unwindSubCategory,*/
									$unwind,
									$unwindAction,
									$lookupSaleProduct
								]
								//$matchCategoryCondition
							);
					//jprd($query);
				}

			}

			//NEW SALE FILTER
			if(isset($params['filter']) && $params['filter']=="on-sale"){
				$query[]['$match'] = ['proSales' => ['$exists'=>true,'$not' => ['$size'=>0]]];
			}

			//dd($query);

			$products = Products::raw()->aggregate($query);


		} catch(\Exception $e){

			return ['success'=>false,"message"=>$e->getMessage()];

		}
		
		return ['success'=>true,'products'=>$products['result']];

	}

	public function fetchProduct($params){
		
		$globalPricing = Setting::where("_id",'=',"pricing")
									->first([
										'settings.regular_express_delivery',
										'settings.express_delivery_bulk',
									]);

		$redGlobal = $globalPricing->settings['regular_express_delivery'];
		$edbGlobal = $globalPricing->settings['express_delivery_bulk'];

		$isSingle = true;
		if(!is_array($params['id'])){

			$match = new MongoId($params['id']);

		}else{

			$isSingle = false;
			$params['id'] = (array)$params['id'];
			foreach($params['id'] as &$proId){
				$proId = new MongoId($proId);
			}

			$match = [ '$in' => $params['id'] ];
		}



		try {

			$query = [
						[
							'$match' => [
								"_id" => $match,
								"categoriesObject" => [ '$exists' => true ],
								"status" => 1
							]
						],
						[
							'$project'=> [
								"parentCat" => ['$arrayElemAt' => [ '$categoriesObject', 0 ]],
								"subCat" => ['$arrayElemAt' => [ '$categoriesObject', 1 ]],

								'chilled' => 1,
								'description' =>  1,
								'price' => [
									'$multiply' => [ '$price', 1 ]
								],
								'categories' => 1,
								'categoriesObject'=>1,
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
								'availabilityDays' => 1,
								'availabilityTime' => 1,
								'loyaltyValueType' => 1,
								'loyaltyValuePoint' => 1,
								'loyaltyValuePrice' => 1,
								'loyaltyType'=>1,
								'loyalty'=>1,
								'metaTitle'=>1,
								'metaDescription'=>1,
								'metaKeywords'=>1,
								'bulkDisable' => 1
							]
						],
						[
							'$lookup' => [
								'from'=>'categories',
								'localField'=>'parentCat',
								'foreignField'=>'_id',
								'as'=>'parentCat'
							]
						],						
						[
							'$lookup' => [
								'from'=>'categories',
								'localField'=>'subCat',
								'foreignField'=>'_id',
								'as'=>'subCat'
							]
						],						
						[
							'$unwind' => [
								'path' =>  '$parentCat',
								"preserveNullAndEmptyArrays" => true

							]
						],
						[
							'$unwind' => [
								'path' =>  '$subCat',
								"preserveNullAndEmptyArrays" => true

							]
						],
						[
							'$project' => [

								'chilled' => 1,
								'description' =>  1,
								'price' => 1,
								'categories' => 1,
								'subCat'=>1,
								'parentCat'=>1,
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
								'availabilityDays' => 1,
								'availabilityTime' => 1,

								'loyaltyValueType' => 1,
								'loyaltyValuePoint' => 1,
								'loyaltyValuePrice' => 1,
								'loyaltyType'=>1,
								'loyalty'=>1,
								'metaTitle'=>1,
								'metaDescription'=>1,
								'metaKeywords'=>1,
								'bulkDisable' => 1,
								'regular_express_delivery' => [
									'$ifNull' => [ '$regular_express_delivery',
										[
											'$ifNull' => [ '$subCat.regular_express_delivery',
												[
													'$ifNull' => [ '$parentCat.regular_express_delivery',null]
												]
											]
										]
									]
								],

								'express_delivery_bulk' => [
									'$ifNull' => [ '$express_delivery_bulk',
										[
											'$ifNull' => [ '$subCat.express_delivery_bulk',
												[
													'$ifNull' => [ '$parentCat.express_delivery_bulk',null]
												]
											]
										]
									]
								]
							]
						],
						[ // lookup for Parent Category Sale
							'$lookup' => [
								'from' => 'sale',
								'localField' => 'parentCat._id', 
								'foreignField' => 'saleCategoryObjectId', 
								'as' => 'pCatSale'
							]
						],
						[ // lookup for Sub Category Sale
							'$lookup' => [
								'from' => 'sale',
								'localField' => 'subCat._id',
								'foreignField' => 'saleCategoryObjectId',
								'as' => 'catSale'
							]
						],
						[ // lookup for Product Category Sale
							'$lookup' => [
								'from' => 'sale',
								'localField' => '_id',
								'foreignField' => 'saleProductObjectId', 
								'as' => 'productSale'
							]
						],
						[
							'$project' =>[			

								'proSales' => [
									'$filter' => [
										'input' => [
											'$setUnion' => ['$productSale','$catSale','$pCatSale']
										],
										'as' => 'sale',
										'cond' => [
											'$eq' => [ '$$sale.type', 1 ]
										]
									]
								],
								'chilled' => 1,
								'description' =>  1,
								'price' => 1,
								'subCat'=>1,
								'parentCat'=>1,
								'categories' => 1,
								'categoriesObject'=>1,
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
								'availabilityDays' => 1,
								'availabilityTime' => 1,
								'regular_express_delivery' => 1,
								'express_delivery_bulk' => 1,

								'loyaltyValueType' => 1,
								'loyaltyValuePoint' => 1,
								'loyaltyValuePrice' => 1,
								'loyaltyType'=>1,
								'loyalty'=>1,
								'metaTitle'=>1,
								'metaDescription'=>1,
								'metaKeywords'=>1,
								'bulkDisable' => 1,
							]
						],
						[
							'$project' =>[

								'proSales' => [
									'$arrayElemAt'=> [ '$proSales', -1 ]
								],
								'chilled' => 1,
								'description' =>  1,
								'price' => 1,
								'subCat'=>1,
								'parentCat'=>1,
								'categories' => 1,
								'categoriesObject'=>1,
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
								'availabilityDays' => 1,
								'availabilityTime' => 1,
								'regular_express_delivery' => 1,
								'express_delivery_bulk' => 1,

								'loyaltyValueType' => 1,
								'loyaltyValuePoint' => 1,
								'loyaltyValuePrice' => 1,
								'loyaltyType'=>1,
								'loyalty'=>1,
								'metaTitle'=>1,
								'metaDescription'=>1,
								'metaKeywords'=>1,
								'bulkDisable' => 1,
							]
						]

					];
			
			$product = Products::raw()->aggregate($query);


			if(isset($product['result'][0])){

				foreach ($product['result'] as $key => &$tempPro) {
						
					if(is_null($tempPro['regular_express_delivery'])){
						$tempPro['regular_express_delivery'] = $redGlobal;
					}
					if(is_null($tempPro['express_delivery_bulk'])){
						$tempPro['express_delivery_bulk'] = $edbGlobal;
					}

				}

			}

			if($isSingle){
				$product = $product['result'][0];
			}else{
				$product = $product['result'];
			}

			return ['success'=>true,"product"=>$product];


		} catch(\Exception $e){

			return ['success'=>false,"message"=>$e->getMessage()];

		}

	}
	
	public function fetchDontMissProducts($params){

		$quantity = $params['quantity'];

		$globalPricing = Setting::where("_id",'=',"pricing")
									->first([
										'settings.regular_express_delivery',
										'settings.express_delivery_bulk',
									]);

		$redGlobal = $globalPricing->settings['regular_express_delivery'];
		$edbGlobal = $globalPricing->settings['express_delivery_bulk'];

		$isSingle = true;
		if(!is_array($params['id'])){

			$match = new MongoId($params['id']);

		}else{

			$isSingle = false;
			$params['id'] = (array)$params['id'];
			foreach($params['id'] as &$proId){
				$proId = new MongoId($proId);
			}

			$match = [ '$nin' => $params['id'] ];
		}

		$proInCartIds = $params['id'];

		try {

			$query = [						
						[
							'$unwind' => '$products'
						],
						[
							'$match' => [
								'products' => [
									'$nin' => $proInCartIds
								]
							]
						],
						[
							'$lookup' => [
								'from'=>'products',
								'localField'=>'products',
								'foreignField'=>'_id',
								'as'=>'dontMiss'
							]
						],
						[
							'$unwind' => '$dontMiss'
						],
						[
							'$match' => [
								'dontMiss.status' => 1									
							]
						],
						[
							'$sample' => [
								'size' => $quantity
							] 
						],
						[
							'$project'=> [
								"_id" => '$dontMiss._id',
								"parentCat" => ['$arrayElemAt' => [ '$dontMiss.categoriesObject', 0 ]],
								"subCat" => ['$arrayElemAt' => [ '$dontMiss.categoriesObject', 1 ]],

								'chilled' => '$dontMiss.chilled',
								'description' =>  1,
								'price' => [
									'$multiply' => [ '$dontMiss.price', 1 ]
								],
								'categories' => '$dontMiss.categories',
								'categoriesObject'=>'$dontMiss.categoriesObject',
								'imageFiles' => '$dontMiss.imageFiles',
								'name' => '$dontMiss.name',
								'slug' => '$dontMiss.slug',
								'shortDescription' => '$dontMiss.shortDescription',
								'sku' => '$dontMiss.sku',
								'quantity' => '$dontMiss.quantity',
								'regular_express_delivery' => '$dontMiss.regular_express_delivery',
								'express_delivery' => '$dontMiss.express_delivery',
								'express_delivery_bulk' => '$dontMiss.express_delivery_bulk',
								'outOfStockType' => '$dontMiss.outOfStockType',
								'availabilityDays' => '$dontMiss.availabilityDays',
								'availabilityTime' => '$dontMiss.availabilityTime',
								'loyaltyValueType' => '$dontMiss.loyaltyValueType',
								'loyaltyValuePoint' => '$dontMiss.loyaltyValuePoint',
								'loyaltyValuePrice' =>'$dontMiss.loyaltyValuePrice'
							]
						],
						[
							'$lookup' => [
								'from'=>'categories',
								'localField'=>'parentCat',
								'foreignField'=>'_id',
								'as'=>'parentCat'
							]
						],						
						[
							'$lookup' => [
								'from'=>'categories',
								'localField'=>'subCat',
								'foreignField'=>'_id',
								'as'=>'subCat'
							]
						],						
						[
							'$unwind' => [
								'path' =>  '$parentCat',
								"preserveNullAndEmptyArrays" => true

							]
						],
						[
							'$unwind' => [
								'path' =>  '$subCat',
								"preserveNullAndEmptyArrays" => true

							]
						],
						[
							'$project' => [

								'chilled' => 1,
								'description' =>  1,
								'price' => 1,
								'categories' => 1,
								'subCat'=>1,
								'parentCat'=>1,
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
								'availabilityDays' => 1,
								'availabilityTime' => 1,

								'loyaltyValueType' => 1,
								'loyaltyValuePoint' => 1,
								'loyaltyValuePrice' => 1,

								'regular_express_delivery' => [
									'$ifNull' => [ '$regular_express_delivery',
										[
											'$ifNull' => [ '$subCat.regular_express_delivery',
												[
													'$ifNull' => [ '$parentCat.regular_express_delivery',null]
												]
											]
										]
									]
								],

								'express_delivery_bulk' => [
									'$ifNull' => [ '$express_delivery_bulk',
										[
											'$ifNull' => [ '$subCat.express_delivery_bulk',
												[
													'$ifNull' => [ '$parentCat.express_delivery_bulk',null]
												]
											]
										]
									]
								]
							]
						],
						[ // lookup for Parent Category Sale
							'$lookup' => [
								'from' => 'sale',
								'localField' => 'parentCat._id', 
								'foreignField' => 'saleCategoryObjectId', 
								'as' => 'pCatSale'
							]
						],
						[ // lookup for Sub Category Sale
							'$lookup' => [
								'from' => 'sale',
								'localField' => 'subCat._id',
								'foreignField' => 'saleCategoryObjectId',
								'as' => 'catSale'
							]
						],
						[ // lookup for Product Category Sale
							'$lookup' => [
								'from' => 'sale',
								'localField' => '_id',
								'foreignField' => 'saleProductObjectId', 
								'as' => 'productSale'
							]
						],
						[
							'$project' =>[			

								'proSales' => [
									'$filter' => [
										'input' => [
											'$setUnion' => ['$productSale','$catSale','$pCatSale']
										],
										'as' => 'sale',
										'cond' => [
											'$eq' => [ '$$sale.type', 1 ]
										]
									]
								],
								'chilled' => 1,
								'description' =>  1,
								'price' => 1,
								'subCat'=>1,
								'parentCat'=>1,
								'categories' => 1,
								'categoriesObject'=>1,
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
								'availabilityDays' => 1,
								'availabilityTime' => 1,
								'regular_express_delivery' => 1,
								'express_delivery_bulk' => 1,

								'loyaltyValueType' => 1,
								'loyaltyValuePoint' => 1,
								'loyaltyValuePrice' => 1
							]
						],
						[
							'$project' =>[

								'proSales' => [
									'$arrayElemAt'=> [ '$proSales', -1 ]
								],
								'chilled' => 1,
								'description' =>  1,
								'price' => 1,
								'subCat'=>1,
								'parentCat'=>1,
								'categories' => 1,
								'categoriesObject'=>1,
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
								'availabilityDays' => 1,
								'availabilityTime' => 1,
								'regular_express_delivery' => 1,
								'express_delivery_bulk' => 1,

								'loyaltyValueType' => 1,
								'loyaltyValuePoint' => 1,
								'loyaltyValuePrice' => 1
							]
						]

					];
			
			$product = Dontmiss::raw()->aggregate($query);

			if(isset($product['result'][0])){

				foreach ($product['result'] as $key => &$tempPro) {
						
					if(is_null($tempPro['regular_express_delivery'])){
						$tempPro['regular_express_delivery'] = $redGlobal;
					}
					if(is_null($tempPro['express_delivery_bulk'])){
						$tempPro['express_delivery_bulk'] = $edbGlobal;
					}

				}

			}

			$product = $product['result'];			

			return ['success'=>true,"product"=>$product];


		} catch(\Exception $e){

			return ['success'=>false,"message"=>$e->getMessage()];

		}

	
	}

	public function packagelist()
	{
		return $this->belongsToMany('AlcoholDelivery\Packages', null, 'products', 'packages');
	}


	public function stocks(){
        return $this->hasMany('AlcoholDelivery\Stocks', 'productId', '_id');
    }

    public function store(){        

    	$userStoreId = Auth::user('admin')->storeId;

        return $this->hasOne('AlcoholDelivery\Stocks', 'productId', '_id')->where('storeId',$userStoreId);
    }

    /*public function mystore(){            	

        return $this->embedsMany('AlcoholDelivery\Stocks');
    }*/    

    public function getFields(){
        $fields = $this->fillable;
        $ret = [];
        foreach ($fields as $key => $value) {
            $ret[$value] = '$'.$value;
        }

        return $ret;
    }

    public function getFirstfield(){
        $fields = $this->fillable;
        $ret = [];
        foreach ($fields as $key => $value) {
        	//'name' => [ '$first' => '$name'],
            $ret[$value] = ['$first' => '$'.$value];
        }

        return $ret;
    }

    public function updateStocks($data,$id){

    	//CURRENT STORE ID
    	$userStoreId = Auth::user('admin')->storeId;    	

    	$fields = [
    		'quantity' => (int)$data['store']['quantity'],
    		'threshold' => (int)$data['store']['threshold'],
    		'maxQuantity' => (int)$data['store']['maxQuantity'],
    		'storeId' => $userStoreId,
    		'storeObjId' => new MongoId($userStoreId),
    		'defaultDealerId' => $data['store']['defaultDealerId'],
    		'defaultDealerObjId' => new MongoId($data['store']['defaultDealerId']),
    		'productId' => $id,
    		'productObjId' => new MongoId($id),
    	];

    	if(isset($data['store']['defaultDealerId'])){
    		$fields['defaultDealerId'] = $data['store']['defaultDealerId'];
    		$fields['defaultDealerObjId'] = new MongoId($data['store']['defaultDealerId']);
    	}

    	DB::collection('stocks')
    	->where('productId', $id)
    	->where('storeId', $userStoreId)
        ->update($fields, ['upsert' => true]);

        //update total quantity for the product available @ all stores

        $productWithStocks = Products::where('_id',$id)->with('stocks')->first();

        $quantity = 0;
        foreach ($productWithStocks->stocks as $key => $value) {
        	$quantity += $value->quantity;
        }
        $productWithStocks->quantity = $quantity;

		$productWithStocks->save();        

    }

    public function suggestions(){
    	return $this->belongsToMany('AlcoholDelivery\Products', null, 'suggestedId', 'suggestionId');
    }

    public function updateInventory($order){

    	$orderId = new MongoId($order['_id']);

    	$proQty = [];
		$ids = [];

		foreach ($order['productsLog'] as $key => $value) {
			$id = (string)$value['_id'];
			$proQty[$id] = $value['quantity'];
			$ids[] = $value['_id'];
		}
    	
    	$query[]['$match'] = [
			'_id' => ['$in'=>$ids]
		];

		$query[]['$lookup'] = [
			'from' => 'stocks',
			'localField' => '_id',
			'foreignField' => 'productObjId',
			'as' => 'storeStocks'
		];

		$query[]['$project'] = ['quantity'=>1,'storeStocks'=>1];

		$query[]['$unwind'] = [
			'path' => '$storeStocks',
			'preserveNullAndEmptyArrays' => true
		];

		$query[]['$sort'] = ['storeStocks.storeObjId' => 1];

		$query[]['$group'] = [
			'_id' => '$_id',
			'quantity' => ['$first' => '$quantity'],
			'storeStocks' => ['$push' => '$storeStocks']
		];
				
		$model = Products::raw()->aggregate($query);

		$inventoryLog = [];

		if(isset($model['result']) && !empty($model['result'])){

			foreach ($model['result'] as $key => $value) {
			
				$product = Products::find($value['_id']);

				$qtyReq = $proQty[(string)$value['_id']];

				foreach ($value['storeStocks'] as $storeStockskey => $storeStocksvalue) {
					
					$storeStock = Stocks::find($storeStocksvalue['_id']);				
					$qtyFullFilled = true;
					//CHECK REQUIRED QTY MEETS THE STORE QTY
					if($storeStock->quantity < $qtyReq){
						$newQty = 0;
						$qtyToPull = $storeStock->quantity;
						$qtyFullFilled = false;
					}else{
						$newQty = $storeStock->quantity-$qtyReq;					
						$qtyToPull = $qtyReq;
					}

					//UPDATE QTY FOR THE STORE
					$storeStock->quantity = $newQty;
					$storeStock->save();

					//PREPARE TRANSACTION OF PRODUCT FOR THE STORE
					$inventoryLog[] = [
						'productId' => $value['_id'],
						'orderId' => $orderId,
						'storeId' => $storeStocksvalue['storeObjId'],
						'quantity' => $qtyToPull,
						'type' => 0,
						'created_at' => new MongoDate(strtotime(date('Y-m-d H:i:s')))
					];
					
					if($qtyFullFilled){
						break; //REQUIRED QTY MEETS THE STORE QTY THEN BREAK THE LOOP
					}else{
						$qtyReq -= $qtyToPull; //UPDATE THE REQUIRED QTY FIELD FOR NEXT STORE IN THE LOOP
					}
				}

				/*UPDATE TOTAL QTY IN PRODUCT COLLECTION*/
				$product->quantity -= $proQty[(string)$value['_id']];
				$product->save();

			}
		
		}
		//INSERT INVENTORY LOG
		if($inventoryLog){
			$r = DB::collection('inventoryLog')->insert($inventoryLog);
		}

    }
}
