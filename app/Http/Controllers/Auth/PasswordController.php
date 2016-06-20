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

		$user = User::where('email','=',$data['email'])->first();

		$user->email_key = $tokens->create($user);
		
		$user->save();

		$email = new Email('forgot');
		$email->sendEmail($user->toArray());

		return response(array("success"=>true,"message"=>"Reset link sent successfully"));

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
            return redirect('/');
        }

        $user = User::where("email_key","=",$token)->first();

        if(empty($user->_id)){
			return redirect('/');
		}

		return redirect('/#/reset/'.$token);
        
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
