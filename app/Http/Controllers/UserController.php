<?php

namespace AlcoholDelivery\Http\Controllers;

use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Categories as Categories;

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
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
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
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
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

    public function check(){
        return response(Auth::user('user'), 200);        
    }
}
