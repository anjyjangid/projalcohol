<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class CustomerRequest extends Request
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
        
        switch ($this->method()) {
            case 'GET':
            case 'DELETE':
                # code...
                break;
            
            case 'POST':
            {
                $rules = [
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|max:255|unique:user',
                    'mobile_number'=> 'required|numeric|digits_between:10,12',
                    'password' => 'required|min:6|confirmed',
                    'password_confirmation' => 'required',
                    'status'=> 'required|integer|in:0,1',
                ];

                break;
            }

            case 'PUT':
            case 'PATCH':
            {
                $rules = [
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|max:255|unique:user,'.$input['_id'].',_id',
                    'mobile_number'=> 'required|numeric|digits_between:10,12',
                    'status'=> 'required|integer|in:0,1',
                ];

                break;
            }

            default:
                # code...
                break;
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
