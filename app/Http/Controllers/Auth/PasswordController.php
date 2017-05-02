<?php

namespace AlcoholDelivery\Http\Controllers\Auth;

use AlcoholDelivery\Http\Controllers\Controller;

use Validator;
use Illuminate\Http\Request;
use Illuminate\Auth\Passwords\TokenRepositoryInterface;
use Sarav\Multiauth\Foundation\ResetsPasswords;
use AlcoholDelivery\Email as Email;
use AlcoholDelivery\User as User; 

class PasswordController extends Controller
{
	/*
	|--------------------------------------------------------------------------
	| Password Reset Controller
	|--------------------------------------------------------------------------
	|
	| This controller is responsible for handling password reset requests
	| and uses a simple trait to include this behavior. You're free to
	| explore this trait and override any methods you wish to tweak.
	|
	*/

	use ResetsPasswords;

	/**
	 * Create a new password controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->user = "user";
		$this->middleware('guest');
	}

	public function postEmail(Request $request, TokenRepositoryInterface $tokens)
	{
		$data = $request->all();
		
		if(isset($data['email']))
			$data['email'] = strtolower($data['email']);
		
		$validator = Validator::make($data, [            
						'email' => 'required|email|exists:user',            
					],[           
					   'email.required' => 'Please provide your email to reset password.',
					   'email.exists' => 'Seems this email is not registered with us.'
					]);


		if ($validator->fails()) {
			return response($validator->errors(), 422);
		}

		$isMobileApi = isset($data['mobileapi'])?$data['mobileapi']:0;

		$user = User::where('email','=',$data['email'])->first();

		//RETURN ERROR IN CASE USER IS NOT VERIFIED
		if($user && $user->verified==0){
			return response(['email'=>['You need to verify your email. Click below link to resend verification email.'],'reverification'=>[true]],422);
		}

		$user->email_key = $tokens->create($user);
		
		$user->save();
		$userArr = $user->toArray();

		if($isMobileApi==1){
			$resetCode = mt_rand(100000, 999999);
			$userArr["isMobileApi"] = $isMobileApi;
			$userArr["resetCode"] = $resetCode;
		}

		$email = new Email('forgot');
		$email->sendEmail($userArr);

		if($isMobileApi==1){
			return response(array("success"=>true, "code"=>$resetCode, "token"=>$userArr["email_key"], "message"=>"Reset code sent successfully"));
		}else{
			return response(array("success"=>true, "message"=>"Reset link sent successfully"));
		}
	}

	/**
     * Display the password reset view for the given token.
     *
     * @param  string  $token
     * @return \Illuminate\Http\Response
     */
    public function reset($token = null)
    {
        if (is_null($token)) {
            return redirect('/resetexpired');
        }

        $user = User::where("email_key","=",$token)->first();

        if(empty($user->_id)){
			return redirect('/resetexpired');
		}

		return redirect('/resetpassword/'.$token);
        
    }

    /**
     * Reset the given user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function postReset(Request $request)
    {
        
        $validator = Validator::make($request->all(), [
        					'token'    => 'required',
				            'password' => 'required|confirmed|between:8,12',
							'password_confirmation' => 'required',
						],[           
						   
						]);

		if ($validator->fails()) {
			return response($validator->errors(), 422);
		}
       
		$user = User::where("email_key","=",$request->input('token'))->first();

		if(empty($user->_id)){
			return response(array("success"=>false,"token"=>false,"message"=>"Token Not Found"),422);
		}

		$user->password = bcrypt($request->input('password'));

		$user->save();

		$user->unset("email_key");

		return response(array("success"=>true,"message"=>"Password Reset successfully"));
       
        
    }
	


}
