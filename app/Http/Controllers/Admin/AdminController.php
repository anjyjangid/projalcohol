<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\User as User;
use Illuminate\Support\Facades\Validator;
use AlcoholDelivery\Admin;
use AlcoholDelivery\Http\Requests\SubadminRequest;
use Hoiio\HoiioService;
use GuzzleHttp\Client;
use AlcoholDelivery\Products;
use AlcoholDelivery\Orders;
use AlcoholDelivery\Email;

class AdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('admin');        
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        
        return view('backend');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return 'CREATE';
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }   

    public function home()
    {
        return view('backend');
    }

    public function getProfile()
    {
        return response(\Auth::user('admin'), 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */

    public function postUpdate(Request $request)
    {
        $data = $request->all();
        if(isset($data['email'])){
            $data['email'] = strtolower($data['email']);
        }

        $validator = Validator::make($data, [
            'first_name' => 'required|min:3',
            'last_name' => 'required|min:3',
            'email' => 'required|email|max:255|unique:admin,email,'.Auth::user('admin')->id.',_id',
        ]);

        if ($validator->fails()) {
            return response($validator->errors(), 422);
        }

        $admin = Admin::where('_id', Auth::user('admin')->id)->first();
        
		$admin->first_name = $data['first_name'];
		$admin->last_name = $data['last_name'];
		$admin->email = $data['email'];
		$admin->save();
        return response($admin, 200);
    }

    public function postUpdatepassword(Request $request)
    {
        
        $admin = Admin::where('_id', Auth::user('admin')->id)->first();
        $mismatchpass = false;    
        if (\Hash::check($request->input('current_password'), $admin->password) === false) {
            $mismatchpass = 'Incorrect current password.';            
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|between:8,32|different:current_password',
            'retype_password' => 'required|same:new_password',
        ]);

        if ($validator->fails() || $mismatchpass) {
            
            if($mismatchpass)
                $validator->errors()->add('current_password',$mismatchpass);
            
            return response($validator->errors(), 422);
        }

        $admin->password = \Hash::make($request->input('new_password'));
        $admin->save();
        return response($admin, 200);
    }

    public function postSubadmin(Request $request,$id=null){

        $data = $request->all();        

        if(isset($data['email'])){
            $data['email'] = strtolower($data['email']);
        }

        $rules = [            
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',            
            'email' => 'required|email|max:255|unique:admin,email,'.@$id.',_id',            
            'password' => 'required|between:8,32',
            'confirmPassword' => 'required|same:password',
            'status'=> 'required|integer|in:0,1',            
        ];

        if($id!=null){
            unset($rules['password']);
            unset($rules['confirmPassword']);
        }        

        $validator = Validator::make($data, $rules, [
            'required' => 'This field is required'
        ]);

        if ($validator->fails()) {
            return response($validator->errors(), 422);
        }

        $inputs = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],            
            'status' => (int)$data['status'],
            'role' => 2
        ];

        $saved = false;
        
        if($id){//IN CASE OF UPDATE            
            $saved = Admin::find($id);            
            $saved->update($inputs);
        }else{//IN CASE OF NEW
            $inputs['password'] = bcrypt($data['password']);
            $saved = Admin::create($inputs);
            if($saved){

            }
        }

        if($saved){
            return response($saved,201);

        }else{
            return response(['message'=>'Error in saving subadministrator'],422);
        }

    }

    public function postSubadminlist(Request $request){

        $params = $request->all();

        extract($params);
        
        $subadmin = new Admin;

        if(isset($name) && trim($name)!=''){
            $subadmin = $subadmin->where('first_name','like', '%'.$name.'%')->orWhere('last_name','like', '%'.$name.'%');            
        }

        $subadmin = $subadmin->where('role',2);

        $iTotalRecords = $subadmin->count();

        if(isset($email) && trim($email)!=''){
            $subadmin = $subadmin->where('email','like', '%'.$email.'%');            
        }

        if(isset($status) && trim($status)!=''){
            $subadmin = $subadmin->where('status',(int)$status);            
        }

        $subadmin = $subadmin->orderBy('created_at','desc');

        $subadmin = $subadmin
        ->skip((int)$start)
        ->take((int)$length)->get();

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $subadmin            
        ];      
        return response($response,200);
    }

    public function getSubadminuser(Request $request,$id){

        $subadmin = Admin::where('_id',$id)->where('role',2)->first();

        if($subadmin){
            return response($subadmin,200);
        }else{
            return response(['message'=>'Invalid user.'],404);
        }
    }    

    public function getStats(Request $request){        
        $totalProducts = Products::count();
        $totalOrder = Orders::count();   
        $avgOrders = Orders::avg('payment.total');

        $res = ['totalProducts'=>$totalProducts,'totalOrder'=>$totalOrder,'avgOrders'=>$avgOrders];

        return response($res,200);
    }

    public function postNotify(Request $request){
        
        $data = $request->all();  

        if($data['sms']==0 && $data['mail']==0){
            return response(['message'=>'Please select atleast 1 sending option.'],400);
        }

        $order = Orders::find($data['oid']);

        $mailsent = $smssent = false;
        
        if($order){
            $user = User::find((string)$order['user'])->toArray();
            
            if($data['mail'] == 1){
                $mail = new Email('deliverynotification');
                $user['order_number'] = $order['reference'];
                $user['time_of_delivery'] = $data['time'];
                $mailsent = $mail->sendEmail($user);
            }
            
            if(isset($user['mobile_number']) && $data['sms'] == 1){
                $msgtxt = 'Your designated {site_title} dispatch personnel will be delivering order #{order_number} within {time_of_delivery} minutes! Need help? Call us @ 9-2445533 (9-CHILLED). Thank you!';

                $msgtxt = str_ireplace(['{site_title}','{order_number}','{time_of_delivery}'],[config('app.appName'),$order->reference,$data['time']],$msgtxt);

                $smssent = Email::sendSms($user['mobile_number'],$msgtxt);
            }
            return response(['message'=>'Notification sent successfully.','mailsent'=>$mailsent,'smssent'=>$smssent],200);
        }else{
            return response(['message'=>'Invalid order. Please try again'],400);
        }
        
    }

}
