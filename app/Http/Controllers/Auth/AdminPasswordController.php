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

        $validator = Validator::make($request->all(), [            
                        'email' => 'required|email|exists:admin',            
                    ],[
                       'email.exists' => 'We can\'t find a user with that e-mail address.',                       
                    ]);
        if ($validator->fails()) {
            return response($validator->errors(), 422);
        }

        $user = Admin::where('email','=',$request->input('email'))->first();

        $user->email_key = $tokens->create($user);
        
        $user->save();

        $email = new Email('forgot');
        
        $data = $user->toArray();
        $data['isAdmin'] = true;

        $res = $email->sendEmail($data);       

        if($res){
            return response(['status'=>'We have mailed you the instruction!'],200);
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

}