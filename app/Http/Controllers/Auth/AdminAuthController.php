<?php
 
namespace AlcoholDelivery\Http\Controllers\Auth;
 
use AlcoholDelivery\Admin;
use Validator;
use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Sarav\Multiauth\Foundation\AuthenticatesAndRegistersUsers;
 
class AdminAuthController extends Controller
{
    use AuthenticatesAndRegistersUsers, ThrottlesLogins;
 
    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */

    public $redirectAfterLogout = "/admin/login";

    public function __construct()
    {
        $this->user = "admin";
        $this->middleware('admin.guest', ['except' => 'getLogout']);
    }



}