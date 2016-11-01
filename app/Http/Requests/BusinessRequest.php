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
            'company_email' => 'required|email|max:255|unique:businesses,company_email,'.@$input['_id'].",_id",
        ];
        dd($input);
        // $billing_address = Request::input('billing_address');
        if(!empty($input['address']) && count($input['address'])>0)
            foreach ($this->request->get('address') as $key => $address) {
                $rules['address.'.$key.'.first_name'] = 'required';
                $rules['address.'.$key.'.last_name'] = 'required';
                $rules['address.'.$key.'.receiver_contact'] = 'required';
                $rules['address.'.$key.'.address'] = 'required';
                $rules['address.'.$key.'.instruction'] = 'required';
            }

        // foreach ($this->request->get('billing_address') as $key => $billing_address) {

        //     $rules['billing_address.'.$key.'.typed'] = 'required';
        //     $rules['billing_address.'.$key.'.receiver_contact'] = 'required';
        //     $rules['billing_address.'.$key.'.street'] = 'required';
        //     $rules['billing_address.'.$key.'.receiver_name'] = 'required';
        //     $rules['billing_address.'.$key.'.instruction'] = 'required';
        //     $rules['billing_address.'.$key.'.postal'] = 'required';
        // }

        // foreach ($this->request->get('delivery_address') as $key => $delivery_address) {

        //     $rules['delivery_address.'.$key.'.typed'] = 'required';
        //     $rules['delivery_address.'.$key.'.receiver_contact'] = 'required';
        //     $rules['delivery_address.'.$key.'.street'] = 'required';
        //     $rules['delivery_address.'.$key.'.receiver_name'] = 'required';
        //     $rules['delivery_address.'.$key.'.instruction'] = 'required';
        //     $rules['delivery_address.'.$key.'.postal'] = 'required';
        // }

        return $rules;
    }

    public function messages()
    {
        foreach ($this->request->get('address') as $key => $billing_address) {
            $messages['address.'.$key.'.first_name.required'] = 'The Receiver\'s First Name field is required.';
            $messages['address.'.$key.'.last_name.required'] = 'The Receiver\'s Last Name field is required.';
            $messages['address.'.$key.'.receiver_contact.required'] = 'The Receiver\'s Contact field is required.';
            $messages['address.'.$key.'.address.required'] = 'The Location field is required.';
            $messages['address.'.$key.'.instruction.required'] = 'The Receiver\'s Instruction field is required.';
        }
        // $messages = [
        //     'billing_address.0.first_name.required' => 'This field is required'
        // ];
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
