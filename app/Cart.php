<?php

namespace AlcoholDelivery;

use Moloquent;

use AlcoholDelivery\Setting as Setting;

class Cart extends Moloquent
{
	protected $primaryKey = "_id";
	protected $collection = 'cart';
	public static $key;

	/**
	 * Indicates if the model should be timestamped.
	 *
	 * @var bool
	 */
	public $timestamps = true;

	 /**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = ['_id', 'products','packages','nonchilled','delivery','service','discount','timeslot','payment','status','user'];

	public function setKey($keyVal){
		$this->key = $keyVal;
	}


	public function generate(){

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value'])->first();

		$services = $services['settings'];        

		$cart = [

			"products" => [],
			"packages" => [],            
			"delivery" => [
				"type" => 1,
				"charges" => null,
				"address" => null,
				"instruction" => null,
				"leaveatdoor" => false,
				"instructions" => null,
			],
			"service" => [
				"express" => [
					"status" => false,
					"charges" => $services['express_delivery']['value']
				],
				"smoke" => [
					"status" => false,
					"charges" => $services['cigratte_services']['value']
				],
				"delivery" => [
					"free" => false,
					"charges" => $services['non_free_delivery']['value'],
					"mincart" => $services['minimum_cart_value']['value'],
				],
			],
			"discount" => [
				"nonchilled" => [
					"status" => false,
					"exemption" => $services['non_chilled_delivery']['value']
				]
			],
			"timeslot" => [
				"datekey"=>false,
				"slotkey"=>false,
				"slug"=>"",
				"slotslug"=>""
			],
			"payment" => [
				"subtotal" => null,
				"total" => null,
				"method" => "COD",
			],
			"nonchilled" => false,
			"status" => 0,
			"user" => null
		];

		try{
			
			$cart = self::create($cart);
			$cart = $cart->toArray();
			$cart['products'] = (object)$cart['products'];
			$cart['packages'] = (object)$cart['packages'];

			return (object)array("success"=>true,"message"=>"cart generated succesfully","cart"=>$cart);

		}catch(Exception $e){
			return (object)array("success"=>false,"message"=>$e->getMessage());
		}
		

	}


}
