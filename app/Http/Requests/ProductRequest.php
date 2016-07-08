<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class ProductRequest extends Request
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
        //return [];
        $input = Input::all();

        $rules = [            
            'name' => 'required|unique:products',
            'slug' => 'required|unique:products',
            'description' => 'required',
            'shortDescription' => 'required',
            'categories' => 'required',
            'sku' => 'required|unique:products',
            'quantity' => 'required|numeric',
            'price' => 'required|numeric',
            'chilled' => 'required|integer',
            'status' => 'required|integer',
            'metaTitle' => 'max:100',
            'metaKeywords' => 'max:1000',
            'metaDescription' => 'max:255',            
            'isFeatured' => 'required|integer',
            'imageFiles' => 'required|array|min:1',            
            'isLoyalty' => 'required|integer|in:0,1',
            'loyalty' => 'required_if:isLoyalty,1|numeric',
            'loyaltyType' => 'required_if:isLoyalty,1|integer|in:0,1',
            

            'threshold' => 'required|numeric|lt:maxQuantity',
            'maxQuantity' => 'required|numeric|gte:quantity',
            'dealers' => 'required|array|min:1',
            'outOfStockType' => 'required|integer',
            'deliveryType' => 'required|integer|in:0,1,2',

            'availabilityDays' => 'required_if:outOfStockType,2',
            'availabilityTime' => 'required_if:outOfStockType,2',
        ];

        if(isset($input['_id'])){

            $rules['name'] = 'required|unique:products,name,'.$input['_id'].',_id';
            $rules['slug'] = 'required|unique:products,slug,'.$input['_id'].',_id';
            $rules['sku'] = 'required|unique:products,sku,'.$input['_id'].',_id';

        }
        
        if (isset($input['imageFiles']) && is_array($input['imageFiles']))
        {
            foreach ($input['imageFiles'] as $imageKey => $image)
            {
                if(isset($image['source']) && empty($image['thumb'])){continue;}
                $ruleKey = 'imageFiles.' . $imageKey;
                $rules[$ruleKey . '.thumb'] = 'required|image|max:5102';
                $rules[$ruleKey . '.label'] = 'required|max:100';
                $rules[$ruleKey . '.order'] = 'required|integer';
            }
        }        

        if (isset($input['advance_order']) && is_array($input['advance_order'])){
            $rules['advance_order.value'] = 'required|numeric';
            $rules['advance_order.type'] = 'required|numeric';                
        }

        if (isset($input['regular_express_delivery']) && is_array($input['regular_express_delivery'])){
            $rules['regular_express_delivery.value'] = 'required|numeric';
            $rules['regular_express_delivery.type'] = 'required|numeric';                            
        }

        if (isset($input['advance_order_bulk']['bulk']) && is_array($input['advance_order_bulk']['bulk']))
        {
            foreach ($input['advance_order_bulk']['bulk'] as $bk => $bval)
            {
                $ruleKey = 'advance_order_bulk.bulk.' . $bk;
                $rules[$ruleKey . '.from_qty'] = 'required|numeric|min:1';
                $rules[$ruleKey . '.to_qty'] = 'required|numeric|min:1|max:99999';
                $rules[$ruleKey . '.type'] = 'required|numeric';
                $rules[$ruleKey . '.value'] = 'required|numeric';
            }
        }

        if (isset($input['express_delivery_bulk']['bulk']) && is_array($input['express_delivery_bulk']['bulk']))
        {
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
            'required_if' => 'This field is required',
            //'categories.required' => 'Please select a category.',
            //'status.required' => 'Please select :attribute.',
            'imageFiles.required' => 'Please add atleast one image.',
            'maxQuantity.gte' => 'The value should be greater than or equals to the quantity.',
            'threshold.lt' => 'The value should be less than maximum quantity.',
            'dealers.required' => 'Please select atleast one dealer.'            
        ]; 

        $images = Request::input('imageFiles');
        
        if(isset($images) && is_array($images)){

            foreach ($this->request->get('imageFiles') as $key => $contact) {                
                $messages['imageFiles.'.$key.'.thumb.required'] = 'Please select image file.';
                $messages['imageFiles.'.$key.'.thumb.image'] = 'Please select image file.';
                $messages['imageFiles.'.$key.'.thumb.max'] = 'The image file should not be greater than 5MB.';            
                $messages['imageFiles.'.$key.'.label.required'] = 'Please enter label for the image.';
                $messages['imageFiles.'.$key.'.label.max'] = 'Label should not be greater than 5 characters.';
                $messages['imageFiles.'.$key.'.order.required'] = 'Please enter order for the image.';
                $messages['imageFiles.'.$key.'.order.integer'] = 'Order for the image must be numeric.';
            }    
        
        }       

        return $messages;

    }

    

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
