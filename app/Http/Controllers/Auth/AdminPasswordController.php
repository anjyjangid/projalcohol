<?php
 
namespace AlcoholDelivery\Http\Controllers\Auth;
use AlcoholDelivery\Http\Controllers\Controller;
use Sarav\Multiauth\Foundation\ResetsPasswords;
 
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

}