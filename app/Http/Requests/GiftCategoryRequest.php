<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class GiftCategoryRequest extends Request
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
            'title' => 'required|unique:giftcategories,title,'.@$input['_id'].',_id,parent,'.@$input['parent'],
            'status' => 'required|integer'            
        ];    

        /*if(!isset($input['coverImage']) || !empty($input['image']['thumb'])){
            $rules['image.thumb'] = 'required|image|max:5102';
        }*/

        return $rules;
    }

    public function messages(){

        $messages = [
            'required' => 'This field is required',                        
        ];                
        return $messages;
    }

    

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
