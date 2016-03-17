<?php

namespace AlcoholDelivery;

use Moloquent;

class Categories extends Moloquent
{
    
    protected $primaryKey = "_id";
    protected $collection = 'categories';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;

     /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['cat_title', 'cat_thumb', 'cat_lthumb','ancestors','cat_status'];

    
    public function getCategory($params = array()){

        $category = $this->where('_id','=', $params['key']);

        if(isset($params['multiple']) && $params['multiple']){
            $category = $category->get();
        }else{
            $category = $category->first();
        }
        
        
        return $category;

    }

}
