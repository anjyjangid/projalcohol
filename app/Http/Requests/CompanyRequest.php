<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class CompanyRequest extends Request
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
            'logo' => 'required',
            'title' => 'required',
            'address' => 'required',
            'city' => 'required',
            'state' => 'required',
            'zip' => 'required',
            'country' => 'required',
            'status' => 'required|integer|in:0,1',
            'invoiceTemplate' => 'required',
        ];

        if($this->hasFile('logo')){
            $rules['logo'] = 'required|image|max:5102';
        }

        return $rules;
    }

    public function messages()
    {

        $messages = [
            'required' => 'This field is required',
        ];

        return $messages;
    }
}
