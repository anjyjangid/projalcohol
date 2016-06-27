<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use AlcoholDelivery\User as User;

use DB;

use MongoId;

class Loyalty extends Model
{
	public function getLoyalty($userId,$params = []){

		$offset = (int)$params['start'];

		$limit = isset($params['limit'])?(int)$params['limit']:10;

		$loyalty = DB::collection('user')->where('_id', $userId)->project(['loyalty' => array('$slice' => [$offset,$limit])]);
	
		$loyalty = $loyalty->first(['loyalty']);		

		return $loyalty['loyalty'];

	}

	public function getLoyaltyStatics($userId){

		$statics = DB::collection('user')->raw(function($collection) use($userId){

			return $collection->aggregate(array(
				array(
					'$match' => array(
						'_id' => new MongoId($userId)
					)
				),				
				array(
					
					'$unwind' => '$loyalty'

				),
				array(

					'$group' => array(

						'_id' => '$loyalty.type',

						'credit' => array(
							
							'$sum' => '$loyalty.points',

						),
						'points' => array(

							'$last'=>'$loyalty.points'

						),
						'count' => array(

							'$sum'=>1

						)

					)

				),
				// array(
				// 		'$sort' => array('loyalty.on'=>-1)
				// ),
				// array(
				// 		'$skip' => 0
				// ),				
				// array(
				// 		'$limit' => 1
				// )
			));
		});

		if(isset($statics['result'])){
			return $statics['result'][0];
		}
		
		return $statics;

	}
	
}
