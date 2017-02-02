<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Holiday extends Eloquent
{
	protected $primaryKey = "_id";
	protected $collection = 'holidays';

	protected $fillable = [
		'title',
		'start',
		'd',
		'm',
		'y',
		'allDay',        
		'dow',
		'timeStamp'
	];


	public function getHolidays($params){        

		$holidays = Holiday::whereBetween('timeStamp', [$params['start'], $params['end']])->orWhere('_id','weekdayoff')->get(["_id","dow","timeStamp"]);
		
		return $holidays->toArray();

	}

	public static function getDateWithWorkingDays($workingDaysRequired,$holidays){

		$sgtTimeStamp = strtotime("+8 hours");
		$currAvailDate = strtotime(date('Y-m-d',$sgtTimeStamp));
		$aDayTimeStamp = 86400;
		
		while ($workingDaysRequired) {
			
			if($workingDaysRequired)
			$currAvailDate+=$aDayTimeStamp;

			if(!self::isHoliday($holidays,$currAvailDate))
				--$workingDaysRequired;	

		}

		return $currAvailDate;

	}

	public static function isHoliday($holidays,$currDateTimeStamp){
		
		$weekdayoff = date("w",$currDateTimeStamp);
		$isHoliday = false;
		foreach ($holidays as $holiday) {

			if($holiday['_id']==='weekdayoff'){				
				if(in_array($weekdayoff, $holiday['dow']))
				$isHoliday = true;
				
			}else{

				$currDateTimeStampHoliVersion = $currDateTimeStamp * 1000;
				if($currDateTimeStampHoliVersion == $holiday['timeStamp']){				
					$isHoliday = true;
				}				

			}
			
			if($isHoliday){
				break;
			}

		}

		return $isHoliday;

		prd($isHoliday);

		pr($holidays);
		prd($currDateTimeStamp);

		date_default_timezone_set('Asia/Singapore');
		$cDate = strtotime(date("Y-m-d")." + ".$currentDayPlus." days");
		$dDate = strtotime(date("Y-m-d"));
		pr(date("Y-m-d"));
		pr($dDate);
		prd($cDate);
		date("w",$availTime);
		$dayofdate = cDate.getDay();
		if($scope.weekdayoff.dow.indexOf(dayofdate) !== -1){
		return true;
		}
		// $tsofdate = cDate.getTime();

		// $isPh = $filter('filter')(holiDays,{timeStamp:tsofdate});
		// if(typeof isPh[0] !== 'undefined'){
		// return true;
		// }else{
		// return false;
		// }
	}

}
