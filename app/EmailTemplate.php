<?php

namespace AlcoholDelivery;

use Moloquent;

class EmailTemplate extends Moloquent
{
    protected $primaryKey = "_id";
    protected $collection = 'emailtemplates';

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
    protected $fillable = ['title','subject','content'];
    
    public function getTemplates($params = array()){

        $template = $this->where('_id','=', $params['key']);

        if(isset($params['multiple']) && $params['multiple']){
            $template = $template->get();
        }else{
            $template = $template->first();
        }
        
        
        return $template;

    }


}
