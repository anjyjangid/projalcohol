<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class PromotionalBannersRequest extends Request
{    
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(){

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(){

        $input = Input::all();
        
        if(isset($input['_id'])){
            $rules = [
                'status'=>'required|integer|in:0,1,2',
            ];

            if(isset($input['promotionalImage']) && is_array($input['promotionalImage'])){
                $rules['promotionalImage'] = 'required|image|mimes:jpeg,jpg,png';
            }

            if(isset($input['promotionalImageMobile']) && is_array($input['promotionalImageMobile'])){
                $rules['promotionalImageMobile'] = 'required|image|mimes:jpeg,jpg,png';
            }
        }else{
            $rules = [
                'status'=>'required|integer|in:0,1,2',
                'promotionalImage'=>'required|image|mimes:jpeg,jpg,png',
                'promotionalImageMobile'=>'required|image|mimes:jpeg,jpg,png',
            ];
        }

        return $rules;
    }

    public function messages(){

        $messages = [
                'required' => 'This field is required'
        ];

        return $messages;
    }

    public function forbiddenResponse(){

        return Response::make('message',403);
    }
}