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
		$this->middleware('guest', ['except' => 'getLogout']);
	}

	/**
	 * Get a validator for an incoming registration request.
	 *
	 * @param  array  $data
	 * @return \Illuminate\Contracts\Validation\Validator
	 */
	protected function validator(array $data)
	{
		
		return Validator::make($data, [
			//'name' => 'required|max:255',
			'email' => 'required|email|max:255|unique:user',
			'password' => 'required|confirmed|min:6',
			'password_confirmation' => 'required',
			'terms' => 'required'
		],[           
		   'terms.required' => 'Please agree terms.'
		]);
	}


	/**
	 * Handle a registration request for the application.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return \Illuminate\Http\Response
	 */
	public function postRegister(Request $request)
	{

		$validator = $this->validator($request->all());

		if ($validator->fails()) {

			return response($validator->errors(), 422);
		}

		$isCreated = $this->create($request->all());

		//Auth::login($this->user(), $this->create($request->all()));
		return response($isCreated, 200);

	}

	public function registerfb(Request $request)
	{
		$data = $request->all();
		$update = false;
		$login = false;

		if(isset($data['fbid']) && $data['fbid']!="" 
			&& isset($data['email']) && $data['email']!="")
		{
			$user = User::where("fbid","=",$data['fbid'])->first();
			if(!empty($user))
			{
				// check if email is same or not //
				/*if(isset($user['email']) && $user['email'] != $data['email'])
				{
					// update data //
					$update = true;
				}*/

				// login //
				$login = true;
			}
			else
			{
				// check based on email //
				$user = User::where("email","=",$data['email'])->first();
				if(!empty($user))
				{
					$update = true;
					$login = true;
				}
			}
		}
		else
		{
			return response(array("success"=>false,"message"=>'Incorrect data'));
		}

		// check if update is true then update data //
		if($update)
		{
			$user->fbid = $data['fbid'];
			$user->email = $data['email'];
			$user->save();
		}
		else if(!$update && !$login)
		{
			// create new record //
			$user = User::create([

				'email' => $data['email'],
				'fbid' => $data['fbid'],
				'name' => $data['name']?$data['name']:'',
				'status' => 1,
				'verified' => 1,

			]);

			$login = true;
		}

		if($login)
		{
			Auth::login($user);
			return response(array("success"=>true,"data"=>$user));
		}

		return response(array("success"=>false,"message"=>'Please try again'));
	}

	/**
	 * Create a new user instance after a valid registration.
	 *
	 * @param  array  $data
	 * @return User
	 */
	protected function create(array $data)
	{

		$data['email_key'] = strtotime(date("Y-m-d H:i:s"));
		
		try {

			$user = User::create([

				'email' => $data['email'],
				'password' => bcrypt($data['password']),
				'email_key' => (string)$data['email_key'],
				'status' => 0,
				'verified' => 0,

			]);
		
		} catch(\Exception $e){

            return response(array("success"=>false,"message"=>$e->getMessage()));
				
		}	

		$email = new Email('welcome');
		$email->sendEmail($data);
		
		return response(array("success"=>true,"message"=>"Account created successfully"));
	}


	public function verifyemail($key){

		$user = User::where("email_key","=",$key)->first();

		if(empty($user->_id)){
			return redirect('/');
		}
		
		$user->status = 1;
		$user->verified = 1;

		$user->save();

		$user->unset("email_key");

		
		return redirect('/#/login');
		
	}

	
}
	