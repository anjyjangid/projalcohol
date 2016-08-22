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

	public function packagelist()
	{
		return $this->belongsToMany('AlcoholDelivery\Packages', null, 'products', 'packages');
	}
}
