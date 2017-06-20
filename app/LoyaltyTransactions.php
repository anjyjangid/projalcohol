<?php

namespace AlcoholDelivery;

use Moloquent;

use DB;

use MongoId;

use MongoDate;

use Log;

use AlcoholDelivery\User;

class LoyaltyTransactions extends Moloquent
{
    
    protected $primaryKey = "_id";
    protected $collection = 'loyaltyTransactions';
	
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

						'type', //1=>credit , 0=> debit/
						'points',
						'method', // 0=>'Order',1=>
						'reference',
						'user',
						'comment',
						'extra' // this contain all extra detail we need to parse this transaction on view side
					];
    
    public function getLoyalty($userId,$params = []){

		$limit = isset($params['limit'])?(int)$params['limit']:10;

		$offset = (int)$params['start'] * $limit;

		try{

			$count = DB::collection('loyaltyTransactions')->where('user', new MongoId($userId))->count();

			$loyalty = DB::collection('loyaltyTransactions')->where('user', new MongoId($userId))->orderBy('_id','desc')->skip($offset)->take($limit)->get();

			return ['success'=>true,'transactions'=>$loyalty,'count'=>$count];

		}catch(\Exception $e){

			Log::warning("Get Credits : ".$e->getMessage());
			return ['success'=>false,'message'=>$e->getMessage()];

		}
		
	}

	/*******************************************
	*
	* Method to manage all loyalty transactions
	* @type : credited or debited
	* @tData : transaction object
	* @user : user model object
	*
	********************************************/
	public static function transaction ($type,$tData,$user) {

		if(!($user instanceof User)) {
			if(MongoId::isValid($user)){
				$user = User::find($user);
				if(empty($user)){
					return false;
				}
			}
		}
		
		$loyaltyObj = [
					"type"=>$type=='credit'?1:0,
					"points"=>$tData['points'],
					"method"=>$tData['method'],
					"reference" => $tData['reference'],
					"user" => new mongoId($user->_id)
				];

		if(isset($tData['extra'])){
			$loyaltyObj['extra'] = $tData['extra'];
		}

		$totalInAcc = isset($user->loyalty['total'])?$user->loyalty['total']:0;
		$recentEarned = 0;

		if(isset($user->loyalty['recent']['earned'])){
			$recentEarned = $user->loyalty['recent']['earned'];
		}

		switch ($type) {

			case 'credit':

				switch ($loyaltyObj['method']) {
					case 'order':
						$loyaltyObj['shortComment'] = 'Earned from purchase';
						$loyaltyObj['comment'] = 'You have earned this points by making a purchase';
						break;					
					default:
						# code...
						break;
				}

				$user->__set('loyalty', [

					'total'=> $totalInAcc + $tData['points'],
					'recent' => [
						'earned'=>$tData['points']
					]

				]);

				break;
			
			default:
				switch ($loyaltyObj['method']) {
					case 'order':
						$loyaltyObj['shortComment'] = 'Used in order';
						$loyaltyObj['comment'] = 'You have used this points in an order';
					break;

					case 'exchange':
						$loyaltyObj['shortComment'] = 'Exchange loyalty';
						$loyaltyObj['comment'] = 'You have used this points in exchange of credits';
					break;
					
					default:
						# code...
						break;
				}

				$user->__set('loyalty', [

					'total'=> $totalInAcc - $tData['points'],
					'recent' => [
						'earned'=>$recentEarned
					]

				]);
				break;
		}

		if(isset($tData['shortComment']) && !empty($tData['shortComment'])){
			$loyaltyObj['shortComment'] = $tData['shortComment'];
		}
		if(isset($tData['comment']) && !empty($tData['comment'])){
			$loyaltyObj['comment'] = $tData['comment'];
		}
		
		//jprd($user);
		//prd($loyaltyObj);
		
		try{

			$user->save();
			self::create($loyaltyObj);

			return ['success'=>true];

		}catch(\Exception $e){

			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Insert/Remove credits data:'.json_encode($loyaltyObj)
				]);

		}

		return ['success'=>false];
		
	}

}
