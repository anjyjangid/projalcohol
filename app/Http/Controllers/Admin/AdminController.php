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

    public function customers(Request $request)
    {
        $params = $request->all();

        //$columns = array('_id','','name','email','status');

        $users = new User;

        

        if(isset($params['name']) && trim($params['name'])!=''){
          $pname = $params['name'];
          $users = $users->where('name','regexp', "/.*$pname/i");
        }

        if(isset($params['email']) && trim($params['email'])!=''){
            $pemail = $params['email'];
            $users = $users->where('email','regexp',"/.*$pemail/i");
        }

        if(isset($params['status']) && trim($params['status'])!=''){
          $users = $users->where('status',(int)$params['status']);
        }


        $iTotalRecords = $users->count();
        $iDisplayLength = intval($_REQUEST['length']);
        $iDisplayLength = $iDisplayLength < 0 ? $iTotalRecords : $iDisplayLength; 
        $iDisplayStart = intval($_REQUEST['start']);
        $sEcho = intval($_REQUEST['draw']);
        
        $records = array();
        $records["data"] = array(); 

        $end = $iDisplayStart + $iDisplayLength;
        $end = $end > $iTotalRecords ? $iTotalRecords : $end;

        $fstatus = [['danger'=>'Disabled'],['success'=>'Enabled']];

        $notordered = true;


        $columns = ['name','email','status','_id'];

        //prd($params);
        if ( isset( $params['order'] ) ){
            foreach($params['order'] as $orderKey=>$orderField){
                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    $notordered = false;                    
                    $users = $users->orderBy($columns[$orderField['column']],$orderField['dir']);                    
                }
            }
        }
        /*if ( isset( $params['order'] ) ){

            foreach($params['order'] as $orderKey=>$orderField){

                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    $ordered = false;                    
                    $users = $users->orderBy($columns[$orderField['column']],$orderField['dir']);
                    
                }
            }

        }  */

        //prd($users);
        
        if($notordered){
          $users = $users->orderBy('_id','desc');
        }

        $users = $users->skip($iDisplayStart)        
        ->take($iDisplayLength)->get();

        $ids = $iDisplayStart;
        //prd($users);
        foreach($users as $i => $user) {
            
            if(isset($user->status))
            {
                $status1 = $fstatus[$user->status];

                $status = current($status1);
                $color = key($status1);
            }
            else
            {
                $status = "";
                $color = "default";
            }
            
            //prd($user);
            $records["data"][] = array(
              "name" => $user->name,
              "email" => $user->email,
              "status" => $user->status,
              "_id" => $user->_id,
              //'<span class="label label-sm label-'.$color.'">'.$status.'</span>',
              //'<a href="#/user/edit/'.$user->_id.'" class="btn btn-xs default btn-editable"><i class="fa fa-pencil"></i> Edit</a>'
              
            );
        }

        if (isset($_REQUEST["customActionType"]) && $_REQUEST["customActionType"] == "group_action") {
            $records["customActionStatus"] = "OK"; // pass custom message(useful for getting status of group actions)
            $records["customActionMessage"] = "Group action successfully has been completed. Well done!"; // pass custom message(useful for getting status of group actions)
        }
        $records["draw"] = $sEcho;
        $records["recordsTotal"] = $iTotalRecords;
        $records["recordsFiltered"] = $iTotalRecords; 

        return response($records);




        /*$params = $request->all();

        $customers = new User;
        //prd($params);
        extract($params);      

        if(isset($params['search']['name']) && trim($params['search']['name'])!=''){
            $sval = $params['search']['name'];
            $customers = $customers->where('name','regexp', "/.*$sval/i");
        }

        if(isset($params['search']['email']) && trim($params['search']['email'])!=''){
            $sval = $params['search']['email'];
            $customers = $customers->where('email','regexp', "/.*$sval/i");
        }

        if(isset($params['search']['status']) && trim($params['search']['status'])!=''){
            $sval = $params['search']['status'];
            $customers = $customers->where('status','regexp', "/.*$sval/i");
        }

        $iTotalRecords = $customers->count();      
      
        $columns = ['name','email','status','_id'];

        $notordered = true;
        if ( isset( $params['order'] ) ){
            foreach($params['order'] as $orderKey=>$orderField){
                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    $notordered = false;                    
                    $customers = $customers->orderBy($columns[$orderField['column']],$orderField['dir']);                    
                }
            }
        }

        $customers = $customers
        ->skip((int)$start)
        ->take((int)$length);

        if($notordered){
            $customers = $customers->orderBy('name','asc')->orderBy('email','asc');
        }

        $customers = $customers->get($columns);
      
        $response = [
        'recordsTotal' => $iTotalRecords,
        'recordsFiltered' => $iTotalRecords,
        'draw' => $draw,
        'length' => $length,
        'aaData' => $customers
        ];
        
        return response($response,200);*/

















        /*$users = User::all()->toArray();
        $status_list = array(
            array("success" => "Pending"),
            array("info" => "Closed"),
            array("danger" => "On Hold"),
            array("warning" => "Fraud")
          );

        $records = [
            "iTotalRecords" => User::count(),
            "iTotalDisplayRecords" => User::count(),
        ];
        
        $sEcho = intval($_REQUEST['draw']);
        foreach($users as $key=>$value) {
            $status = $status_list[rand(0, 2)];
            $records["data"][] = array(
              '<input type="checkbox" name="id[]" value="'.$value['_id'].'">',
              $value['_id'],
              '12/09/2013',
              'Jhon Doe',
              'Jhon Doe',
              '450.60$',
              rand(1, 10),
              '<span class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span>',
              '<a href="javascript:;" class="btn btn-xs default"><i class="fa fa-search"></i> View</a>',
            );
        }
        $records["draw"] = $sEcho;
        $records["recordsTotal"] = count($users);
        $records["recordsFiltered"] = count($users);
       return  json_encode($records);*/
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
}
