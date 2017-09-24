<?php

namespace AlcoholDelivery;

use Moloquent;
use AlcoholDelivery\Products as Products;
use AlcoholDelivery\ErrorLog;

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
	protected $fillable = [
		'code',
		'name',
		'type',
		'discount',
		'total',
		'coupon_uses',
		'customer_uses',
		'start_date',
		'end_date',
		'status',
		'discount_status',
		'products',
		'categories',
		'used_count',
		'used_list'
	];

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

	public function redeemed($data){

		//UPDATE COUPON COUNT AND COUPON LIST
		
		$newList = array('orderId'=> $data['reference'], 'userId'=> $data['user']);

		$coupon = $this::where(['_id' => $data['coupon']])->first();

		$coupon->__set("used_count",$coupon->used_count+1);
		if(is_array($coupon->used_list))
			$coupon->__set("used_list",array_merge($coupon->used_list, [$newList]));
		else
			$coupon->__set("used_list",[$newList]);
		
		try{

			$coupon->save();

		}catch(Exception $e){

			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Reedem coupon'
				]);

		}	

		return ['success'=>true];

	}

	public function isExpired(){

		$currServerTime = getServerTime();
		$startTime = strtotime($this->start_date);
		$endTime = strtotime($this->end_date. ' + 1 days'); //Till mid of night means as next day start thats why 1 day is added
		
		return !($startTime<= $currServerTime && $endTime>= $currServerTime);

	}

}
