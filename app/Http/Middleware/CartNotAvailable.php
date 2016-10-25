<?php

namespace AlcoholDelivery\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Cart as Cart;

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

				$cartKey = \Route::current()->getParameter('cartKey');

				if(empty($cartKey)){
					break;
				}

				$cart = Cart::find($cartKey);

				if(empty($cart)){

					$response['success'] = false;
					$response['message'] = "Cart not found";

				}


			break;

		}
		
		if(!$response['success']){
			return response($response,406);
		}

		return $next($request);
	}
}
