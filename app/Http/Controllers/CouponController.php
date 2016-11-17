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
                
                $userCouponCnt = 0;
                $userId = 1;

                //CHECK COUPON USED BY USER
                if($couponData->customer_uses){
                    $subQuery = array();
                    $subQuery[]['$match'] = [
                    "code" => ['$regex'=>new \MongoRegex('/^'.$params['coupon'].'$/i')]
                    ];

                    $subQuery[]['$unwind'] = '$used_list';
                    $subQuery[]['$match'] = ['used_list.userId'=> $userId];
                    $subQuery[]['$group'] = ['_id'=> NULL, 'number'=> array('$sum'=>1)];
                    
                    $couponData1 = Coupon::raw()->aggregate($subQuery);
                    
                    $userCouponCnt = $couponData1['result'][0]['number'];
                }                
                
                if((isset($couponData->used_count) && $couponData->coupon_uses && $couponData->coupon_uses <= $couponData->used_count) || ( $userCouponCnt && $couponData->customer_uses <= $userCouponCnt) ){
                    $errorCode = 2;
                    $msg = 'Coupon Code Expired';
                }else{
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

                    if(!empty($couponData->products)){
                        foreach ($couponData->products as $pValue) {
                            $getObj = get_object_vars($pValue);
                            $productList[] = $getObj['$id'];
                        }
                        $couponData->products = $productList;
                    }

                    if(!empty($couponData->categories)){
                        foreach ($couponData->categories as $pValue) {
                            $getObj = get_object_vars($pValue);
                            $catList[] = $getObj['$id'];
                        }
                        $couponData->categories = $catList;
                    }

                    $coupon = $couponData;
                }                
            }else{
                $errorCode = 2;
                $msg = 'Coupon Code Expired';
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
