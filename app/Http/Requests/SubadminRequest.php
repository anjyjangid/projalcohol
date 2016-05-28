<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;


class SubadminRequest extends Request
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

        $rules = [            
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',            
            'email' => 'required|email|max:255|unique:admin,email,'.@$input['_id'].",_id",            
            'password' => 'required|between:6,12',
            'confirmPassword' => 'required|same:password',
            'status'=> 'required|integer|in:0,1',            
        ];

        if(isset($input['_id']) && trim($input['_id'])!=''){
            unset($rules['password']);
            unset($rules['confirmPassword']);
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
