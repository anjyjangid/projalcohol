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

    public function dashboard(){        
        return view('admin/dashboard');
    }

    public function customers()
    {

        $users = User::all()->toArray();
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
       return  json_encode($records);
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
            return response($validator->errors()->all(), 422);
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
        $validator = Validator::make($request->all(), [
            'old_password' => 'required|min:6|max:8',
            'password' => 'required|min:6|max:8',
            'password_confirm' => 'required|same:password',
        ]);

        if ($validator->fails()) {
            return response($validator->errors()->all(), 422);
        }

        $admin = Admin::where('_id', Auth::user('admin')->id)->first();
        
        if (\Hash::check($request->input('old_password'), $admin->password)) {
            $admin->password = \Hash::make($request->input('password'));
            $admin->save();
            return response($admin, 200);
        }else{
            return response(['Incorrect current password.'], 422);
        }       
        
    }
}
