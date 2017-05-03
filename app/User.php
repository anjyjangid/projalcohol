<?php

namespace AlcoholDelivery;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;
use MongoId;

use GuzzleHttp\Client;
use DB;
class User extends Eloquent implements AuthenticatableContract,
									AuthorizableContract,
									CanResetPasswordContract
{
	use Authenticatable, Authorizable, CanResetPassword;

	
	protected $collection = 'user';

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	//protected $table = 'users';

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [
		'name',
		'email',
		'password',
		'fbid',
		'gplusid',
		'twitterid',
		'instagramid',
		'country_code',
		'mobile_number',
		'alternate_number',
		'email_key',
		'status',
		'verified',
		'productAddedNotification',
		'savedCards',
		'reffered',
		'socialData',
		'fblike'
	];

	public function getFields(){
		$fields = $this->fillable;
		$ret = [];
		foreach ($fields as $key => $value) {
			$ret[$value] = '$'.$value;
		}

		return $ret;
	}

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = ['password', 'remember_token'];

	// ykb 28-apr-2016 //
	public function getCustomers($params = array()){

		$customer = $this->where('_id','=', $params['key']);

		if(isset($params['multiple']) && $params['multiple']){
			$customer = $customer->get();
		}else{
			$customer = $customer->first();
		}
		
		return $customer;

	}      

	public static function searchLocation($searchVal,$live = false){
		
		$searchVal = urlencode($searchVal);

		$json = json_decode(file_get_contents('https://developers.onemap.sg/commonapi/search?searchVal='.$searchVal.'&returnGeom=Y&getAddrDetails=Y&pageNum=1'), true);

		if(!empty($json) && isset($json['results']) && !empty($json['results'])){
			return $json['results'];
		}else{
			return [];
		}

		$token = '';

		$cTimestamp = (int)strtotime(date('Y-m-d'));

		$getToken = DB::collection('settings')->where('_id', 'mapSearch')->where('validity', $cTimestamp)->first();

		if($getToken){
			$token = $getToken['token'];
		}else{

			$accessKEY = 'vPBfQM5FomGus4Wx/0jfJcOcuoAHJPlR9LWiFrvt6BQFxSvcqeNC1dpYT5AA81WHIKKMzVnUP2c4OQEpmLtXaaYuuy2aaKF0w+unBoHjxYKh0zu0V8StFlU3iVTlLyOe|3Aq1GbPZzAY=';

			$fetchToken = json_decode(file_get_contents('http://www.onemap.sg/API/services.svc/getToken?accessKEY='.$accessKEY), true);

			if(isset($fetchToken['GetToken'][0]['NewToken'])){
				$token = $fetchToken['GetToken'][0]['NewToken'];
				DB::collection('settings')->raw()->update(['_id'=>'mapSearch'],['$set'=>['validity'=>$cTimestamp,'token'=>$token]],['upsert'=>true,'multi'=>false]);    
			}
			
		}

		$searchVal = urlencode($searchVal);

		/*$json = json_decode(file_get_contents('http://www.onemap.sg/API/services.svc/basicSearch?token='.$token.'&wc=SEARCHVAL%20LIKE%20%27$'.$searchVal.'$%27&returnGeom=0&rset=1&getAddrDetl=Y'), true);

		$json2 = json_decode(file_get_contents('http://www.onemap.sg/APIV2/services.svc/basicSearchV2?token='.$token.'&wc=SEARCHVAL%20LIKE%20%27$'.$searchVal.'$%27&returnGeom=0&rset=1&projSys=WGS84'), true);*/

		$json = json_decode(file_get_contents('http://www.onemap.sg/API/services.svc/basicSearch?token='.$token.'&searchVal='.$searchVal.'&returnGeom=0&rset=1&getAddrDetl=Y'), true);

		$json2 = json_decode(file_get_contents('http://www.onemap.sg/APIV2/services.svc/basicSearchV2?token='.$token.'&searchVal='.$searchVal.'&returnGeom=0&rset=1&projSys=WGS84'), true);

		$response = [];

		if(isset($json['SearchResults']) && isset($json['SearchResults'][0]['PageCount'])){
			foreach ($json['SearchResults'] as $key => $value) {                
				if(isset($value['PageCount'])) continue;

				if(isset($value['PostalCode']) && trim($value['PostalCode']) == '') continue;
				
				$value['LAT'] = $json2['SearchResults'][$key]['Y'];
				$value['LNG'] = $json2['SearchResults'][$key]['X'];
				$response[] = $value;
			} 

			if(isset($response[0]['ErrorMessage'])){
			  $response = [];  
			}          
		}

		return $response;    
	 }

	public function setContact ($number,$code=65,$isDefault=false) {

		if($isDefault){

			$this->__set('mobile_number',$number);
			$this->__set('country_code',$code);

		}else{

			$alternateNum = is_array($this->alternate_number)?$this->alternate_number:[];

			if(!in_array($number,$alternateNum)){

				$this->__set('alternate_number',array_merge($alternateNum, [$code.$number]));

			}

		}

		try{

			$this->save();
			return ["success"=>true,"message"=>'contact saved'];

		}catch(\Exception $e){

			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'User set contact'
				]);

			return ["success"=>false,"message"=>"unable to save contact"];

		}

		
	}
	
}
