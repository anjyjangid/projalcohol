<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;

class PromotionRequest extends Request
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

            'title' => 'required|string|max:255',            
            'price' => 'required|numeric|max:1000000|min:1|unique:promotions',
            'status'=> 'required|integer|in:0,1',
            'products'=> 'required|array'

        ];

        switch ($this->method()) {
            case 'PUT':
            case 'PATCH':
            {                
                $rules['price'] = 'required|numeric|max:1000000|unique:promotions,'.$this->promotion.',_id';
            }
        }
        
       // $products = Request::input('products');
        
        foreach ($this->request->get('products') as $key => $product) {

            $rules['products.'.$key.'._id'] = 'required|string|max:255';
            $rules['products.'.$key.'.type'] = 'required|in:0,1';

            if($product['type']==1){
                $rules['products.'.$key.'.dprice'] = 'required|numeric|digits_between:1,7'; //dprice stands for discounted price
            }

        }

        return $rules;
    }

    public function messages()
    {

        $messages = [
                'required' => 'This field is required',
                'products.required'=> 'There should be single product added to promotion',
                'products.array'=> 'There should be single product added to promotion'
        ];

        foreach ($this->request->get('products') as $key => $product) {
                
            $messages['products.'.$key.'.dprice.integer'] = 'Enter valid price';
            $messages['products.'.$key.'.type'] = 'Discount type required';
            $messages['products.'.$key.'.dprice.digits_between'] = 'Enter valid price';

        }

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
