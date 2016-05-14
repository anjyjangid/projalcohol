<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Cart as Cart;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Products as Products;
use AlcoholDelivery\Setting as Setting;
use AlcoholDelivery\Orders as Orders;
use MongoDate;
use MongoId;

class OrderController extends Controller
{
	public function getSummary(Request $request,$id)
	{	

		$user = Auth::user('user');

		$order = Orders::where("_id",'=',$id)->where("user",'=',new MongoId($user->_id))->orderBy('created_at', 'desc')->first();

		$order->dop = strtotime($order->created_at);
		
		return response($order,200);
	}
}
