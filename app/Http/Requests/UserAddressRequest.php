<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class UserAddressRequest extends Request
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

        $rules = [
            
            'firstname' => 'required|string|max:100',
            'lastname' => 'required|string|max:100',
            'company'=> 'string|max:100',
            'building'=>'string|max:100',
            'street'=>'required|string|max:100',
            'postal'=>'required|string|max:10',
            'house'=>'required|string|max:10',
            'floor'=>'integer|max:1000',
            'unit'=>'integer|max:100',
            'instruction'=>'string|max:500'

        ];                    

        return $rules;
    }

    public function messages()
    {

        $messages = [

                'required' => 'Field is required'
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
