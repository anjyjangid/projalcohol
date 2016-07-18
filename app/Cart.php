<?php

namespace AlcoholDelivery;

use Moloquent;

use AlcoholDelivery\Setting as Setting;
use AlcoholDelivery\Products as Products;

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
	protected $fillable = ['_id', 'products', 'packages', 'giftCards', 'nonchilled', 'delivery','service','discount','timeslot','payment','status','user'];

	public function setKey($keyVal){
		$this->key = $keyVal;
	}

	public function setServices($cart){

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value'])->first();

		$services = $services['settings'];

		$cart["service"]["express"]["charges"] = $services['express_delivery']['value'];
		$cart["smoke"]["charges"] = $services['cigratte_services']['value'];

		$cart["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value'],
							];

		$cart["discount"]["nonchilled"]["exemption"] = $services['non_chilled_delivery']['value'];

		return $cart;

	}

	public function generate(){

		$cart = [

			"products" => [],
			"packages" => [],
			"promotions" => [],
			"delivery" => [
				"type" => 1,
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
			"user" => null
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

		$cart = self::find($id);

		if(empty($cart)){
			return false;
		}

		$services = Setting::where("_id","=","pricing")->get(['settings.express_delivery.value','settings.cigratte_services.value','settings.non_chilled_delivery.value','settings.minimum_cart_value.value','settings.non_free_delivery.value'])->first();

		$services = $services['settings'];

		$cartServices = $cart->service;

		$cartServices["express"]["charges"] = $services['express_delivery']['value'];
		$cartServices["smoke"]["charges"] = $services['cigratte_services']['value'];

		$cartServices["delivery"] = [
								"free" => false,
								"charges" => $services['non_free_delivery']['value'],
								"mincart" => $services['minimum_cart_value']['value'],
							];

		$cart->service = $cartServices;							

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

	public function getProductIncartCount($data){
		
		$products = [];

		if(isset($data['products'])){
			foreach($data['products'] as $key=>$product){
				
				$products[$key] = (int)$product['chilled']['quantity'] +  (int)$product['nonchilled']['quantity'];

			}
		}

		if(isset($data['packages'])){
		foreach($data['packages'] as $key=>$package){
			
			foreach($package['packageItems'] as $packageItem){

				foreach($packageItem['products'] as $product){

					if($product['cartquantity']>0){

						if(isset($products[$product['_id']])){

							$products[$product['_id']] = (int)$products[$product['_id']] + ($package['packageQuantity'] * (int)$product['cartquantity']);

						}else{

							$products[$product['_id']] = (int)$package['packageQuantity'] * (int)$product['cartquantity'];

						}
						

					}

				}			

			}

		}
		}

		if(isset($data['promotions'])){
			foreach($data['promotions'] as $promotion){

				if(isset($products[$promotion['productId']])){

					$products[$promotion['productId']]++;

				}else{

					$products[$promotion['productId']] = 1;

				}

			}
		}

		return $products;

	}

	public function getAllProductsInCart($data){

		$products = $this->getProductIncartCount($data);

		$productObj = new products();
		$productsIdInCart = array_keys($products);

		$productsInCart = $productObj->getProducts(
											array(
												"id"=>$productsIdInCart,
												"fields"=>[
															"quantity",
															"maxQuantity",
															"outOfStockType",
															"availabilityDays",
															"availabilityTime",
															"status",
															"price",
															"loyalty",
															"loyaltyType",
														],
												// "with"=>["discounts"]
											)
										);

		foreach($productsInCart as $key=>$pic){

			$productsInCart[$pic['_id']] = $pic;
			$productsInCart[$pic['_id']]['count'] = $products[$pic['_id']];

			unset($productsInCart[$key]);

		}

		return $productsInCart->toArray();

	}

}
