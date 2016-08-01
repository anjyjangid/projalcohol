<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class CardRequest extends Request
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
        return [
            'number' => 'required',
            //'cvc' => 'required|numeric',            
            'name' => 'required|max:45|min:3',
            'month' => 'required|numeric|between:1,12',
            'year' => 'required|numeric',            
        ];
    }

    public function messages()
    {

        $messages = [
            'required' => 'This field is required',
        ];

        return $messages;
    }
}
