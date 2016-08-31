<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class BusinessRequest extends Request
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
        $input = Input::all();

        $rules = [];

        $rules = [
            'company_name' => 'required|string|max:255',            
        ];

        $billing_address = Request::input('billing_address');
        
        foreach ($this->request->get('billing_address') as $key => $billing_address) {

            $rules['billing_address.'.$key.'.typed'] = 'required';
            $rules['billing_address.'.$key.'.receiver_contact'] = 'required';
            $rules['billing_address.'.$key.'.street'] = 'required';
            $rules['billing_address.'.$key.'.receiver_name'] = 'required';
            $rules['billing_address.'.$key.'.instruction'] = 'required';
            $rules['billing_address.'.$key.'.postal'] = 'required';
        }

        foreach ($this->request->get('delivery_address') as $key => $delivery_address) {

            $rules['delivery_address.'.$key.'.typed'] = 'required';
            $rules['delivery_address.'.$key.'.receiver_contact'] = 'required';
            $rules['delivery_address.'.$key.'.street'] = 'required';
            $rules['delivery_address.'.$key.'.receiver_name'] = 'required';
            $rules['delivery_address.'.$key.'.instruction'] = 'required';
            $rules['delivery_address.'.$key.'.postal'] = 'required';
        }        

        return $rules;
    }

    public function messages()
    {

        $messages = [

                'required' => 'This field is required'
        ];

        return $messages;

    }

    // public function response(array $errors){
        
    //     return $errors;

    // }

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
