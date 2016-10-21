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

        if($this->type == 'contact-us') {            
            $rules = [
                'subject' => 'required|max:50',
                'name' => 'required|max:50',
                'email' => 'required|email',
                'feedback' => 'required'
            ];
        }else{
            $rules = [
                'companyName' => 'max:100',                
                'contactName' => 'required|max:50',
                'phoneNumber' => 'required|numeric',
                'emailAddress' => 'required|email',
            ];

            if($this->type == 'sell-on-alcoholdelivery'){
                $rules['companyName'] = 'required|max:100';
                $rules['websiteUrl'] = 'required|url';
                $rules['noOfProducts'] = 'required|numeric';
                $rules['brandsToSell'] = 'required';
            }else{
                if($this->type == 'event-planner'){
                    $rules['dateOfEvent'] = 'required|date_format:d/m/Y|after:now';
                    $rules['typeOfEvent'] = 'required|max:100';
                    $rules['noOfPax'] = 'required|numeric';
                }
                if($this->type == 'book-a-bartender'){
                    $rules['dateOfEvent'] = 'required|date_format:d/m/Y|after:now';
                    $rules['noOfBartender'] = 'required|numeric';
                    $rules['hoursRequired'] = 'required|numeric';
                }
                if($this->type == 'become-a-partner'){
                   $rules['companyName'] = 'required|max:100'; 
                   $rules['companyType'] = 'required|max:100'; 
                }
            }

        }             

        return $rules;
    }
}
