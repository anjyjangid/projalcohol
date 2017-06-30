<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\CustomerRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;
use MongoDate;
use AlcoholDelivery\User;
use AlcoholDelivery\UserImport;
use AlcoholDelivery\Email;
use AlcoholDelivery\oldResultantUsers;
use AlcoholDelivery\zipCodeAddress;
use DB;

class CustomerController extends Controller
{
	/**
	* Create a new controller instance.
	*
	* @return void
	*/
	public function __construct()
	{
		
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function deleteAddress($userId,$id)
	{

		$user = User::find($userId);

		$address = $user->__get("address");
		
		$addressToPull = (array)$address[$id];

		$user->pull("address",$addressToPull);		

		$return = array("success"=>false,"message"=>"","data"=>""); 

		try {						
		
			unset($address[$id]);

			$return['address'] = array_values($address);
			$return['success'] = true;
			$return['message'] = "Address successfully removed";
						
		} catch(\Exception $e){
			$return['message'] = $e->getMessage();//$e->getMessage();
		}

		return response($return);

	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index(Request $request)
	{
		$params = $request->all();
		$users = new User;

		$columns = ['name','email','status','_id','mobile_number','address'];

		if(isset($params['name']) && trim($params['name'])!=''){
		  $pname = $params['name'];
		  $users = $users->where('name','regexp', "/.*$pname/i");
		  $users = $users->orderBy('name','asc')->get();
		}

		if(isset($params['mobile_number']) && trim($params['mobile_number'])!=''){
			$pmobile_number = $params['mobile_number'];
			$users = $users->where('mobile_number','regexp',"/.*$pmobile_number/i");
			$users = $users->orderBy('mobile_number','desc')->get();
		}

		return response($users);
	}

	public function getAddresses($id) {
		$user = new User;

		$user = $user->where('_id', $id)->first(['address']);

		$addresses = [];
		if(!empty($user) && !empty($user['address']))
			foreach ($user['address'] as $address) {
				$addresses[] = $address;
			}

		$user['address'] = $addresses;

		return response($user);
	}

		

	public function getAutocomplete($col, Request $request)
	{
		$params = $request->all();
		$users = new User;

		$params['q'] = trim($params['q']);

		if(!isset($params['q']) || empty($params['q'])) {	
			return response([],200);
		}

		if($col == 'mobile_number'){

			$project = [
							'name'=>1,
							'email'=>1,
							'mobile_number'=>1,
							'alternate_number' => 1,
							'savedCards' => 1
						];

			$query[]['$project'] = $project;

			$s = "/".$params['q']."/i";
			$query[]['$match'] = ['$or' => [
						['mobile_number' => ['$regex'=>new \MongoRegex($s)]],
						['alternate_number' => ['$regex'=>new \MongoRegex($s)]]		
				]];

			$model = User::raw()->aggregate($query);
			return response($model['result']);
			
		}

		$columns = ['name','email','mobile_number','savedCards'];

		$users = $users->where($col,'regexp', "/.*".$params['q']."/i");
		return response($users->get($columns));
		
		
	}

	public function postSave(CustomerRequest $request)
	{
		$inputs = $request->all();

		$customer = user::where('email', '=', $inputs['email'])->first();

		if(empty($customer)) {
			if(empty($inputs['password'])){
				$chars = "abcdefghijklmnopqrstuvwxyz0123456789";
				$inputs['password'] = substr( str_shuffle( $chars ), 0, 6 );
			}

			try {

				$user = User::create([
					'name' => $inputs['name'],
					'mobile_number' => $inputs['mobile_number'],
					'email' => $inputs['email'],
					'password' => bcrypt($inputs['password']),
					'status' => 1,
					'verified' => 1,
					'createdVia' => 'E'
				]);
			
			} catch(\Exception $e){
				
				return response(array("success"=>false,"message"=>$e->getMessage()));
					
			}

			$email = new Email('login');
			$email->sendEmail($inputs);
			
			return response(array("success"=>true,"message"=>"Customer created successfully", '_id'=>$user->_id));
		}
		else {
			$customer = user::find($inputs['_id']);
			
			$customer->name = $inputs['name'];
			$customer->email = $inputs['email'];
			$customer->mobile_number = $inputs['mobile_number'];
			
			if($customer->save()){
				return response(array("success"=>true,"message"=>"Customer updated successfully"));
			}
			
			return response(array("success"=>false,"message"=>"Something went wrong"));
		}

	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function create()
	{
		//
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function postStore(CustomerRequest $request)
	{
		$inputs = $request->all();

		if(empty($inputs['password'])){
			$chars = "abcdefghijklmnopqrstuvwxyz0123456789";
			$inputs['password'] = substr( str_shuffle( $chars ), 0, 6 );
		}

		try {

			$user = User::create([

				'name' => $inputs['name'],
				'country_code' => (int)$inputs['country_code'],
				'mobile_number' => $inputs['mobile_number'],
				'email' => $inputs['email'],
				'password' => bcrypt($inputs['password']),
				'status' => 1,
				'verified' => 1,

			]);
		
		} catch(\Exception $e){
			
			return response(array("success"=>false,"message"=>$e->getMessage()));
				
		}

		$email = new Email('login');
		$email->sendEmail($inputs);
		
		return response(array("success"=>true,"message"=>"Customer created successfully"));
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function show($id)
	{
		//
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function edit($id)
	{
		//
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	**/
	public function postUpdate(CustomerRequest $request, $id)
	{
		$inputs = $request->all();

		$customer = user::find($id);
		
		$customer->name = $inputs['name'];
		$customer->email = $inputs['email'];
		//$customer->password = bcrypt($inputs['password']);
		$customer->status = (int)$inputs['status'];    
		$customer->mobile_number = $inputs['mobile_number'];
		$customer->country_code = (int)$inputs['country_code'];

		if($customer->save()){
			return response(array("success"=>true,"message"=>"Customer updated successfully"));
		}
		
		return response(array("success"=>false,"message"=>"Something went wrong"));
		
	}


	public function getDetail($customerId)
	{
		$customerObj = new User;

		$result = $customerObj->getCustomers(array(
						"key"=>$customerId,
						"multiple"=>false
					));
		
		return response($result, 201);
	}


	public function postList(Request $request)
	{
		$params = $request->all();

		extract($params);

		$columns = ['_id','smallTitle','email','status','verified'];

		$project = ['title'=>1,'status'=>1,'email'=>1,'name'=>1,'mobile_number'=>1,'verified'=>1,'email_key'=>1,'updated_at' => 1];

		$query = [];        
		
		$project['smallTitle'] = ['$toLower' => '$name'];
		
		$query[]['$project'] = $project;

		if(isset($name) && trim($name)!=''){
			$s = "/".$name."/i";
			$query[]['$match']['name'] = ['$regex'=>new \MongoRegex($s)];
		}

		if(isset($email) && trim($email)!=''){
			$s = "/".$email."/i";
			$query[]['$match']['email'] = ['$regex'=>new \MongoRegex($s)];
		}

		if(isset($status) && trim($status)!=''){            
			$query[]['$match']['status'] = (int)$status;
		}

		if(isset($verified) && trim($verified)!=''){            
			$query[]['$match']['verified'] = (int)$verified;
		}

		if(isset($mobile_number) && trim($mobile_number)!=''){            
			$s = "/".$mobile_number."/i";
			$query[]['$match']['mobile_number'] = ['$regex'=>new \MongoRegex($s)];
		}

		$sort = ['updated_at'=>-1];

		if(isset($params['order']) && !empty($params['order'])){
			
			$field = $columns[$params['order'][0]['column']];
			$direction = ($params['order'][0]['dir']=='asc')?1:-1;
			$sort = [$field=>$direction];            
		}

		$query[]['$sort'] = $sort;

		$model = User::raw()->aggregate($query);

		$iTotalRecords = count($model['result']);

		$query[]['$skip'] = (int)$start;
        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = User::raw()->aggregate($query);
        }          
		//return response($query);

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']
        ];

        if(!empty($isExportData)){
        	// Export data as CSV
            $filename = "customers_".mt_rand().time().".csv";
            $filepath = storage_path()."/download/".$filename;
            $handle = fopen($filepath, 'w+');
		    fputcsv($handle, array('Sr.','Name','Email','Contact','Status','Verification'));
		    $i = 1;
		    foreach($model['result'] as $row){
		    	$name = !empty($row['name'])?$row['name']:"Not Set";
		    	$email = !empty($row['email'])?$row['email']:"";
		    	$contact = !empty($row['mobile_number'])?$row['mobile_number']:"";
		    	$status = isset($row['status']) && $row['status']==1?"Active":"In Active";
		    	$verification = isset($row['verified']) && $row['verified']==1?"Verified":"Not verified";
		        fputcsv($handle, array($i, $name, $email, $contact, $status, $verification));
		        $i++;
		    }
		    fclose($handle);
			$response = array("file"=>$filename);
        }

        return response($response,200);
	}

	public function postImportList(Request $request)
	{
		$params = $request->all();

		extract($params);

		$columns = ['_id','smallTitle','email','status','verified'];

		$project = ['title'=>1,'status'=>1,'email'=>1,'name'=>1,'mobile_number'=>1,'verified'=>1,'email_key'=>1];

		$query = [];
		
		$project['smallTitle'] = ['$toLower' => '$name'];
		
		$query[]['$project'] = $project;

		if(isset($name) && trim($name)!=''){
			$s = "/".$name."/i";
			$query[]['$match']['name'] = ['$regex'=>new \MongoRegex($s)];
		}

		if(isset($email) && trim($email)!=''){
			$s = "/".$email."/i";
			$query[]['$match']['email'] = ['$regex'=>new \MongoRegex($s)];
		}

		if(isset($status) && trim($status)!=''){            
			$query[]['$match']['status'] = (int)$status;
		}

		if(isset($verified) && trim($verified)!=''){            
			$query[]['$match']['verified'] = (int)$verified;
		}

		if(isset($mobile_number) && trim($mobile_number)!=''){            
			$s = "/".$mobile_number."/i";
			$query[]['$match']['mobile_number'] = ['$regex'=>new \MongoRegex($s)];
		}

		$sort = ['updated_at'=>-1];

		if(isset($params['order']) && !empty($params['order'])){
			
			$field = $columns[$params['order'][0]['column']];
			$direction = ($params['order'][0]['dir']=='asc')?1:-1;
			$sort = [$field=>$direction];            
		}

		$query[]['$sort'] = $sort;

		$model = User::raw()->aggregate($query);

		$iTotalRecords = count($model['result']);

		$query[]['$skip'] = (int)$start;

		if($length > 0){
			$query[]['$limit'] = (int)$length;
			$model = User::raw()->aggregate($query);
		}

		$response = [
			'recordsTotal' => $iTotalRecords,
			'recordsFiltered' => $iTotalRecords,
			'draw' => $draw,
			'data' => $model['result']            
		];

		return response($response,200);

	}

	public function getImport(){

		// $count = oldResultantUsers::whereNull("address")->count();
		
		$postalCodes = DB::collection("oldResultantUsers")->raw()->aggregate(
							[
								'$group' => [
									'_id' => '$postalCode',
									'address' => ['$first'=>'$address'],
									'postalCode' => ['$first'=>'$postalCode'],
								]
							],
							[
								'$match' => [
									'address.SEARCHVAL' => [
										'$exists' => false
									]
								]
							],
							[
								'$lookup' => [
									'from' => 'zipCodeAddress',
									'localField' => 'postalCode',
									'foreignField' => 'postalCode',
									'as' => 'zipcode'
								]
							],
							[
								'$match' => [
									'zipcode.0' => [
										'$exists' => false
									]
								]
							]
					   );

		
		foreach ($postalCodes['result'] as $key => $value) {

			$json = json_decode(file_get_contents('https://developers.onemap.sg/commonapi/search?searchVal='.$value['_id'].'&returnGeom=Y&getAddrDetails=Y&pageNum=1'), true);

			$addressObj = [];

			if(!empty($json) && isset($json['results']) && !empty($json['results'])){

				$address = $json['results'][0];

				$addressObj = [
					"SEARCHVAL" => $address['SEARCHVAL'],
					"ADDRESS" => $address['ADDRESS'],
					"house" => $address['BLK_NO'],
					"HBRN" => $address['ROAD_NAME'],
					"default" => "true",
					"BLDG_NAME" => $address['BUILDING'],
					"PostalCode" => $address['POSTAL'],
					"X" => $address['X'],
					"Y" => $address['Y'],
					"LAT" => $address['LATITUDE'],
					"LNG" => $address['LONGITUDE'],
					"SEARCHTEXT" => "",
					"FLOOR" => "",
					"UNIT" => "",
					//"firstname" => $resultantUser->name,
					//"lastname" => "",
					//"company" => "",
					"location" => [
						$address['LATITUDE'],
						$address['LONGITUDE']
					],
					"CATEGORY" => "Building"
				];				

			}
			try{

				$zipCodeAddress = new zipCodeAddress;
				$zipCodeAddress->postalCode = $value['_id'];
				$zipCodeAddress->address = $addressObj;

				$zipCodeAddress->save();
				

			}catch(\Exception $e){
				prd($e->getMessage());
			}

		}

		prd("end");
		
		while($resultantUser = oldResultantUsers::whereNull("address")->first()){

			$resultantUser->password = "";
			$resultantUser->email_key = "";
			$resultantUser->status = 1;
			$resultantUser->verified = 0;
			$resultantUser->updated_at = new MongoDate();
			$resultantUser->created_at = new MongoDate();
			$resultantUser->existing = count($resultantUser->existing)>0?true:false;

			$searchVal = $resultantUser->postalCode;

			$json = json_decode(file_get_contents('https://developers.onemap.sg/commonapi/search?searchVal='.$searchVal.'&returnGeom=Y&getAddrDetails=Y&pageNum=1'), true);

			if(!empty($json) && isset($json['results']) && !empty($json['results'])){

				$address = $json['results'][0];

				$addressObj = [
					"SEARCHVAL" => $address['SEARCHVAL'],
					"ADDRESS" => $address['ADDRESS'],
					"house" => $address['BLK_NO'],
					"HBRN" => $address['ROAD_NAME'],
					"default" => "true",
					"BLDG_NAME" => $address['BUILDING'],
					"PostalCode" => $address['POSTAL'],
					"X" => $address['X'],
					"Y" => $address['Y'],
					"LAT" => $address['LATITUDE'],
					"LNG" => $address['LONGITUDE'],
					"SEARCHTEXT" => "",
					"FLOOR" => "",
					"UNIT" => "",
					"firstname" => $resultantUser->name,
					"lastname" => "",
					"company" => "",
					"location" => [
						$address['LATITUDE'],
						$address['LONGITUDE']
					],
					"CATEGORY" => "Building"
				];
				
				$resultantUser->address = [$addressObj];

			}else{
				$resultantUser->address = [];
			}

			prd("done");
			$resultantUser->save();

		}

		prd("loop out");

	}
}
