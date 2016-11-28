<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use AlcoholDelivery\Payment;

use Illuminate\Support\Facades\Validator;
use AlcoholDelivery\Http\Requests\CardRequest;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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

    public function postAddcard(CardRequest $request){
        $data = $request->all();        
        $user = Auth::user('user');
        if($user){                       
            $saveUser = true;
            if(isset($data['token'])){
                $saveUser = false;
            }
            $payment = new Payment();
            $response = $payment->saveCard($data,$user,$saveUser);
            if($response['success'] == true){
                return response($response,200);                
            }else{
                /*return response(['number'=>['Error adding card, please try again or verify your card details.']],422);*/
                return response(['number'=>[$response['response_msg']]],422);
            }
        }else{
            return response('Unauthorized.', 401);
        }
    }

    public function postRemovecard(Request $request){
        
        $data = $request->all();        
        $user = Auth::user('user');
        if($user){                       
            $payment = new Payment();
            $response = $payment->removeCard($data,$user);
            if($response['success'] == true){
                return response($response,200);                
            }else{
                return response(['Cannot remove card, please try again'],422);
            }
        }else{
            return response('Unauthorized.', 401);
        }

    }

    public function postPaykey(Request $request){
        
    }
}
