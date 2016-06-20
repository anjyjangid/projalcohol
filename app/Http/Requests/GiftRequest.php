<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class GiftRequest extends Request
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
            'type' => 'required',
            'title' => 'required',
            'subTitle' => 'required',
            'description' => 'required',
            'limit' => 'required_if:type,1,2',                        
            'range' => 'required_if:type,4|array|min:1',
            'status' => 'required|integer'            
        ];
        
        //VALIDATION FOR COCKTAIL TYPE
        
        if(!isset($input['coverImage']) || !empty($input['image']['thumb'])){
            $rules['image.thumb'] = 'required|image|max:5102';
        }       

        return $rules;
    }

    public function messages(){

        $messages = [
            'required' => 'This field is required',            
            'coverImage.thumb.required' => 'Cover image is required.',                        
        ];                
        return $messages;
    }

    

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
