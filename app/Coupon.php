<?php

namespace AlcoholDelivery;

use Moloquent;
use AlcoholDelivery\Products as Products;

class Coupon extends Moloquent
{

	protected $primaryKey = "_id";
	protected $collection = 'coupons';

	/*************************************************
	* Indicates if the model should be timestamped.  *
	* @var bool 									 *
	*************************************************/ 
	public $timestamps = true;

	/********************************************
	* The attributes that are mass assignable.  *
	* @var array 								*
	*********************************************/
	protected $fillable = ['code', 'type', 'discount', 'status'];


	/******		
		The attributes that are mass assignable.
	******/

	public function getCoupon($id){

		$params = $id;

		$result = self::find($id);	
		
		if(empty($result)){
			return $result;
		}	
		
		return $result;

	}

	public function getAllCoupons(){

		$coupons = Coupon::where("status","=",1)->orderBy('price', 'asc')->get();

		$promoProductKeys = [];	
		foreach($coupons as $promotion){

			$promoProductKeys = array_merge($promoProductKeys,$promotion['products']);
		}

		if(empty($promoProductKeys)){
			return [];
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

		$coupons = $coupons->toArray();

		foreach ($coupons as $key => &$promotion) {

			foreach ($promotion['items'] as $itemskey => &$item) {

				if(!isset($promoProducts[(string)$item['_id']])){

					unset($coupons[$key]['items'][$itemskey]);
					continue;

				}

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

		return $coupons;

	}

}
