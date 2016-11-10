<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Coupon;
use AlcoholDelivery\Cart;

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
        
        $totalItem = 0;
        $errorCode= 0;
        $coupon = array();

        $couponData = Coupon::where('code', 'regexp', '/^'.$params['coupon'].'$/i')->where(['status'=>1])->first();

        if($couponData->_id){
           if(strtotime($couponData->start_date)<= time() && strtotime($couponData->end_date)>= time()){
            unset($couponData->start_date);
            unset($couponData->end_date);
            unset($couponData->csvImport);
            unset($couponData->name);
            unset($couponData->updated_at);
            unset($couponData->_id);
            unset($couponData->code);
            unset($couponData->status);

            $coupon = $couponData;
           }
        }else{
            $errorCode= 1; 
        }


        $response = [
            'errorCode' => $errorCode,
            'coupon' => $coupon,
        ];

        return response($response, 200);
    }
}
