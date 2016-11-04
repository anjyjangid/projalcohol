<?php
 
namespace AlcoholDelivery\Http\Controllers\Auth;
use AlcoholDelivery\Http\Controllers\Controller;
use Sarav\Multiauth\Foundation\ResetsPasswords;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;
use Illuminate\Auth\Passwords\TokenRepositoryInterface;
use Validator;
use AlcoholDelivery\Admin;
use AlcoholDelivery\Email;
 
class AdminPasswordController extends Controller
{
    use ResetsPasswords;
 
    /**
     * Create a new password controller instance.
     *
     * @return void
     */
    public function __construct()
    {        
        $this->user = "admin";
        $this->middleware('admin.guest');
    }   

    /**
     * Send a reset link to the given user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function postEmail(Request $request, TokenRepositoryInterface $tokens)
    {
        //$this->validate($request, ['email' => 'required|email']);

        $data = $request->all();
        
        if(isset($data['email']))
            $data['email'] = strtolower($data['email']);

        $validator = Validator::make($data, 
            ['email' => 'required|email|exists:admin'],
            ['email.exists' => 'We can\'t find a user with that e-mail address.']
        );

        if ($validator->fails()) {
            return response($validator->errors(), 422);
        }

        $user = Admin::where('email','=',$data['email'])->first();

        $user->email_key = $tokens->create($user);
        
        $user->save();

        $email = new Email('forgot');
        
        $data = $user->toArray();
        $data['isAdmin'] = true;

        $res = $email->sendEmail($data);

        if($res){
            return response(['status'=>'Check your email for a link to reset your password.'],200);
        }else{
            return response(['email'=>'Error in sending email'],200);
        }


        /*$app = app();

        $class = str_ireplace('App\Http\Controllers\\', '', get_called_class());

        view()->composer($app->config['auth.password.email'], function($view) use ($class) {
            $view->with('action', $class.'@getReset');
        });             

        $response = Password::sendResetLink($request->only('email'), function (Message $message) {
            $message->subject($this->getEmailSubject());
        });

        switch ($response) {
            case Password::RESET_LINK_SENT:
                return response(['status'=>[trans($response)]],200);
            case Password::INVALID_USER:
                return response(['email' => [trans($response)]],422);
                                
        }*/
    } 


    /**
     * Reset the given user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function postReset(Request $request)
    {
        $data = $request->all();
        $user = Admin::where('email_key','=',$request->input('token'))->first();
        if(!$user){
            return response(['invalid'=>'Invalid or expired link.'],422);
        }        
        $validator = Validator::make($data, [
            'token'    => 'required',
            'password' => 'required|confirmed|between:8,32',
            'password_confirmation' => 'required',
        ],[           
           
        ]);
        if ($validator->fails()) {
            return response($validator->errors(), 422);
        }
        $user->password = bcrypt($request->input('password'));
        $user->save();
        $user->unset('email_key');
        return response(['message'=>'Password reset successfully'],200);       
        
    }

    public function getReset(Request $request,$token = null)
    {
        $isExpired = ['message'=>'Invalid or expired link'];
        if (is_null($token)) {
            return response($isExpired,400);
        }

        $user = Admin::where('email_key','=',$token)->first();

        if(!$user){
            return response($isExpired,400);
        }else{
            return response([],200);
        }        
    }

}