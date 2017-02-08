<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class ProductGroupRequest extends Request
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
            'name' => 'required|unique:products',
            'tradeQuantity' => 'required|numeric',
            'tradeValue' => 'required|numeric',
            'cartonQuantity' => 'required|numeric',
            'cartonPurchased' => 'required|integer|in:0,1',
            'minOrder' => 'required_if:cartonPurchased,0|numeric',            
        ];

        return $rules;
    }

    public function messages()
    {
        $messages = ['required' => 'This field is required','required_if' => 'This field is required'];

        return $messages;
    }
}
