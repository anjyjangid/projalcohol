<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class DontMissRequest extends Request
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
        //return [];
        $input = Input::all();

        $rules = [

            'quantity' => 'required|integer',
            'products' => 'required|array|min:1',

        ];                

        return $rules;
    }

    public function messages()
    {

        $messages = [
            'required' => 'This field is required',            
            'products.required' => 'Please add atleast one image.'
        ];

        return $messages;

    }


    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
