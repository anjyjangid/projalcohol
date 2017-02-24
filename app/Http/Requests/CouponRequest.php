<?php

namespace AlcoholDelivery\Http\Requests;

use MongoId;
use AlcoholDelivery\Http\Requests\Request;

class CouponRequest extends Request
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

        $inputs = $this->all();

        $rules = [

            'code' => 'required|string|max:150|unique:coupons',
            'name' => 'required|string|max:150',
            'type' => 'required|integer|in:0,1',
            'discount' => 'required|numeric|min:0|max:100000',
            'total' => 'integer|min:0|max:100000',
            'coupon_uses' => 'integer|min:0|max:100000',
            'customer_uses' => 'integer|min:0|max:100000',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|integer|in:0,1',
            'discount_status' => 'integer|in:0,1',

        ];

        if(isset($inputs['type']) && $inputs['type']==0){
            $rules['discount'] = 'required|numeric|max:99';
        }

        switch ($this->method()) {
            case 'PUT':
            case 'PATCH':
            {
                $rules['code'] = 'required|string|max:150|unique:coupons,'.$this->coupon.',_id';
            }
        }

        // pr('rules');

        return $rules;
    }

    public function messages()
    {

        $inputs = $this->all();

        $messages = [];

        if(!(isset($inputs['csvImport']) && $inputs['csvImport']))
            $messages['required'] = "This field is required";


        if(isset($inputs['type']) && $inputs['type']==0){
            $messages['discount.max'] = 'The discount not be greater than 99% when its applied as percentage';
        }

        return $messages;

    }


    public function forbiddenResponse()
    {
        return Response::make('message',403);
    }

    public function formatCols($col=[]){
        // $validator = parent::validate();

        // if($validator==null){
        $input = $this->all();

        $updateValues = [];

        if(isset($input['type']))
            $updateValues['type'] = (int)$input['type'];
        if(isset($input['discount']))
            $updateValues['discount'] = (float)$input['discount'];
        if(isset($input['total']))
            $updateValues['total'] = (int)$input['total'];
        if(isset($input['coupon_uses']))
            $updateValues['coupon_uses'] = (int)$input['coupon_uses'];
        if(isset($input['customer_uses']))
            $updateValues['customer_uses'] = (int)$input['customer_uses'];
        if(isset($input['status']))
            $updateValues['status'] = (int)$input['status'];

        if(!empty($input['products']) && count($input['products'])>0){
            foreach ($input['products'] as &$productId)
                $productId = new MongoId($productId);

            $updateValues['products'] = $input['products'];
        }

        if(!empty($input['categories']) && count($input['categories'])>0){
            foreach ($input['categories'] as &$categoryId)
                $categoryId = new MongoId($categoryId);

            $updateValues['categories'] = $input['categories'];
        }

        $this->merge($updateValues);

        if(count($col)>0)
            return $this->only($col);
        else
            return $this->all();
    }
}
