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
            //'products' => 'required|array|min:1',                                    
            'status' => 'required|integer',
            'packageItems' => 'required|array|min:1',
            'metaTitle' => 'max:100',
            'metaKeywords' => 'max:150',
            'metaDescription' => 'max:150',            
        ];
        
        //VALIDATION FOR COCKTAIL TYPE
        
        if(!isset($input['coverImage']) || !empty($input['image']['thumb'])){
            $rules['image.thumb'] = 'required|image|max:5102';
        }

        if ($input['type'] == 2){
            $rules['recipe'] = 'required|array|min:1';
            if(isset($input['recipe']) && !empty($input['recipe'])){
                foreach ($input['recipe'] as $recipeKey => $step)
                {
                    $ruleKey = 'recipe.' . $recipeKey;
                    $rules[$ruleKey . '.step'] = 'required';
                    $rules[$ruleKey . '.description'] = 'required';                
                }
            }
        }  

        if(isset($input['packageItems']) && !empty($input['packageItems'])){
            foreach ($input['packageItems'] as $pKey => $pVal){
                
                $ruleKey = 'packageItems.' . $pKey;
                $rules[$ruleKey . '.products'] = 'required|array|min:1';

                if($input['type'] == 1){
                    $rules[$ruleKey . '.title'] = 'required';
                    $rules[$ruleKey . '.quantity'] = 'required';
                }

                if(isset($pVal['products']) && !empty($pVal['products'])){
                    foreach ($pVal['products'] as $prokey => $provalue) {
                        $proruleKey = 'packageItems.' . $pKey . '.products.' .$prokey;                        
                        $rules[$proruleKey . '.cprice'] = 'required';
                    }
                }                
            }
        }

        return $rules;
    }

    public function messages()
    {

        $messages = [
            'required' => 'This field is required',            
            'coverImage.thumb.required' => 'Cover image is required.',            
            'recipe.required' => 'Please add atleast one recipe step.',            
        ];         

        $type = Request::input('type');
        if($type == 1){
            $messages['packageItems.required'] = 'Please add items for the package.';
        }else{
            $messages['packageItems.required'] = 'Please add ingredients for the package.';
        }

        $packageItems = $this->request->get('packageItems');

        if(isset($packageItems) && !empty($packageItems)){
            foreach ($packageItems as $pKey => $pVal)
            {
                $messages['packageItems.' .$pKey. '.products.required'] = 'Please add products.';                
            }
        }

        return $messages;

    }

    

    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

}
