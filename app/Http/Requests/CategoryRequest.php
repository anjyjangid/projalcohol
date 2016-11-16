<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class CategoryRequest extends Request
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
            'title' => 'required',
            'slug'  => 'required',
            'isMenu'=> 'required|integer|in:0,1',
            'thumb' => 'required',
            'metaTitle' => 'required|max:100',
            'metaKeywords' => 'required|max:200',
            'metaDescription' => 'required|max:200',
        ];
        
        if($this->hasFile('thumb')){
            $rules['thumb'] = 'required|image|max:5102';
        }

        if(isset($input['ptitle']) && trim($input['ptitle']) != ''){
            unset($rules['thumb']);
        }

        
        return $rules;

    }
}
