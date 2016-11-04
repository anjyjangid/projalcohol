<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class CouponRequest extends Request
{    
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {                
        
        $inputs = $this->all();            

        $rules = [

            'code' => 'required|string|max:150|unique:coupons',            
            'type'=> 'required|integer|in:0,1',            
            'discount' => 'required|numeric|max:100000',
            'status'=> 'required|integer|in:0,1',
            
        ];

        if($inputs['type']==0){
            $rules['discount'] = 'required|numeric|max:99';
        }

        switch ($this->method()) {
            case 'PUT':
            case 'PATCH':
            {
                $rules['code'] = 'required|string|max:150|unique:coupons,'.$this->coupon.',_id';
            }
        }            

        return $rules;
    }

    public function messages()
    {

        $inputs = $this->all();

        $messages = [
            'required' => 'This field is required',
        ];

        if($inputs['type']==0){
            $messages['discount.max'] = 'The discount not be greater than 99% when its applied as percentage';
        }

        return $messages;

    }


    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
