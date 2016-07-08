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
            'title' => 'required|unique:giftcategories,title',
            //'title' => 'required|unique:giftcategories,title,'.@$input['_id'].',_id,parent,'.@$input['parent'],
            'status' => 'required|integer'            
        ];

        if(isset($input['_id'])){

            $rules['title']='required|unique:giftcategories,title,'.$input['_id'].',_id,parent,'.$input['parent'];
        }

        if(!isset($input['coverImage']) || !empty($input['image']['thumb'])){
            $rules['image.thumb'] = '   image|max:5102';
        }

        if(!isset($input['iconImage']) || !empty($input['image']['iconthumb'])){
            $rules['image.iconthumb'] = '   image|max:5102';
        }

        if(isset($input['type']) && $input['type']=='giftcard'){
            $rules['subTitle'] = 'required';
            $rules['description'] = 'required';
            $rules['cards'] = 'required|array|min:1';

            if (isset($input['cards']) && is_array($input['cards']))
            {
                foreach ($input['cards'] as $imageKey => $image)
                {
                    $ruleKey = 'cards.' . $imageKey;
                    $rules[$ruleKey . '.value'] = 'required|integer';                    
                }
            }
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
        ];                
        return $messages;
    }

    

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
