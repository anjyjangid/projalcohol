<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Coupon;
use AlcoholDelivery\Cart;

use Illuminate\Support\Facades\Auth;
use MongoId;
use DateTime;

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

		$user = Auth::user('user');
		$userId = new MongoId($user->_id);

		if(isset($params['coupon'])){

			$query = [
				[
					'$match' => [
									"code" => ['$regex'=>new \MongoRegex('/^'.$params['coupon'].'$/i')]
								]
				],
				[
					'$project' => [
									'code' => 1,
									'name' => 1,
									'type' => 1,
									'discount' => 1,
									'total' => 1,
									'coupon_uses' => 1,
									'customer_uses' => 1,
									'start_date' => 1,
									'end_date' => 1,
									'status' => 1,
									'csvImport' => 1,
									'products' => 1,
									'categories' => 1,
									'updated_at' => 1,
									'discount_status' => 1,
									'used_count' => 1,
									'used_list' => [
										'$filter' => [
											'input'=> '$used_list',
											'as'=> "usedList",
											'cond'=> [ '$eq' => [ '$$usedList.userId', $userId ] ]
										]
									]
								]
				]
			];

			$couponData = Coupon::raw()->aggregate($query);
			
			if(count($couponData['result'])>0){
				$couponData = (object)$couponData['result'][0];
			}
		}

		if(isset($couponData->_id)){
			
			if(strtotime($couponData->start_date)<= time() && strtotime($couponData->end_date. ' + 1 days')>= time()){
				
				$userCouponCnt = 0;

				//CHECK COUPON USED BY USER
				// if($couponData->customer_uses){
				// 	$subQuery = array();
				// 	$subQuery[]['$match'] = [
				// 	"code" => ['$regex'=>new \MongoRegex('/^'.$params['coupon'].'$/i')]
				// 	];

				// 	$subQuery[]['$unwind'] = '$used_list';
				// 	$subQuery[]['$match'] = ['used_list.userId'=> $userId];
				// 	$subQuery[]['$group'] = ['_id'=> NULL, 'number'=> array('$sum'=>1)];
					
				// 	$couponData1 = Coupon::raw()->aggregate($subQuery);
					
				// 	if(isset($couponData1['result'][0]))
				// 		$userCouponCnt = $couponData1['result'][0]['number'];
				// }
				
				$userCouponCnt = count($couponData->used_list);

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
