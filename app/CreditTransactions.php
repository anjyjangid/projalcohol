<?php

namespace AlcoholDelivery;

use Moloquent;

use DB;

use MongoId;

use MongoDate;

use Log;

use AlcoholDelivery\User;

class CreditTransactions extends Moloquent
{
    
    protected $primaryKey = "_id";
    protected $collection = 'creditTransactions';
	
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
						'credit',
						'method', // 0=>'Order',1=>
						'reference',
						'user',
						'comment'
					];
    
    public function getCredits($userId,$params = []){

		$offset = (int)$params['start'];

		$limit = isset($params['limit'])?(int)$params['limit']:10;

		try{

			$count = DB::collection('creditTransactions')->where('user', new MongoId($userId))->count();

			$credits = DB::collection('creditTransactions')->where('user', new MongoId($userId))->orderBy('_id','desc')->skip($offset)->take($limit)->get();

			return ['success'=>true,'transactions'=>$credits,'count'=>$count];

		}catch(\Exception $e){

			Log::warning("Get Credits : ".$e->getMessage());
			return ['success'=>false,'message'=>$e->getMessage()];

		}
		
	}

	/*******************************************
	*
	* Method to manage all credit transactions
	* @type : credited or debited
	* @tData : transaction object
	* @user : user model object
	*
	*******************************************/
	public static function transaction ($type,$tData,$user) {

		if(!($user instanceof User)) {
			if(MongoId::isValid($user)){
				$user = User::find($user);
				if(empty($user)){
					return false;
				}
			}
		}
		
		$creditObj = [
					"type"=>$type=='credit'?1:0,
					"credit"=>$tData['credit'],
					"method"=>$tData['method'],
					"reference" => $tData['reference'],
					"user" => new mongoId($user->_id)
				];

		$totalInAcc = 0;
		$recentEarned = 0;

		if(isset($user->credits['total'])){
			$totalInAcc = $user->credits['total'];
		}

		if(isset($user->credits['recent']['earned'])){
			$recentEarned = $user->credits['recent']['earned'];
		}


		switch ($type) {

			case 'credit':

				switch ($creditObj['method']) {
					case 'order':
						$creditObj['shortComment'] = 'Earned In loyalty Exchange';
						$creditObj['comment'] = 'You have earned this credits in exchange of loyalty points';
						break;
					
					default:
						# code...
						break;
				}

				$user->__set('credits', [

					'total'=> $totalInAcc + $tData['credit'],
					'recent' => [
						'earned'=>$tData['credit']
					]

				]);

				break;
			
			default:
				switch ($creditObj['method']) {
					case 'order':
						$creditObj['shortComment'] = 'Used in order';
						$creditObj['comment'] = 'You have used this credits to pay for an order';
						break;
					
					default:
						# code...
						break;
				}

				$user->__set('credits', [

					'total'=> $totalInAcc - $tData['credit'],
					'recent' => [
						'earned'=>$recentEarned
					]

				]);
				break;
		}

		try{

			$user->save();
			self::create($creditObj);

			return ['success'=>true];

		}catch(\Exception $e){

			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Insert/Remove credits data:'.json_encode($creditObj)
				]);

		}

		return ['success'=>false];
		
	}

}
