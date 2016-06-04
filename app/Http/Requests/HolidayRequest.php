<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class HolidayRequest extends Request
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
            'title' => 'required|string|max:50',            
            'timeStamp' => 'required_unless:_id,weekdayoff|numeric',
            'start' => 'required_unless:_id,weekdayoff',
            'd' => 'required_unless:_id,weekdayoff',
            'm' => 'required_unless:_id,weekdayoff',
            'y' => 'required_unless:_id,weekdayoff',
            'allDay' => 'required|in:0,1'            
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
