<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;

class PackageRequest extends Request
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
            'type' => 'required',
            'title' => 'required',
            'subTitle' => 'required',
            'description' => 'required',
            'image' => 'required',
            'image.thumb' => 'image|max:5102',
            'products' => 'required|array|min:1',            
            'recipe' => 'sometimes|required|array',
            'packageItems' => 'sometimes|required',
            'status' => 'required|integer'            
        ];
        
        
        //VALIDATION FOR COCKTAIL TYPE
        if($input['type'] == 2){                

            $rules['video.link'] = 'sometimes|required|url';            
            $rules['recipe'] = 'required';            

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
            //'categories.required' => 'Please select a category.',
            //'status.required' => 'Please select :attribute.',
            'image.required' => 'Cover image is required.',
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
