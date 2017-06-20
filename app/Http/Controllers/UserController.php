<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Categories;
use AlcoholDelivery\Email;
use AlcoholDelivery\User;
use AlcoholDelivery\Orders;
use AlcoholDelivery\Credits;
use AlcoholDelivery\CreditTransactions;
use AlcoholDelivery\LoyaltyTransactions;

use AlcoholDelivery\Http\Requests\LoyaltyToCreditsRequest;

use AlcoholDelivery\ErrorLog;

use mongoId;
use MongoDate;
use DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
	public function checkAuth(Request $request)
	{
		$validator = Validator::make($request->all(), [
			'email' => 'required|email',
			'password' => 'required',
		]);

		// setting the credentials array
		$credentials = [
			'email' => strtolower($request->input('email')),
			'password' => $request->input('password'),
		];

		$invalidcredentials = false;
		$reverification = 0;
		$suspended = false;

		// Always set remember me for mobile app login
		$isMobileApi = $request->input('mobileapi');
		$rememberMe = $isMobileApi==1?true:false;

		$isExist = User::where('email',$request->input('email'))->first();

		if($isExist){

			$isExist = $isExist->toArray();

			if(isset($isExist['existing'])){
				$retArr = [
					'resetRequired' =>true,
					'guest'=>!$isExist['existing']
				];

				return response($retArr, 422);

			}

		}

		// if the credentials are wrong
		if(!Auth::attempt('user',$credentials,$rememberMe)){
			$invalidcredentials = 'Username password does not match';
		}

		$user = Auth::user('user');

		//ACCOUNT SUSPENDED BY ADMIN
		if($user && ($user->status!=1 && $user->verified==1)){
			$suspended = 'Your account has been suspended by the site administrator.';
			Auth::logout();
			return response(['suspended' => $suspended], 422);
		}

		if($user && $user->verified!=1){
			$invalidcredentials = 'You need to verify your email. Click below link to resend verification email';
			$reverification = 1;
			Auth::logout();
		}

		if ($validator->fails() || $invalidcredentials){
			
			if($invalidcredentials){
				$validator->errors()->add('email',$invalidcredentials);
				$validator->errors()->add('password',' ');
				$validator->errors()->add('errors',$user);
				if($reverification == 1)
					$validator->errors()->add('reverification',$reverification);
			}			

			return response($validator->errors(), 422);
		}

		return response($user, 200);
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		$categories = Categories::all()->toArray();
		return view('frontend',array('categories'=>$categories));
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
	 */
	public function update(Request $request){

		$inputs = $request->all();
		$user = Auth::user('user');

		if(isset($inputs['email']))
			$inputs['email'] = strtolower($inputs['email']);
		// validation rules
		
		$rules = [
			'name' => 'required',
			'email' => 'required|email|max:255|unique:user,email,'.$user->_id.",_id",
			'country_code'=> 'required|numeric|digits_between:1,3',
			'mobile_number'=> 'required|numeric|digits_between:6,15'
			
		];
		$messages = [
		   'mobile_number.required' => 'Mobile number is required',
		   'mobile_number.numeric' => 'please enter valid mobile number',
		   'mobile_number.digits_between' => 'please enter valid mobile number',
		   'country_code.required' => 'Country code is required',
		   'country_code.numeric' => 'please enter valid country code',
		   'country_code.digits_between' => 'please enter valid country code'
		];

		if($inputs['country_code']==65){
			
			
			$rules['mobile_number'].="|digits:8";
			$messages['mobile_number.digits'] = 'please enter valid 8 digit number';

		}

		$validator = Validator::make($inputs, $rules, $messages);
		
		$return = array("success"=>false,"message"=>"","data"=>"");

		if ($validator->fails()) {
			
			$return['message'] = "Please check form again";
			$return['data'] = $validator->errors();

			return response($return, 400);
		}

		$curruser = User::find($user->_id);

		$curruser->name = $inputs['name'];
		//$curruser->email = strtolower($inputs['email']);
		$curruser->mobile_number = $inputs['mobile_number'];
		$curruser->country_code = $inputs['country_code'];		

		try{

			$curruser->save();

			$return['success'] = true;
			$return['message'] = "Your profile settings have been updated successfully.";
						
		} catch(\Exception $e){
			$return['message'] = "Something wrong";//$e->getMessage();            
		}

		return response($return);
		
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function updatepassword(Request $request)
	{
		$inputs = $request->all();
		$user = Auth::user('user');
		if(!$user){
			$response['message'] = "Login Required";
			return response($response,401);
		}
		// validation rules
		$curruser = User::find($user->_id);

		$inputs['old'] = '';

		if (\Hash::check($inputs['current'], $curruser->password) === true) {
			$inputs['old'] = $inputs['current'];
		}

		$validator = Validator::make($inputs, [
			'current' => 'required|same:old',
			'new' => 'required|between:8,12|different:current',
			'confirm' => 'required|same:new',            
		],[                      
		   'current.same' => 'Incorrect current password.',
		   'new.digits_between' => 'Password must be between 8 to 12 characters'
		]);

		$validatorForFbLogin = Validator::make($inputs, [
			'new' => 'required|between:6,82|different:current',
			'confirm' => 'required|same:new',            
		],[                      
		   'new.digits_between' => 'password must be between 8 to 12 characters'
		]);

		$return = array("success"=>false,"message"=>"","data"=>"");

		// if fb login then do not check current password //
		if($curruser->password=="")
		{
			if($validatorForFbLogin->fails()){
				$return['message'] = "Please check form again";
				$return['data'] = $validator->errors();
				return response($return, 400);
			}
		}
		else
		{
			if($validator->fails()){
				$return['message'] = "Please check form again";
				$return['data'] = $validator->errors();
				return response($return, 400);
			}
		} 

		$curruser->password = \Hash::make($request->input('new'));
				
		try{
			$curruser->save();

			$return['success'] = true;
			$return['message'] = "Your password has been updated successfully.";

		} catch(\Exception $e){
			$return['message'] = "Something wrong";//$e->getMessage();            
		}

		return response($return);
	}
	
	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return \Illuminate\Http\Response
	 */
	public function destroy($id)
	{
		//
	}

	public function check(){
		return response(Auth::user('user'), 200);
	}

	public function loggeduser(){

		$userLogged = Auth::user('user');

		if(!empty($userLogged)){			

			$userLogged = DB::collection('user')->raw(function($collection) use ($userLogged){
					$output = $collection->aggregate([
								[
									'$match' => [
										'_id' => new mongoId($userLogged->_id),
										'status' => 1,
										'verified' => 1
									]
								],
								[
									'$project' => [
													'_id' =>1,
													'email' => 1,
													'address' => 1,
													'name' => 1,
													'password' => 1,
													'country_code' => 1,
													'mobile_number' => 1,
													'loyaltyPoints' => '$loyalty.total',
													'credits' => '$credits.total',
													'savedCards' => 1,
													'alternate_number' => 1
												]
								]
							]);


						if(isset($output['result'][0])){							
							if(!isset($output['result'][0]['country_code'])){$output['result'][0]['country_code']='65';}
							return $output['result'][0];
						}

						return false;
					});

			$userLogged["auth"] = true;
			$userLogged['loginfb'] = false;
			if(!isset($userLogged['password']))
				$userLogged['loginfb'] = true;
			unset($userLogged['password']);

		}
		else{
			$userLogged = ["auth"=>false];
		}

		return response($userLogged, 200);
	}

	public function postNotifyme(Request $request){

		$param = $request->all();

		$userLogged = Auth::user('user');

		$user = User::find($userLogged->_id);

		$user->push('productAddedNotification',$param['pid'],true);        

		return response ($user,200);

	}

	public function postInviteusers(Request $request){
		
		$data = $request->all();

		$empty = true;

		$notvalid = false;

		if(isset($data['emails']) && !empty($data['emails'])){

			$empty = false;

			$emailsaddresses = preg_split('/;|,/', $data['emails']);            

			foreach ($emailsaddresses as $key => $emailaddress) {            
				$data = ['email' => strtolower($emailaddress)];
				$validator = Validator::make($data,['email'=>'required|email|max:255']);
				if ($validator->fails()) {
					$notvalid = true;
				}
			}       

		}

		if ($notvalid || $empty){
			if($empty)
				return response(['emails'=>'Please enter email.'],422);
			else
				return response(['emails'=>'One or more of the email addresses are not valid.'],422);
		}else{            

			$userLogged = Auth::user('user');
			if(!$userLogged){
				$response['message'] = "Login Required";
				return response($response,401);
			}

			$username = (isset($userLogged->name))?$userLogged->name:$userLogged->email;
			foreach ($emailsaddresses as $key => $emailaddress){
				if($emailaddress!=$userLogged->email){
					$data = [
						'email' => strtolower($emailaddress),
						'sender_name' => $username,
						'sender_email' => $userLogged->email,
						'id' => $userLogged->_id
					];
					$email = new Email('invite');
					$email->sendEmail($data);
				}
			}
		}

		return response(['success'=>'Invitation(s) sent successfully.'],200);
	}

	public function getOrderstorepeat(){

		$userLogged = Auth::user('user');
		if(empty($userLogged)){
			return response(["message"=>'login required'],401);
		}

		$ordersModel = new Orders;
		$orders = $ordersModel->getOrdersToRepeat($userLogged->_id);

		return response($orders,200);

	}


	public function getLastorder($reference=false,$admin=false){
		
		$return = ["message"=>"","auth"=>false];

		// if detail is not required by admin user
		if(!$admin){

			$userLogged = Auth::user('user');

			if(empty($userLogged)){
				
				$return['message'] = 'login required';

				return response($return,401);
			}

		}else{

			$adminLogged = Auth::user('admin');

			if(empty($adminLogged)){

				$return['message'] = 'login required';

				return response($return,401);

			}else{

				$userLogged = (object)['_id'=>$reference];
				$reference = false;
			}

		}
		
		$return['auth'] = true;

		$order = [];

		try{

			$ordersModel = new Orders;

			$order = $ordersModel
							->where("user",new mongoId($userLogged->_id))
							->whereNotNull("products");

			if($reference){
				$order = $order->where("reference",$reference);
			}

			$order = $order->orderBy("created_at","desc")
							->first(["products","updated_at","reference"]);

			if(empty($order)){
				return response(["success"=>false,"message"=>"Order not found","order"=>array()],200);
			}

			$order = $order->toArray();

			$products = $ordersModel->getProducts([$order],false);
			$order = $ordersModel->mergeProducts([$order],$products);
			$order = $order[0];

		} catch(\Exception $e){
			$return['message'] = "Something wrong";//$e->getMessage();            
			return response($return,400);
		}

		$return['order'] = $order;
		return response($return,200);
	}

	public function getLastOrderNew($reference=false,$admin=false){
		
		$return = ["message"=>"","auth"=>false];

		// if detail is not required by admin user
		if(!$admin){

			$userLogged = Auth::user('user');

			if(empty($userLogged)){
				
				$return['message'] = 'login required';

				return response($return,401);
			}

		}else{

			$adminLogged = Auth::user('admin');

			if(empty($adminLogged)){

				$return['message'] = 'login required';

				return response($return,401);

			}else{

				$userLogged = (object)['_id'=>$reference];
				$reference = false;
			}

		}
		
		$return['auth'] = true;

		$order = [];

		try{

			$ordersModel = new Orders;

			$order = $ordersModel
						->where("user",new mongoId($userLogged->_id))
						->whereNotNull("products");

			if($reference){
				$order = $order->where("reference",$reference);
			}

			$order = $order->orderBy("created_at","desc")
						->first(['productsLog','products','sales','packages','gift','giftCards']);

			prd($order->setItemsCurrentState());

			if(empty($order)){
				return response(["success"=>false,"message"=>"Order not found","order"=>array()],200);
			}

			$order = $order->toArray();

			$products = $ordersModel->getProducts([$order],false);
			jprd($products);
			$order = $ordersModel->mergeProducts([$order],$products);
			$order = $order[0];

		} catch(\Exception $e){
			prd($e->getMessage());
			$return['message'] = "Something wrong";//$e->getMessage();
			return response($return,400);
		}

		$return['order'] = $order;
		return response($return,200);
	}

	/**
	 * authorized gift card claim
	 *
	 * @param  string $cardKey
	 * @return array $response
	 */
	public function postGiftcard($cardKey){
	
		$response = [
			"message"=>""
		];

		$this->user = Auth::user('user');

		$userId = $this->user->_id;

		$orderObj = Orders::where('giftCards._uid',new mongoId($cardKey))
							->where("giftCards.claimed",null)
							->first(['user','giftCards','reference']);

		if(empty($orderObj)) {

			$response['message'] = "Already claimed";
			return response($response,422);
		}

		$orderDetail = $orderObj->toArray();
		
		$giftCards = $orderDetail['giftCards'];

		foreach($giftCards as $key=>&$giftCard){

			if($cardKey===(string)$giftCard['_uid']){

				$currGiftCard = $giftCard;
				$giftCard['claimed'] = [
					'_id' => $this->user->_id,
					'email' => $this->user->email,
					'name' => $this->user->name
				];
				break;

			}
		}

		$sender = User::where("_id",$orderDetail['user'])->first(["email","name"]);

		$reference = $orderDetail['reference'];
		$giftCredits = (float)((int)$currGiftCard['recipient']['quantity'] * (float)$currGiftCard['recipient']['price']);

		$creditObj = [
						"credit"=>$giftCredits,
						"method"=>"giftcard",
						"reference" => $reference,
						"user" => new mongoId($this->user->_id),
						"comment"=> "You have earned this points as gift",
						"extra" => [

							"unitprice" => (float)$currGiftCard['recipient']['price'],
							"quantity" => $currGiftCard['recipient']['quantity'],
							"sender" => [
									"_id" => new mongoId($sender['_id']),
									"email" => $sender['email'],
									"name" => $sender['name']
								],
						]
					];

		try{

			CreditTransactions::transaction('credit',$creditObj,$this->user->_id);
			
			$orderObj->giftCards = $giftCards;
			$orderObj->save();

			$response['message'] = "Credits add to account";
			return response($response,200);

		}catch(\Exception $e){

			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Claim Gift Card'
				]);

			return response(["message"=>'Something went wrong'],400);

		}
		
	}


	/**
	 * Get user credits
	 *
	 * @return array $credits
	 */
	public function getCredits(){

	}

	public function postResendverification(Request $request)
	{
		$validator = Validator::make($request->all(), [
			'email' => 'required|email',			          
		]);	

		//IF EMAIL is not valid
		if ($validator->fails()){
			return response($validator->errors(), 422);
		}	
		// setting the credentials array
		$credentials = [
			'email' => strtolower($request->input('email')),			
		];		
		
		$user = User::where($credentials)->first();
		
		if($user){
			if($user->verified!=1){
				$email = new Email('welcome');
				$email->sendEmail($user);
				return response(['message' => 'Verification email has been sent successfully. Please check your mail to verify your account'], 200);
			}else{
				$validator->errors()->add('email',['The email you have entered is already verified.']);	
			}
		}else{			
			$validator->errors()->add('email',['It seems that the email you have entered is not registered with us.']);
			
		}	

		return response($validator->errors(), 422);
	}

	public function getTemplate(Request $request){

		$mailSubject = '';
		$mailContent = '';

		$settings = DB::collection('settings')->whereIn('_id',['general','social','email'])->get();
		$config = array();

		foreach($settings as $setting){
			$config[$setting['_id']] = $setting['settings'];
		}

		$siteUrl = url();

		$replace = array(

			'sender' => array(
				'name' =>$config['general']['site_title']['value'],
				'email' =>$config['email']['default']['email']
			),
			'receiver' => array(
				'name' =>'',
				'email' =>''
			),
			'subject' => $mailSubject,
			'replace' => array(
				'{website_link}' => $siteUrl,				
				'{site_title}' => $config['general']['site_title']['value'],
				'{link_login}' => $siteUrl.'/login',
				'{link_privacy}' => $siteUrl.'/privacy-policy',				
				'{link_contact}' => $siteUrl.'/contact-us',
				'{social_facebook}' => $config['social']['facebook']['value'],
				'{social_twitter}' => $config['social']['twitter']['value'],
				'{copyright_year}' => date('Y')
			),
			'message' => $mailContent
		);

		return view('emails.mail',['content' => '','replace' => $replace['replace']]);		

	}

	public function putCreditCertificate(LoyaltyToCreditsRequest $request) {

		$user = Auth::user('user');

		if(empty($user)){
			return response(['code'=>401],400);
		}

		$inputs = $request->all();

		$value = $inputs['id'];

		$creditsObj = new Credits;
		$result = $creditsObj->getCredit($value);

		if($result->success === false){
			return response(["message"=>"Card not found"],400);
		}

		$card = $result->card;

		try{

			$reference = 'Ex-'.getServerTime();

			$creditsFromLoyalty = $card['value'] * $inputs['quantity'];
			$loyaltyPointsUsed = $card['loyalty'] * $inputs['quantity'];

			$creditObj = [
							"credit"=>$creditsFromLoyalty,
							"method"=>"exchange",
							"reference" => $reference,
							"user" => new mongoId($user->_id),
							"comment"=> "You have earned this credits in exchange of loyalty points"
						];

			CreditTransactions::transaction('credit',$creditObj,$user->_id);

			$loyaltyObj = [
							"points"=>$loyaltyPointsUsed,
							"method"=>"exchange",
							"reference" => $reference							
						];

			LoyaltyTransactions::transaction('debit',$loyaltyObj,$user->_id);

			return response(["message"=>"Credit added successfully"],200);

		}catch(\Exception $e){

			ErrorLog::create('emergency',[
					'error'=>$e,
					'message'=> 'Exchange loyalty'
				]);
			
			return response(["message"=>"Something went wrong"],400);			

		}	

	}
}
