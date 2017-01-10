<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use AlcoholDelivery\Dontmiss;
use AlcoholDelivery\Products;
use AlcoholDelivery\Cart;
use mongoId;
use DB;

class SuggestionController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 *
	**/

	public function getDontmiss($cartKey, Request $request)
	{
		
		$cart = Cart::findUpdated($cartKey);
		
		if(empty($cart)){
			return response(["message"=>"Cart not found"],405);
		}

		$productWithCount = $cart->getProductIncartCount();
		$proInCartIds = array_keys($productWithCount);

		// foreach ($proInCartIds as $key => &$value) {
		// 	$value = new mongoId($value);
		// }

		$quantity = Dontmiss::first(['quantity']);

		if($quantity)
			$quantity = $quantity->quantity;
		else
			$quantity = 0;

		$params = $request->all();

		$product = new Products;

		$result = $product->fetchDontMissProducts(["id"=>$proInCartIds,"quantity"=>$quantity]);

		if($result['success']){

			$result = $result['product'];
			return response($result, 200);

		}else{

			return response($result, 400);

		}
	}

}
