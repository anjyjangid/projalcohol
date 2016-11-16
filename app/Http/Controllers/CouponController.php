<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Coupon;
use AlcoholDelivery\Cart;

use MongoId;

class CouponController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    
    /**
     * Checks wheather coupon code is valid.
     *
     * @return \Illuminate\Http\Response
     */
    public function checkCoupon(Request $request){
        $params = $request->all();

        extract($params);
        
        $errorCode = 0;
        $msg = '';
        $coupon = array();

        if(isset($params['coupon'])){
            $couponData = Coupon::where('code', 'regexp', '/^'.$params['coupon'].'$/i')->where(['status'=>1])->first();
        }        

        if(isset($couponData->_id)){
           if(strtotime($couponData->start_date)<= time() && strtotime($couponData->end_date)>= time()){

            if(isset($params['cart'])){
                $cart = Cart::find($params['cart']);
                $cart->coupon = new MongoId($couponData->_id);
                $cart->save();
            }

            unset($couponData->start_date);
            unset($couponData->end_date);
            unset($couponData->csvImport);
            unset($couponData->name);
            unset($couponData->updated_at);
            unset($couponData->_id);
            unset($couponData->code);
            unset($couponData->status);
            unset($couponData->coupon_uses);
            unset($couponData->customer_uses);

            $coupon = $couponData;
           }
        }else{
            $errorCode = 1;
            $msg = 'Invalid Coupon Code';
        }

        if($errorCode==1 || (isset($params['removeCoupon']) && $params['removeCoupon']==1)){
            if(isset($params['cart'])){
                $cart = Cart::find($params['cart']);
                $cart->coupon = '';
                $cart->save();
            }
        }

        $response = [
            'errorCode' => $errorCode,
            'coupon' => $coupon,
            'msg'=> $msg,
        ];

        return response($response, 200);
    }
}
