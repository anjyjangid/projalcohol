<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;


class SettingRequest extends Request
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
        
        switch ($this->setting) {

            case 'general':
                $rules = [
                                
                    'site_title.value' => 'required|string|max:255',

                    'meta_keyword.value' => 'required|max:255',

                    'meta_desc.value' => 'required|max:1000',
                    
                    'currency.value'=> 'required|in:"$","£","SGD"',

                    'language.value'=> 'required|in:"eng","french"',

                    'mode.value'=> 'required|in:"dev","test","live","maintenance"',        

                ];
                break;

            case 'social':
                $rules = [

                    'facebook.value' => 'required|string|max:255',
                    'googleplus.value' => 'required|string|max:255',
                    'instagram.value' => 'required|string|max:255',
                    'twitter.value' => 'required|string|max:255',
                    'youtube.value' => 'required|string|max:255',

                ];
                break;
            case 'pricing':
                $rules = [
                    'advance_order.value' => 'required|numeric',                    
                    'cigratte_services.value' => 'required|numeric',
                    'express_delivery.value' => 'required|numeric',                    
                    'regular_express_delivery.value' => 'required|numeric',
                    'advance_order.type' => 'required|numeric',                    
                    'cigratte_services.type' => 'required|numeric',
                    'express_delivery.type' => 'required|numeric',                    
                    'regular_express_delivery.type' => 'required|numeric',
                ];
                break;
            default:
                # code...
                break;
        }

        if($this->setting == 'pricing'){            
            $input = Input::all();
            foreach ($input['advance_order_bulk']['bulk'] as $bk => $bval)
            {
                $ruleKey = 'advance_order_bulk.bulk.' . $bk;
                $rules[$ruleKey . '.from_qty'] = 'required|numeric|min:1';
                $rules[$ruleKey . '.to_qty'] = 'required|numeric|min:1|max:99999';
                $rules[$ruleKey . '.type'] = 'required|numeric';
                $rules[$ruleKey . '.value'] = 'required|numeric';
            }

            foreach ($input['express_delivery_bulk']['bulk'] as $bk => $bval)
            {
                $ruleKey = 'express_delivery_bulk.bulk.' . $bk;
                $rules[$ruleKey . '.from_qty'] = 'required|numeric|min:1';
                $rules[$ruleKey . '.to_qty'] = 'required|numeric|min:1|max:99999';
                $rules[$ruleKey . '.type'] = 'required|numeric';
                $rules[$ruleKey . '.value'] = 'required|numeric';
            }   
        }
                
        return $rules;
    }

    public function messages()
    {

        $messages = [

                'required' => 'This field is required',
                'in' => 'Please select from given values',
                'numeric' => 'Field must be numeric',
                'min' => 'Minimum :min is allowed',
                'max' => 'Maximum :max is allowed',

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
