<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class StoreRequest extends Request
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
            'name' => 'required|max:100',
            'address' => 'required',
            //'latitude' => 'required|numeric',
            //'longitude' => 'required|numeric',
            'metaTitle' => 'required|max:100',
            'metaKeywords' => 'required|max:150',
            'metaDescription' => 'required|max:150',
            'email' => 'required|email',
            'telephone' => 'required|numeric',
        ];
    }
}
