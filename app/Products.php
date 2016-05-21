<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Setting as Setting;

class Products extends Eloquent
{
	protected $primaryKey = "_id";
	protected $collection = 'products';

	protected $fillable = [
			'name',
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
			'advance_order',
			'regular_express_delivery',
			'advance_order_bulk',
			'express_delivery_bulk',
			'loyalty',
			'threshold',
			'maxQuantity',
			'dealers',
			'packages'
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
	}

	public function getProducts($params){

		if(isset($params['id']) and  $params['id']){

			$params['id'] = is_string($params['id'])?(array)$params['id']:$params['id'];

			$products = Products::whereIn('_id',$params['id']);

			$products = $products->where('status','=',1);

			$products = $products->get();

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

		$categyIds = array();

		foreach($products as $product){
			$categyIds = array_merge($categyIds,$product['categories']);
		}


		$categories = Categories::whereIn("_id",$categyIds)->get(['_id', 'ancestors','advance_order','advance_order_bulk']);

		//Fetch Global Pricing
		$globalPricing = Setting::where("_id",'=',"pricing")
									->first([
										'settings.advance_order',
										'settings.advance_order_bulk',										
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
			$product = array_merge($product,$tempCat);
		}
				
	}

	public function packagelist()
	{
		return $this->belongsToMany('AlcoholDelivery\Packages', null, 'products', 'packages');
	}
}
