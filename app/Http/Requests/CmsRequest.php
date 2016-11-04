<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class CmsRequest extends Request
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
            
            'section' => 'required',
            'title' => 'required|string|max:255',  
            'linkTitle' => 'required|string|max:100',                        
            //'description' => 'required|max:500',
            'content' => 'required',
            'metaTitle' => 'max:100',
            'metaKeywords' => 'max:150',
            'metaDescription' => 'max:150',            
            'status'=> 'integer|in:0,1',
        ];
                
        return $rules;
    }

    public function messages()
    {

        $messages = [

                'required' => 'This field is required',

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
