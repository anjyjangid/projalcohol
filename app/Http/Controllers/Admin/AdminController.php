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

    public function profile()
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

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|min:3',
            'last_name' => 'required|min:3',
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response($validator->errors(), 422);
        }

        $admin = Admin::where('_id', Auth::user('admin')->id)->first();
        
		$admin->first_name = $request->input('first_name');
		$admin->last_name = $request->input('last_name');
		$admin->email = $request->input('email');
		$admin->save();
        return response($admin, 200);
    }

    public function updatepassword(Request $request)
    {
        
        $admin = Admin::where('_id', Auth::user('admin')->id)->first();
        $mismatchpass = false;    
        if (\Hash::check($request->input('current_password'), $admin->password) === false) {
            $mismatchpass = 'Incorrect current password.';            
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:6|max:8|different:current_password',
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

    public function postSubadmin(SubadminRequest $request,$id=null){

        $data = $request->all();

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
}
