<?php
 
namespace AlcoholDelivery\Http\Controllers\Auth;
 
use AlcoholDelivery\Admin;
use Validator;
use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Sarav\Multiauth\Foundation\AuthenticatesAndRegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
 
class AdminAuthController extends Controller
{
    use AuthenticatesAndRegistersUsers, ThrottlesLogins;
 
    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */

    public $redirectAfterLogout = '/admin';

    public function __construct()
    {
        $this->user = "admin";
        $this->middleware('admin.guest', ['except' => 'getLogout']);
    }

    /*public function postLogin(Request $request)
    {        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',            
        ]);

        
        // setting the credentials array
        $credentials = [
            'email' => $request->input('email'),
            'password' => $request->input('password'),
        ];

        $invalidcredentials = false;

        // if the credentials are wrong
        if (!Auth::attempt('admin',$credentials, $request->has('remember'))) {
            $invalidcredentials = 'Username password does not match';            
        }
        
        if ($validator->fails() || $invalidcredentials){
            
            if($invalidcredentials){
                $validator->errors()->add('email',$invalidcredentials);
                $validator->errors()->add('password',' ');
            }

            return response($validator->errors(), 422);
        }

        return response(Auth::user('admin'), 200);
    }*/

}