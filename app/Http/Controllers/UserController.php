<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Email;
use AlcoholDelivery\User as User;
use AlcoholDelivery\Orders as Orders;
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

		// if the credentials are wrong
		if (!Auth::attempt('user',$credentials)) {
			$invalidcredentials = 'Username password does not match';            
		}

		$user = Auth::user('user');

		if($user && $user->verified!=1){
			$invalidcredentials = 'You need to verify your email. Click below link to resend verification email';
			$reverification = 1;			
			Auth::logout();
		}
		
		if ($validator->fails() || $invalidcredentials){
			
			if($invalidcredentials){
				$validator->errors()->add('email',$invalidcredentials);
				$validator->errors()->add('password',' ');
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
	public function update(Request $request)
	{
		$inputs = $request->all();
		$user = Auth::user('user');

		if(isset($inputs['email']))
			$inputs['email'] = strtolower($inputs['email']);
		// validation rules
		$validator = Validator::make($inputs, [
			'name' => 'required',
			'email' => 'required|email|max:255|unique:user,email,'.$user->_id.",_id",
			'mobile_number'=> 'required|numeric|digits:8',
		],[
		   'mobile_number.required' => 'Mobile number is required',
		   'mobile_number.numeric' => 'please enter valid mobile number',
		   'mobile_number.digits_between' => 'please enter valid mobile number'
		]);
		
		$return = array("success"=>false,"message"=>"","data"=>"");

		if ($validator->fails()) {
			
			$return['message'] = "Please check form again";
			$return['data'] = $validator->errors();

			return response($return, 400);
		}
				
		$curruser = User::find($user->_id);

		$curruser->name = $inputs['name'];
		$curruser->email = strtolower($inputs['email']);
		$curruser->mobile_number = $inputs['mobile_number'];

		try {

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
			if ($validatorForFbLogin->fails()) {

				$return['message'] = "Please check form again";
				$return['data'] = $validator->errors();

				return response($return, 400);
			}
		}
		else
		{
			if ($validator->fails()) {

				$return['message'] = "Please check form again";
				$return['data'] = $validator->errors();

				return response($return, 400);
			}
		} 

		$curruser->password = \Hash::make($request->input('new'));
				
		try {

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
													'mobile_number' => 1,
													'loyaltyPoints' => 1,
													'credits' => '$credits.total',
												]
								]
							]);

						if(isset($output['result'][0])){
							return $output['result'][0];
						}

						return false;
					});

			$userLogged["auth"] = true;
			$userLogged['loginfb'] = false;
			if($userLogged['password']=="")
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
			$username = (isset($userLogged->name))?$userLogged->name:$userLogged->email;
			foreach ($emailsaddresses as $key => $emailaddress) {
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

	public function getLastorder($reference=false){
		
		$return = ["message"=>"","auth"=>false];

		$userLogged = Auth::user('user');

		if(empty($userLogged)){
			
			$return['message'] = 'login required';
			
			return response($return,401);
		}

		$return['auth'] = true;

		try{

			$ordersModel = new Orders;

			$order = $ordersModel
							->where("user",new mongoId($userLogged->_id));

			if($reference){
				$order = $order->where("reference",$reference);
			}
							
			$order = $order->orderBy("created_at","desc")
						   ->first(["products","packages","updated_at","reference"]);

			if(empty($order)){
				return response(["message"=>"Order not found"],200);
			}

			$order = $order->toArray();

			$products = $ordersModel->getProducts([$order],false);
			$order = $ordersModel->mergeProducts([$order],$products);
			$order = $order[0];

		} catch(\Exception $e){

			$return['message'] = "Something wrong";//$e->getMessage();            
			return response($order,400);

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

		$orderObj = Orders::where('giftCards._uid',new mongoId($cardKey))->where("giftCards.claimed",null)->first(['user','giftCards']);

		if(empty($orderObj)) {

			$response['message'] = "invalid request";
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
		
		$creditDetail = [
							"type" => "credit",
							"unitprice" => (float)$currGiftCard['recipient']['price'],
							"quantity" => $currGiftCard['recipient']['quantity'],
							"price" => (float)((int)$currGiftCard['recipient']['quantity'] * (float)$currGiftCard['recipient']['price']),

							"reason" => [
								"type" => "giftcard",								
								"sender" => [
									"_id" => new mongoId($sender['_id']),
									"email" => $sender['email'],
									"name" => $sender['name']
								],
								"comment" => "You have earned this points as gift"
							],
							
							"recipient" => $currGiftCard['recipient'],
							"on"=>new MongoDate(strtotime(date("Y-m-d H:i:s")))

						];

		try{

			$isUpdated = User::where('_id', $userId)->increment('credits', (float)$creditDetail['price']);
			$isUpdated = User::where('_id', $userId)->push('creditsSummary', $creditDetail);

			$orderObj->giftCards = $giftCards;
			$orderObj->save();

			$response['message'] = "Credits add to account";
			return response($response,200);

		}catch(\Exception $e){

			$response['message'] = $e->getMessage();
			return response($response,400);

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
}
