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
            'name' => 'required',
            'description' => 'required',
            'shortDescription' => 'required',
            'categories' => 'required',
            'sku' => 'required',
            'quantity' => 'required|numeric',
            'price' => 'required|numeric',
            'chilled' => 'required|integer',
            'status' => 'required|integer',
            'metaTitle' => 'max:100',
            'metaKeywords' => 'max:1000',
            'metaDescription' => 'max:255',            
            'isFeatured' => 'required|integer',
            'imageFiles' => 'required|array|min:1',            
        ];
        
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

        if (isset($input['bulkDiscount']) && is_array($input['bulkDiscount']))
        {
            foreach ($input['bulkDiscount'] as $dKey => $discount)
            {
                $ruleKey = 'bulkDiscount.' . $dKey;
                $rules[$ruleKey . '.quantity'] = 'required|integer';
                $rules[$ruleKey . '.type'] = 'required|digits_between:1,2';
                $rules[$ruleKey . '.value'] = 'required|numeric';
            }
        }   

        return $rules;
    }

    public function messages()
    {

        $messages = [
            'required' => ':attribute is required',
            'categories.required' => 'Please select atleast one category.',
            'status.required' => 'Please select :attribute.',
            'imageFiles.required' => 'Please add atleast one image.'            
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

        $discounts = Request::input('bulkDiscount');

        if(isset($discounts) && is_array($discounts)){

            foreach ($this->request->get('bulkDiscount') as $key => $contact) {                
                $messages['bulkDiscount.'.$key.'.quantity.required'] = 'Please enter quantity.';
                $messages['bulkDiscount.'.$key.'.quantity.integer'] = 'Quantity must be numeric.';            
                $messages['bulkDiscount.'.$key.'.type.required'] = 'Please select type of discount.';
                $messages['bulkDiscount.'.$key.'.value.required'] = 'Please enter value for the discount type choosen.';
                $messages['bulkDiscount.'.$key.'.value.numeric'] = 'Value must be numeric only.';                
            }    
        
        }

        return $messages;

    }

    

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
