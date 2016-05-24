<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\User as User;

use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function checkAuth(Request $request)
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
        if (!Auth::attempt('user',$credentials)) {
            $invalidcredentials = 'Username password does not match';            
        }
        
        if ($validator->fails() || $invalidcredentials){
            
            if($invalidcredentials){
                $validator->errors()->add('email',$invalidcredentials);
                $validator->errors()->add('password',' ');
            }

            return response($validator->errors(), 422);
        }

        return response(Auth::user('user'), 200);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $categories = Categories::all()->toArray();
        return view('frontend',array('categories'=>$categories));
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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request)
    {
        $inputs = $request->all();
        $user = Auth::user('user');
        // validation rules
        $validator = Validator::make($inputs, [
            'name' => 'required',
            'email' => 'required|email|max:255|unique:user,email,'.$user->_id.",_id",
            'mobile_number'=> 'required|numeric|digits_between:10,12',
        ],[
           'mobile_number.required' => 'Mobile number is required',
           'mobile_number.numeric' => 'please enter valid mobile number',
           'mobile_number.digits_between' => 'please enter valid mobile number'
        ]);
        
        $return = array("success"=>false,"message"=>"","data"=>"");

        if ($validator->fails()) {
            
            $return['message'] = "Please check form again";
            $return['data'] = $validator->errors();

            return response($return, 400);
        }
                
        $curruser = User::find($user->_id);

        $curruser->name = $inputs['name'];
        $curruser->email = $inputs['email'];
        $curruser->mobile_number = $inputs['mobile_number'];

        try {

            $curruser->save();

            $return['success'] = true;
            $return['message'] = "profile updated successfully";
                        
        } catch(\Exception $e){
            $return['message'] = "Something wrong";//$e->getMessage();            
        }

        return response($return);
        
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updatepassword(Request $request)
    {
        $inputs = $request->all();
        $user = Auth::user('user');
        // validation rules
        $curruser = User::find($user->_id);
         

        $inputs['old'] = '';

        if (\Hash::check($inputs['current'], $curruser->password) === true) {
            $inputs['old'] = $inputs['current'];
        }

        $validator = Validator::make($inputs, [
            'current' => 'required|same:old',
            'new' => 'required|between:6,12|different:current',
            'confirm' => 'required|same:new',            
        ],[                      
           'current.same' => 'Incorrect current password.',
           'new.digits_between' => 'password must be between 6 to 12 characters'
        ]);

        $validatorForFbLogin = Validator::make($inputs, [
            'new' => 'required|between:6,12|different:current',
            'confirm' => 'required|same:new',            
        ],[                      
           'new.digits_between' => 'password must be between 6 to 12 characters'
        ]);

        $return = array("success"=>false,"message"=>"","data"=>"");

        // if fb login then do not check current password //
        if($curruser->password=="")
        {
            if ($validatorForFbLogin->fails()) {

                $return['message'] = "Please check form again";
                $return['data'] = $validator->errors();

                return response($return, 400);
            }
        }
        else
        {
            if ($validator->fails()) {

                $return['message'] = "Please check form again";
                $return['data'] = $validator->errors();

                return response($return, 400);
            }
        } 

        $curruser->password = \Hash::make($request->input('new'));
                
        try {

            $curruser->save();

            $return['success'] = true;
            $return['message'] = "password updated successfully";
                        
        } catch(\Exception $e){
            $return['message'] = "Something wrong";//$e->getMessage();            
        }

        return response($return);
        
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

    public function check(){
        return response(Auth::user('user'), 200);
    }

    public function loggeduser(){

        $userLogged = Auth::user('user');

        if(!empty($userLogged)){
            $userLogged = User::find($userLogged->_id);
            
            $userLogged['loginfb'] = false;
            if($userLogged['password']=="")
                $userLogged['loginfb'] = true;
        }
        else{
            $userLogged = array("auth"=>false);
        }

        return response($userLogged, 200);
    }

    public function postNotifyme(Request $request){

        $param = $request->all();

        $userLogged = Auth::user('user');

        $user = User::find($userLogged->_id);

        $user->push('productAddedNotification',$param['pid'],true);        

        return response ($user,200);

    }


}
