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
            'status' => 'required|integer'            
        ];
        
        //VALIDATION FOR PARTY TYPE
        if ($input['type'] == 1){
            $rules['packageItems'] = 'required|array|min:1';
        }

        //VALIDATION FOR COCKTAIL TYPE
        
        if ($input['type'] == 2){
            $rules['recipe'] = 'required|array|min:1';
            foreach ($input['recipe'] as $recipeKey => $step)
            {
                $ruleKey = 'recipe.' . $imageKey;
                $rules[$ruleKey . '.step'] = 'required';
                $rules[$ruleKey . '.description'] = 'required';                
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
            'recipe.required' => 'Please add atleast one recipe step.'
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
