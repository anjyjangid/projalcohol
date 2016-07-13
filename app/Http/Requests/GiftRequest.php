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
            'category' => 'required',
            'subcategory' => 'required',
            'limit' => 'required_if:type,1',
            'costprice' => 'required|numeric',
            'status' => 'required|integer'            
        ];
        
        //VALIDATION FOR COCKTAIL TYPE        
        if(!isset($input['coverImage']) || !empty($input['image']['thumb'])){
            $rules['image.thumb'] = 'image|max:5102';
        }       

        if(isset($input['gift_packaging'])){
            $rules['gift_packaging.value'] = 'required|numeric';
            $rules['gift_packaging.type'] = 'required|numeric';
        }

        return $rules;
    }

    public function messages(){

        $messages = [
            'required' => 'This field is required',            
            'coverImage.thumb.required' => 'Cover image is required.',
            'limit.required_if' => 'This field is required.'                        
        ];                
        return $messages;
    }

    

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
