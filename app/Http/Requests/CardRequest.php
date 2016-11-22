<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;
class CardRequest extends Request
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


        $currentYear = date('Y');
        $currentMonth = date('m');

        $validMonth = 'required|numeric|between:1,12';
        $validYear = 'required|numeric|between:'.$currentYear.','.($currentYear+10);
        if(isset($input['year']) && $currentYear==$input['year']){
            $validMonth = 'required|numeric|between:'.$currentMonth.',12';
        }

        return [
            'number' => 'required',
            //'cvc' => 'required|numeric',            
            'name' => 'required|max:45|min:3',
            'month' => $validMonth,//'required|numeric|between:1,12',
            'year' => $validYear//'required|numeric',            
        ];
    }

    public function messages()
    {

        $messages = [
            'required' => 'This field is required',
            'month.between' => 'Card is Expired',
            'year.between' => 'Card is Expired ',
        ];

        return $messages;
    }
}
