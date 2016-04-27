<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class TestimonialRequest extends Request
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
            
            'name' => 'required|string|max:255',            
            'content' => 'required|max:1000',
            'status'=> 'integer|in:0,1',            
            
        ];

        if(isset($this->one)){

            if($this->hasFile('image')){

                $rules['image'] = 'mimes:jpeg,bmp,png|max:5000';

            }

        }else{

            $rules['image'] = 'required|mimes:jpeg,bmp,png|max:5000';

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
