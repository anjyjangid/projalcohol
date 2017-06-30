<?php

namespace AlcoholDelivery\Http\Controllers\Auth;

use AlcoholDelivery\User;
use Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;

//use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Sarav\Multiauth\Foundation\AuthenticatesAndRegistersUsers;
use AlcoholDelivery\Email as Email;
use MongoId;

use Firebase\JWT\JWT;
use GuzzleHttp;
use GuzzleHttp\Subscriber\Oauth\Oauth1 as Oauth1;
use Hash;
use Config;
use Session;
use AlcoholDelivery\Setting;
use AlcoholDelivery\Orders;
use AlcoholDelivery\LoyaltyTransactions;

class AuthController extends Controller
{
	/*
	|--------------------------------------------------------------------------
	| Registration & Login Controller
	|--------------------------------------------------------------------------
	|
	| This controller handles the registration of new users, as well as the
	| authentication of existing users. By default, this controller uses
	| a simple trait to add these behaviors. Why don't you explore it?
	|
	*/

	use AuthenticatesAndRegistersUsers, ThrottlesLogins;

	/**
	 * Create a new authentication controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->user = "user";
		// 'signupsocial','postSocialverification' are used for mobile app api
		$this->middleware('guest', ['except' => array('getLogout','signupsocial','postSocialverification')]);
	}

	/**
	 * Get a validator for an incoming registration request.
	 *
	 * @param  array  $data
	 * @return \Illuminate\Contracts\Validation\Validator
	 */
	protected function validator(array $data)	
	{
		if(isset($data['email']))
			$data['email'] = strtolower($data['email']);

		return Validator::make($data, [
			//'name' => 'required|max:255',
			'email' => 'required|email|max:255|unique:user',
			'password' => 'required|confirmed|between:8,12',
			'password_confirmation' => 'required',
			'terms' => 'required|accepted'
		],[
			'terms.required' => 'Please agree terms.',
			'terms.accepted' => 'Please agree terms.'
		]);
	}


	/****************************************************
	 *
	 * Handle a registration request for the application.
	 * @param  \Illuminate\Http\Request $request
	 * @return \Illuminate\Http\Response
	 *
	*****************************************************/
	public function postRegister(Request $request)
	{

		$validator = $this->validator($request->all());		

		if ($validator->fails()) {

			$email = $request->input('email');

			$user = user::raw()->findOne(['email'=>$email]);
			
			$errors = $validator->errors();

			if(!empty($user) && isset($user['createdVia']) && $user['createdVia']==='E' ){
				
				$errors->add("addedViaEci",true);
			}

			return response($errors, 422);
		}

		$isCreated = $this->create($request->all());

		//Auth::login($this->user(), $this->create($request->all()));
		return response($isCreated, 200);

	}

	public function postRegisterfb(Request $request)
	{
		$data = $request->all();

		$validator = Validator::make($data, [
			'email' => 'required|email',
			'id' => 'required',
		]);	

		//IF data is not valid
		if($validator->fails()){
			return response($validator->errors(), 422);
		}
		
		$name = $data['first_name'].' '.$data['last_name'];

		$firstname = @$data['first_name'];

		if(isset($data['email']))
			$data['email'] = strtolower($data['email']);
		else
			return response('Hello '.$firstname.', we could not find your email address from Facebook, please try signup.',422);
		
		$checkUser = User::where('fbid', '=', $data['id'])->orWhere('email', $data['email'])->first();

		if($checkUser){
			if($checkUser->status!=1){
				$suspended = 'Your account has been suspended by the site administrator.';			
				return response(['suspended' => $suspended],422);
			}
			$checkUser->fbid = $data['id'];
			$checkUser->email = $data['email'];
			$checkUser->name = $name;	
			$checkUser->verified = 1;	
			$checkUser->save();
			Auth::login($checkUser);
		}else{	
			$user = User::create([
				'email' => $data['email'],
				'fbid' => $data['id'],
				'name' => $name,
				'status' => 1,
				'verified' => 1,
			]);
			Auth::login($user);
		}
		return response(Auth::user('user'),200);
	}

	/**
	 * Social Login & Signup From API
	 */
	public function signupsocial(Request $request){
		$data = $request->all();
		return $this->socialLogin($data);
	}

	/**
	 * Create a new user instance after a valid registration.
	 *
	 * @param  array  $data
	 * @return User
	 */
	protected function create(array $data)
	{
		$data['email_key'] = new MongoId();
		$data['email'] = strtolower($data['email']);
		
		try {

			$userData = [
				'email' => $data['email'],
				'password' => bcrypt($data['password']),
				'email_key' => (string)$data['email_key'],
				'status' => 1,
				'verified' => 0,
			];

			if(isset($data['refferedBy']) && MongoId::isValid($data['refferedBy'])){
				$user = user::find($data['refferedBy']);
				if(!empty($user))
				$userData['reffered'] = new MongoId($data['refferedBy']);
			}

			$user = User::create($userData);
		
		} catch(\Exception $e){

			return response(array("success"=>false,"message"=>$e->getMessage()));
		}

		$email = new Email('welcome');
		$email->sendEmail($data);
		
		return array("success"=>true,"message"=>"Account created successfully");
	}


	public function verifyemail($key){

		$user = User::where("email_key","=",$key)->first();

		if(empty($user->_id)){
			return redirect('/mailverified/0');
		}

		$email = new Email('welcomeEmailVerified');
		$email->sendEmail($user->toArray());
		$user->status = 1;
		$user->verified = 1;
		$user->save();
		$user->unset("email_key");

		return redirect('/mailverified/1');
	}


	/*********************SOCIAL LOGIN*************************/

	protected function providers($providername){

		$providerList = [
			'facebook' => ['field' => 'fbid','name' => 'Facebook','verifiedField' => 'fbverified'],
			'google' => ['field' => 'gplusid','name' => 'Google+','verifiedField' => 'gplusverified'],
			'twitter' => ['field' => 'twitterid','name' => 'Twitter','verifiedField' => 'twitterverified'],
			'instagram' => ['field' => 'instagramid','name' => 'Instagram','verifiedField' => 'instagramverified'],
		];

		return $providerList[$providername];
	}

	protected function socialLogin($data){

		if(!empty($data) && isset($data['id'])){
			$data['id'] = (string)$data['id'];
			$providerData = $this->providers($data['providername']);
			$field = $providerData['field'];
			$providername = $providerData['name'];

			$id = $data['id'];
			$email = (isset($data['email']) && $data['email']!='')?$data['email']:'';

			$user = User::where($field, '=', $id)->orWhere('email',$email)->first();

			if($user){
				if($user->status!=1){
					$suspended = 'Your account has been suspended by the site administrator.';
					return response(['suspended' => $suspended],422);
				}
				$user->$field = $data['id'];

				if(!isset($user->name))
					$user->name = $data['name'];

				$user->verified = 1;
				$user->save();
			}elseif($email!=''){
				$user = User::create([
					'email' => $email,
					'name' => $data['name'],
					$field => $data['id'],
					'status' => 1,
					'verified' => 1
				]);
			}else{
				Session::put('socialData',$data);
				return response(['emailnotfound' => 'Hello '.$data['name'].', we could not find your email address from '.$providername.', please enter your email below to complete the registration process.','d' => $data],422);
			}

			Auth::login($user);
			return response(Auth::user('user'),200);
		}else{
			return response(['couldnotconnect' => 'We could not connect to '.$providername.', please try again.'],422);
		}
	}

	/**
	 * Generate JSON Web Token.
	 */
	protected function createToken($user)
	{
		$payload = [
			'sub' => $user->id,
			'iat' => time(),
			'exp' => time() + (2 * 7 * 24 * 60 * 60)
		];
		return JWT::encode($payload, Config::get('app.token_secret'));
	}

	/**
	 * Login with Facebook.
	 */
	public function facebook(Request $request){

		$client = new GuzzleHttp\Client();
		$params = [
			'code' => $request->input('code'),
			'client_id' => $request->input('clientId'),
			'redirect_uri' => $request->input('redirectUri'),
			'client_secret' => Config::get('app.facebook_secret')
		];
		// Step 1. Exchange authorization code for access token.
		$accessTokenResponse = $client->request('GET', 'https://graph.facebook.com/v2.5/oauth/access_token', [
			'query' => $params
		]);
		$accessToken = json_decode($accessTokenResponse->getBody(), true);
		// Step 2. Retrieve profile information about the current user.	

		$data = $request->all();
		
		if(isset($data['type']) && $data['type'] == 'sharing'){
			//SHARING API
			$profileResponse = $client->request('POST', 'https://graph.facebook.com/me/feed', [
				'query' => [
					'access_token' => $accessToken['access_token'],
					'message' => 'Hello this is sharing from FB API'
				]
			]);			
		}else{
			//LOGIN API
			$fields = 'id,email,first_name,last_name,link,name';
			$profileResponse = $client->request('GET', 'https://graph.facebook.com/v2.5/me', [
				'query' => [
					'access_token' => $accessToken['access_token'],
					'fields' => $fields
				]
			]);
		}

		$profile = json_decode($profileResponse->getBody(), true);        

		$profile['providername'] = 'facebook';

		return $this->socialLogin($profile);        
	}
	/**
	 * Login with Google.
	 */
	public function google(Request $request){

		$client = new GuzzleHttp\Client();
		$params = [
			'code' => $request->input('code'),
			'client_id' => $request->input('clientId'),
			'client_secret' => Config::get('app.google_secret'),
			'redirect_uri' => $request->input('redirectUri'),
			'grant_type' => 'authorization_code',			
		];
		// Step 1. Exchange authorization code for access token.
		$accessTokenResponse = $client->request('POST', 'https://accounts.google.com/o/oauth2/token', [
			'form_params' => $params
		]);
		$accessToken = json_decode($accessTokenResponse->getBody(), true);
		// Step 2. Retrieve profile information about the current user.
		
		$data = $request->all();

		if(isset($data['type']) && $data['type'] == 'sharing'){				
			$profileResponse = $client->request('POST', 'https://www.googleapis.com/plusDomains/v1/people/me/activities', [
				'query' => ['status' => 'https://www.alcoholdelivery.com.sg'],
				'auth' => 'oauth'
			]);
			$profile = json_decode($profileResponse->getBody(), true);				
			return response($profile);
		}


		$profileResponse = $client->request('GET', 'https://www.googleapis.com/plus/v1/people/me', [
			'headers' => array('Authorization' => 'Bearer ' . $accessToken['access_token'])
		]);
		$profile = json_decode($profileResponse->getBody(), true);
		
		if(!empty($profile) && isset($profile['emails'])){

			$profile['name'] = $profile['displayName'];
			
			foreach ($profile['emails'] as $key => $value) {
				if($value['type'] == 'account'){
					$profile['email'] = $value['value'];
					break;
				}
			}
		}    

		$profile['providername'] = 'google';

		return $this->socialLogin($profile);
	}	

	/**
	 * Login with Twitter.
	 */
	public function twitter(Request $request){
		$stack = GuzzleHttp\HandlerStack::create();
		// Part 1 of 2: Initial request from Satellizer.
		if (!$request->input('oauth_token') || !$request->input('oauth_verifier'))
		{
			$stack = GuzzleHttp\HandlerStack::create();
			$requestTokenOauth = new Oauth1([
			  'consumer_key' => Config::get('app.twitter_key'),
			  'consumer_secret' => Config::get('app.twitter_secret'),
			  'callback' => $request->input('redirectUri'),
			  'token' => '',
			  'token_secret' => ''
			]);
			$stack->push($requestTokenOauth);
			$client = new GuzzleHttp\Client([
				'handler' => $stack
			]);
			// Step 1. Obtain request token for the authorization popup.
			$requestTokenResponse = $client->request('POST', 'https://api.twitter.com/oauth/request_token', [
				'auth' => 'oauth'
			]);
			$oauthToken = array();
			parse_str($requestTokenResponse->getBody(), $oauthToken);
			// Step 2. Send OAuth token back to open the authorization screen.
			return response()->json($oauthToken);
		}
		// Part 2 of 2: Second request after Authorize app is clicked.
		else
		{
			$accessTokenOauth = new Oauth1([
				'consumer_key' => Config::get('app.twitter_key'),
				'consumer_secret' => Config::get('app.twitter_secret'),
				'token' => $request->input('oauth_token'),
				'verifier' => $request->input('oauth_verifier'),
				'token_secret' => ''
			]);
			$stack->push($accessTokenOauth);
			$client = new GuzzleHttp\Client([
				'handler' => $stack
			]);
			// Step 3. Exchange oauth token and oauth verifier for access token.
			$accessTokenResponse = $client->request('POST', 'https://api.twitter.com/oauth/access_token', [
				'auth' => 'oauth'
			]);
			$accessToken = array();
			parse_str($accessTokenResponse->getBody(), $accessToken);
			$profileOauth = new Oauth1([
				'consumer_key' => Config::get('app.twitter_key'),
				'consumer_secret' => Config::get('app.twitter_secret'),
				/*'oauth_token' => $accessToken['oauth_token'],
				'token_secret' => ''*/
				'token' => $accessToken['oauth_token'],
				'token_secret' => $accessToken['oauth_token_secret'],
			]);
			$stack->push($profileOauth);
			$client = new GuzzleHttp\Client([
				'handler' => $stack
			]);
			$data = $request->all();

			if(isset($data['type']) && $data['type'] == 'orderShare'){						

				try{
					$profileResponse = $client->request('POST', 'https://api.twitter.com/1.1/statuses/update.json', [
						'query' => ['status' => 'https://www.alcoholdelivery.com.sg'],
						'auth' => 'oauth'
					]);
					$profile = json_decode($profileResponse->getBody(), true);
					$profile['provider'] = 'twitter';
					return $this->creditloyalty($request,$profile);
				}catch(\GuzzleHttp\Exception\ClientException $e){
					$message = json_decode($e->getResponse()->getBody(), true);
					$resmessage = 'Something went wrong';
					if(isset($message['errors'][0]['code']) && $message['errors'][0]['code']==187){
						$resmessage = 'You have already shared this purchase.';
					}
					return response(['message' => $resmessage,'e' => $message],422);
				}							
				
			}
			// Step 4. Retrieve profile information about the current user.
			$profileResponse = $client->request('GET', 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true', [
				'auth' => 'oauth'
			]);
			$profile = json_decode($profileResponse->getBody(), true);

			$profile['providername'] = 'twitter';

			return $this->socialLogin($profile);
			
		}
	}

	/**
	 * Login with Instagram.
	 */
	public function instagram(Request $request)
	{
		$client = new GuzzleHttp\Client();
		$params = [
			'code' => $request->input('code'),
			'client_id' => $request->input('clientId'),
			'client_secret' => Config::get('app.instagram_secret'),
			'redirect_uri' => $request->input('redirectUri'),
			'grant_type' => 'authorization_code',
		];
		// Step 1. Exchange authorization code for access token.
		$accessTokenResponse = $client->request('POST', 'https://api.instagram.com/oauth/access_token', [
			'form_params' => $params
		]);
		$accessToken = json_decode($accessTokenResponse->getBody(), true);

		$profile = [];

		if(isset($accessToken['user'])){
			$profile = $accessToken['user'];
			if(isset($profile['full_name']))
				$profile['name'] = $profile['full_name'];
		}

		$profile['providername'] = 'instagram';

		return $this->socialLogin($profile);        
		
	}

	/**
     * Login with LinkedIn.
     */
    public function linkedin(Request $request)
    {
        $client = new GuzzleHttp\Client();
        $params = [
            'code' => $request->input('code'),
            'client_id' => $request->input('clientId'),
            'client_secret' => Config::get('app.linkedin_secret'),
            'redirect_uri' => $request->input('redirectUri'),
            'grant_type' => 'authorization_code',
        ];
        // Step 1. Exchange authorization code for access token.
        $accessTokenResponse = $client->request('POST', 'https://www.linkedin.com/uas/oauth2/accessToken', [
            'form_params' => $params
        ]);
        $accessToken = json_decode($accessTokenResponse->getBody(), true);
        
        $data = $request->all();

		if(isset($data['type']) && $data['type'] == 'orderShare'){				
			$payload = [
				'content' => [
            		'title' => 'Just made a purchase from https://www.alcoholdelivery.com.sg',            		
            		'submitted-url' => 'https://www.alcoholdelivery.com.sg'
            	],
            	'visibility' => ['code' => 'anyone']
			];
			try{				
				$profileResponse = $client->request('POST', 'https://api.linkedin.com/v1/people/~/shares', [
					'query' => [
		                'format' => 'json',
		                'oauth2_access_token' => $accessToken['access_token'],
		            ],
	                'headers' => [
	                	'Content-Type' => 'application/json',
	                	'x-li-format' => 'json'
	                ],
	                'body' => json_encode($payload)
				]);

				$profile = json_decode($profileResponse->getBody(), true);				

				return $this->creditloyalty($request,$profile);

			}catch(\GuzzleHttp\Exception\ClientException $e){
				$message = json_decode($e->getResponse()->getBody(), true);
				$resmessage = 'Something went wrong';				
				return response(['message' => $resmessage,'e' => $message],422);
			}
		}


        // Step 2. Retrieve profile information about the current user.
        $profileResponse = $client->request('GET', 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address)', [
            'query' => [
                'oauth2_access_token' => $accessToken['access_token'],
                'format' => 'json'
            ]
        ]);
        $profile = json_decode($profileResponse->getBody(), true);
        
        return response($profile);

    }

	public function postSocialverification(Request $request){

		//CHECK SESSION DATA		
		$socialData = $request->session()->get('socialData');
		if(empty($socialData)){
			return response(['email'=>['We could not recognize your request, please try again.']], 422);
		}

		$data = $request->all();

		if(isset($data['email']))
			$data['email'] = strtolower($data['email']);
		
		$validator = Validator::make($data, [			
			'email' => 'required|email|max:255',			
		]);

		if ($validator->fails()) {
			return response($validator->errors(), 422);
		}else{

			$data['email_key'] = (string)new MongoId();
			$providerData = $this->providers($socialData['providername']);		    
			$field = $providerData['field'];
			$providername = $providerData['name'];
			$checkUser = User::whereRaw([
				$field => ['$eq' => $socialData['id']]
			])->first();

			if($checkUser){
				return response(['email' => ['We already have an account linked with this social login.']],422);
			}

			$user = User::where('email',$data['email'])->first();

			if($user){				
				$user->socialData = $socialData;
				$user->email_key = $data['email_key'];
				$user->save();
			}else{
				$user = User::create([
					'email' => $data['email'],
					'socialData' => $socialData,
					'name' => $socialData['name'],
					'status' => 1,
					'verified' => 1,
					'email_key' => $data['email_key']
				]);
			}		

			$email = new Email('verifyemail');
			$email->sendEmail($user);	

			$request->session()->forget('socialData');
			return response(['message' => 'Verification email has been sent successfully. Please check your mail to verify your account'], 200);
		}

	}

	public function socialverifyemail($key){		

		$user = User::where("email_key","=",$key)->first();

		if(empty($user->_id) || !isset($user->socialData)){
			return redirect('/mailverified/0');
		}
		

		$socialData = $user->socialData;
		$providerData = $this->providers($socialData['providername']);		    
		$field = $providerData['field'];
		$providername = $providerData['name'];		

		$checkUser = User::whereRaw([
			$field => ['$eq' => $socialData['id']]
		])->first();

		if($checkUser){
			return redirect('/mailverified/0');
		}

		$user->$field = $socialData['id'];
		$user->save();
		$user->unset("email_key");
		$user->unset("socialData");
		
		Auth::login($user);

		return redirect('/socialmailverified/'.$socialData['providername']);
	}

	public function creditloyalty(Request $request,$profile = []){

		$data = $request->all();

		$settings = Setting::where('_id','loyalty')->first();

		$user = Auth::user('user');

		//SHARING PURCHASE
		if(isset($data['type']) && $data['type'] == 'orderShare'){
			$message = 'Loyalty points for sharing purchase has been credited to your account.';
			//CHECK IF POINTS FOR SHARING HAS GIVEN TO USER
			$checkOrder = Orders::where('reference',$data['key'])->where('sharing','exists',false)->first();

			if($checkOrder){
				$checkOrder['sharing'] = [$data['provider'] => $data];

				if($checkOrder->save()){
					$loyaltyObj = [
						'points'=>$settings['settings']['order_sharing']['value'],
						'method'=>'orderShare',
						'reference' => $data['key'],
						'user' => new mongoId((string)$user->_id),
						'comment'=> 'You have earned this points by sharing your purchase on '.$data['provider']
					];
					LoyaltyTransactions::transaction('credit',$loyaltyObj,$user);
				}
				//$checkOrder->push('sharing.'.$data['provider'],$data);				
			}else{ //POINTS FOR SHARING HAS ALREADY GIVEN
				$message = 'Loyalty points for sharing this purchase has already been credited to your account.';
			}
		}//LIKE FB PAGE
		else{
			
			if(!isset($user['fblike'])){
				
				$user->fblike = 1;

				if($user->save()){

					$message = 'Loyalty points for page like has been credited to your account.';
					
					$loyaltyObj = [
							'points'=>$settings['settings']['site_sharing']['value'],
							'method'=>'pageLike',
							'reference' => $data['key'],
							'user' => new mongoId((string)$user->_id),
							'comment'=> 'You have earned this points by facebook page like'
					];
			
					LoyaltyTransactions::transaction('credit',$loyaltyObj,$user);

				}

			}else{
				$message = 'Loyalty points for page like has already been credited to your account.';
			}
			
		}

		return response(['message' => $message]);

	}
}
	
