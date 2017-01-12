<?php

namespace AlcoholDelivery\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Cart as Cart;
use MongoId;

class CartNotAvailable
{
	/**
	 * Handle an incoming request and redirect to myacount if profile and neccessary info not completed
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @param  string|null  $guard
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{

		$method = $request->getMethod();
		$response = [
			"success" => true,
			"message" => ""
		];

		switch($method){

			case "PUT":
			case "DELETE":
			case "POST":
			case "GET":

				$cart = \Route::current()->getParameter('cart'); // for Controllers resource created action routes
				$cartKey = \Route::current()->getParameter('cartKey'); 
				
				$cartKey = empty($cartKey)?$cart:$cartKey;

				if(empty($cartKey)){
					break;
				}

				$cart = "";
				if(MongoId::isValid($cartKey)){
					$cart = Cart::find($cartKey);
				}

				if(empty($cart)){

					$response['success'] = false;
					$response['message'] = "Cart not found";
					$response['reset'] = 'cart';
					$response['refresh'] = true;

				}


			break;

		}
		
		if(!$response['success']){
			return response($response,412);
		}

		return $next($request);
	}
}
