<?php

namespace AlcoholDelivery;

use Moloquent;

use AlcoholDelivery\User;
use AlcoholDelivery\Setting;
use AlcoholDelivery\Products;

use mongoId;

class CartAdmin extends Moloquent
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
	protected $fillable = [
							'_id',
							'products',
							'packages',
							'nonchilled',
							'delivery',
							'service',
							'discount',
							'timeslot',
							'payment',
							'status',
							'user',
							'orderType',
							'generatedBy',
							'reference'
						];
	

	public function getLastUnProcessed($adminId){

		$cart = self::where('generatedBy',$adminId)->orderBy('updated_at', 'desc')->first();

		if(!empty($cart->user)){
			
			$cart = $this->findUpdated($cart->_id);

			$cart->addresses = [];

			$userId = (string)$cart->user;
			$user = User::find($userId);

			if($cart->orderType==='consumer'){
				$cart->consumer = [
					"_id"=> $userId,
					"name"=> $user->name,
					"mobile_number"=> $user->mobile_number,
					"email"=> $user->email,
					"savedCards"=> $user->savedCards,
					"specialNote" => $user->specialNote
				];
				$cart->addresses = $user->address;
			}			

		}

		return $cart;

	}

	public function deleteLastUnProcessed($adminId){

		try{

			$cart = self::where('generatedBy',$adminId)->orderBy('updated_at', 'desc')->first();

			$cart->delete();

			return true;

		}catch(Exception $e){

			return false;

		}
	}	

	public function generate($adminId){

		$cart = [

			"products" => [],
			"packages" => [],
			"promotions" => [],
			"delivery" => [
				"type" => 0,
				"charges" => null,
				"address" => null,
				"contact" => null,
				"instruction" => null,
				"leaveatdoor" => false,
				"instructions" => null,
			],
			"service" => [
				"express" => [
					"status" => false,
					"charges" => null
				],
				"smoke" => [
					"status" => false,
					"charges" => null
				],
				"delivery" => [
					"free" => false,
					"charges" => null,
					"mincart" => null
				],
				"surcharge" => [
					'holiday' => [
						'label' => 'Holiday surcharge',
						'type' => 1, //0=>fixed 1=>percentage
						'value' => 10
					]
				],
				"tempsurcharge" => true
			],
			"discount" => [
				"nonchilled" => [
					"status" => false,
					"exemption" => null
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
			"user" => null,
			"generatedBy" => $adminId
		];


		$cart = self::setServices($cart);

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

	public static function findUpdated($id){

		$cart = self::where("_id",new mongoId($id))->first();		

		if(empty($cart)){
			return false;
		}

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.express_delivery.applicablePostalCodes','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value','settings.tempsurcharge'])->first();

		$services = $services['settings'];

		$cartServices = $cart->service;

		$cartServices["express"]["charges"] = $services['express_delivery']['value'];

		$cartServices["smoke"]["charges"] = $services['cigratte_services']['value'];
		

		$cartServices["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value']
							];

		//ADD TEMPSURCHARGE FLAG
		$cartServices["tempsurcharge"] = $services['tempsurcharge'];							

		$cartServices["surcharge"] = [
					'holiday' => [
						'label' => 'Holiday surcharge',
						'type' => 1, //0=>fixed 1=>percentage
						'value' => 10
					]
				];

		$cart->service = $cartServices;							
		$cart->applicablePostalCodes = $services['express_delivery']['applicablePostalCodes'];
		$cartDiscount = $cart->discount;							
		$cartDiscount['nonchilled']['exemption'] = $services['non_chilled_delivery']['value'];
		$cart->discount = $cartDiscount;


		try{

			$cart->save();			
			return $cart;

		}catch(\Exception $e){

			return false;

		}

	}

	public function setServices($cart){

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value','settings.tempsurcharge'])->first();


		$services = $services['settings'];

		$cart["service"]["express"]["charges"] = $services['express_delivery']['value'];
		$cart["service"]["smoke"]["charges"] = $services['cigratte_services']['value'];

		$cart["service"]["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value'],
							];

		//ADD TEMPSURCHARGE FLAG
		$cart["service"]["tempsurcharge"] = $services['tempsurcharge'];

		$cart["discount"]["nonchilled"]["exemption"] = $services['non_chilled_delivery']['value'];



		return $cart;

	}

	
	public function setReference(){

		if($this->reference==''){
			$models = Setting::raw()->findAndModify(
		    	['_id' => 'invoice'],
	            ['$inc' => ['serial' => 1]],
	            null,
	            ['new' => true, 'upsert' => true]
		    );
			$reference = "ADSG".$models['serial'];
		}else{
			
			if(str_contains($this->reference,'E'))
				$referencepart = explode('E',$this->reference);
			else
				$referencepart = explode('O',$this->reference);
			
			$reference = $referencepart[0];
		}

		$reference.="E";			
		$offset = strtotime('+8 hours');//ADD OFFSET SO TIME WILL BE EQUAL TO SINGAPORE TIMEZONE
		$reference.= (string)date("Hi",$offset);
		$this->reference = $reference;
		
	}

}
