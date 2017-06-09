<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class QueryRequest extends Request
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

        if($this->type == 'bulkcorporate-discounts'){                
            $rules = [
                'name' => 'required|max:50',
                'companyName' => 'max:100',                
                'businessNature' => 'max:100',
                'phoneNumber' => 'numeric|digits_between:8,10',
                //'contactName' => 'required|max:50',
                'email' => 'required|email',
            ];
        }

        if($this->type == 'suggest-a-product') {            
            $rules = [
                'productname' => 'required|max:100',
                'brandname' => 'required|max:100',
                'category' => 'required',                
                'email' => 'required|email'                
            ];
        }

        if($this->type == 'event-planner') {            
            $rules = [
                'name' => 'required|max:50',
                'companyName' => 'max:100',
                'email' => 'required|email',
                'phoneNumber' => 'numeric|digits_between:8,10',
                'dateOfEvent' => 'date_format:d/m/Y|after:now',
                'locationOfEvent' => 'max:100',
                'noOfPax' => 'numeric'
            ];
        }

        if($this->type == 'contact-us') {            
            $rules = [
                'subject' => 'required|max:50',
                'name' => 'required|max:50',
                'email' => 'required|email',
                'feedback' => 'required'
            ];
        }

        $rules['additionalComment'] = 'max:200';

        return $rules;
    }

    public function messages() {

        $messages = [

                'phoneNumber.digits_between' => 'Number must be between 8 to 10 digits'
        ];   

        return $messages;
    }

}
