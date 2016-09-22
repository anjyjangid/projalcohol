<?php

namespace AlcoholDelivery\Http\Requests;

use AlcoholDelivery\Http\Requests\Request;
use Input;
use AlcoholDelivery\Sale;
use MongoId;

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

        if(!isset($input['coverImage']) || !empty($input['image']['thumb'])){
            $rules['image.thumb'] = 'image|max:5102';
        }

        //SALE TYPE TAG
        if($input['type'] == 1){
            
            // 
            $rules['conditionQuantity'] = 'required|numeric';

            if($input['actionType'] == 1){
                $rules['giftQuantity'] = 'required|numeric';                
                $rules['actionProductId'] = 'required|array|min:1';
            }

            if($input['actionType'] == 2){
                $rules['discountValue'] = 'required|numeric';                
            }     


            //CHECK FOR ITEMS & CATEGORIES IN SALE OR NOT            
            
            $saleId = (isset($input['_id']['$id']))?(new MongoId($input['_id']['$id'])):null;

            if(!empty($input['saleProductId'])){
                foreach ($input['saleProductId'] as $key => $pids) {
                    $query = [];
                    if($saleId!=null){
                        $query['_id'] = ['$not'=>['$eq'=>$saleId]];
                    }                
                    $query['type'] = 1;
                    $query['saleProductId'] = ['$eq'=>$pids];
                    $hasSale =  Sale::raw()->findOne($query);
                    if($hasSale){                        
                        $rules['productExists.'.$key] = 'required';                        
                    }
                }
            }

            if(!empty($input['saleCategoryId'])){
                foreach ($input['saleCategoryId'] as $key => $cids) {
                    $query = [];
                    if($saleId!=null){
                        $query['_id'] = ['$not'=>['$eq'=>$saleId]];
                    }                
                    $query['type'] = 1;
                    $query['saleCategoryId'] = ['$eq'=>$cids];
                    $hasSale =  Sale::raw()->findOne($query);
                    if($hasSale){                        
                        $rules['categoryExists.'.$key] = 'required';                        
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
            'saleItem.required' => 'Please add product or category for sale',
            'actionProductId.required' => 'Please add product',                        
        ];        

        $input = Input::all();

        if(!empty($input['saleProductId'])){
            foreach ($input['saleProductId'] as $key => $pids) {
                $messages['productExists.'.$key.'.required'] = 'Product is already added in a sale.';
            }
        }

        if(!empty($input['saleCategoryId'])){
            foreach ($input['saleCategoryId'] as $key => $pids) {
                $messages['categoryExists.'.$key.'.required'] = 'Category is already added in a sale.';
            }
        }

        return $messages;
    }
}
