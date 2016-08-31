<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class SaleRequest extends Request
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
            'type' => 'required',
            'listingTitle' => 'required|max:10',
            'detailTitle' => 'required|max:200',            
        ];

        if(empty($input['saleProductId']) && empty($input['saleCategoryId'])){
            $rules['saleItem'] = 'required';
        }

        //SALE TYPE TAG
        if($input['type'] == 1){
            
            $rules['actionProductId'] = 'required|array|min:1';
            $rules['conditionQuantity'] = 'required|numeric';

            if($input['actionType'] == 1){
                $rules['giftQuantity'] = 'required|numeric';                
            }

            if($input['actionType'] == 2){
                $rules['discountValue'] = 'required|numeric';                
            }            
        }

        return $rules;        
    }

    public function messages()
    {

        $messages = [
            'required' => 'This field is required',
            'saleItem.required' => 'Please add product or category for sale',
            'actionProductId.required' => 'Please add product',            
        ];

        return $messages;
    }
}
