<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class EmailTemplate extends Request
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
            
            'title' => 'required|string|max:255',            
            'subject' => 'required|max:500',
            'content' => 'required|max:500',
            //'status'=> 'integer|in:0,1',
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
