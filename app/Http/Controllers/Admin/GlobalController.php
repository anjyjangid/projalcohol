<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use DB;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

class GlobalController extends Controller
{

    public function setstatus($id,$table,$status) {
         
         $data = array(         

            "category" =>array(
                'table'         => "categories",
                'field_id'      => "_id",
                'field_status'  => 'cat_status',
                'alias'         => 'Category'
            ),
                                    
        );


        if(isset($data[$table])){
        
             
            try{

                $fetchRow = DB::collection($data[$table]['table'])->where("_id","=", $id)
                            ->update(array($data[$table]['field_status'] => (int)$status), ['upsert' => true]);
                                
                return response(array("success"=>true,"status"=>(int)$status?0:1,"message"=> " Status of ".ucwords($data[$table]['alias'])." Successfully Updated "  ));

            }catch(\Illuminate\Database\QueryException $e){
                
                return response(array("success"=>false,"exception"=>true,"exception_code"=>$e->getCode(),"message"=>$e->getMessage()));

            }

        }else{

            return response(array("success"=>false,"exception"=>false,"message"=>"Table Not Defined for the Current Request" ));
        }
        
        exit();
    }

    
}
