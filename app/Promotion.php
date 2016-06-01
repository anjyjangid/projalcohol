<?php

namespace AlcoholDelivery;

use Moloquent;
use AlcoholDelivery\Products as Products;

class Promotion extends Moloquent
{

	protected $primaryKey = "_id";
	protected $collection = 'promotions';

	/*************************************************
	* Indicates if the model should be timestamped.  *
	* @var bool 									 *
	*************************************************/ 
	public $timestamps = true;

	/********************************************
	* The attributes that are mass assignable.  *
	* @var array 								*
	*********************************************/
	protected $fillable = ['title', 'price', 'products', 'items', 'status', 'count'];


	/******		
		The attributes that are mass assignable.
	******/

	public function getPromotion($id){

		$params = $id;

		$result = self::find($id);

		$products = Products::whereIn("_id",$result['products'])->get();
		$products = $products->toArray();

		$tempProducts = [];

		foreach($result['items'] as $product){

			$tempProducts[(string)$product['_id']] = [
														'type'=>$product['type'],
														'price'=>$product['price'],
													];

		}

		foreach($products as &$product){
			$product['type'] = $tempProducts[$product['_id']]['type'];
			$product['dprice'] = $tempProducts[$product['_id']]['price'];
		}    

		$result->__set('products',$products);

		unset($result['items']);

		return $result;


	}

	public function getAllPromotions(){

		$promotions = Promotion::where("status","=",1)->orderBy('price', 'asc')->get();

		$promoProductKeys = [];
		foreach($promotions as $promotion){

			$promoProductKeys = array_merge($promoProductKeys,$promotion['products']);
		}

		$productObj = new products;

		$promoProducts = $productObj->getProducts(
									array(
										"id"=>$promoProductKeys,
										"with"=>array(
											"discounts"
										)
									)
								);
		
		foreach ($promoProducts as $key => $value) {

			$promoProducts[$value['_id']] = $value;
			unset($promoProducts[$key]);

		}

		$promotions = $promotions->toArray();

		foreach ($promotions as $key => &$promotion) {

			foreach ($promotion['items'] as $key => &$item) {

				$tempPromoPro = $promoProducts[(string)$item['_id']];
				$tempPromoPro['promo'] = [
											'type'=>$item['type'],
											'price'=>$item['price'],
										];
				$item = $tempPromoPro;
			}

			$promotion['products'] = $promotion['items'];
			unset($promotion['items']);

		}

		return $promotions;

	}

}
