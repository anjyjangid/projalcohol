<?php

namespace AlcoholDelivery;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Business extends Eloquent
{
    
    protected $collection = 'businesses';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['company_name','company_email','status', 'billing_address','delivery_address','address','products'];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    
    public function getBusiness($params = array()){

        $business = $this->where('_id','=', $params['key']);

        if(isset($params['multiple']) && $params['multiple']){
            $business = $business->get();
        }else{
            $business = $business->first();
        }
        
        return $business;

    }
    
}
