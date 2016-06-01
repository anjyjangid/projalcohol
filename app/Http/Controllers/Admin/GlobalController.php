<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

use MongoId;
use File;
use DB;


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
            "dealer" =>array(
                'table'         => "dealers",
                'field_id'      => "_id",
                'field_status'  => 'status',
                'alias'         => 'Dealer'
            ),
            "pages" =>array(
                'table'         => "pages",
                'field_id'      => "_id",
                'field_status'  => 'status',
                'alias'         => 'Cms Page'
            ),
            "testimonial" =>array(
                'table'         => "testimonial",
                'field_id'      => "_id",
                'field_status'  => 'status',
                'alias'         => 'Testimonial'
            ),
            "brands" =>array(
                'table'         => "brands",
                'field_id'      => "_id",
                'field_status'  => 'status',
                'alias'         => 'Brand'
            ),
            "user" =>array(
                'table'         => "user",
                'field_id'      => "_id",
                'field_status'  => 'status',
                'alias'         => 'User'
            ),
            "promotions" =>array(
                'table'         => "promotions",
                'field_id'      => "_id",
                'field_status'  => 'status',
                'alias'         => 'Promotion'
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

    public function getCountries(){

        $countries = DB::collection("countries")->get();

        return response($countries);

    }

    /* Editor Browse Images */
    public function browsegraphics(){
        
        $images = DB::collection("sitegraphics")->get();
                    
        return view('admin.graphicmedia')->with("images",$images);
        
    }

    /* Editor Upload Image */
    public function uploadgraphics(Request $request){

        $inputs = $request->all(); 

        $funcNum = $inputs['CKEditorFuncNum'] ;
        // Optional: instance name (might be used to load a specific configuration file or anything else).
        $CKEditor = $inputs['CKEditor'] ;
        // Optional: might be used to provide localized messages.
        $langCode = $inputs['langCode'] ;

            
        if(isset($inputs['upload']) && !empty($inputs['upload'])){
            
            $validator = Validator::make($inputs, [
                'upload' => 'mimes:jpeg,jpg,png|max:8000',
            ]);

            if ($validator->fails()) {
                return response("<script type='text/javascript'>window.parent.CKEDITOR.tools.callFunction($funcNum, '$url', 'There are errors in the form data');</script>", 400);
            }

            $image = $request->file('upload');

            $destinationPath = public_path('assets/resources/graphics');

            if (!File::exists($destinationPath)){
                File::MakeDirectory($destinationPath,0777, true);
            }
            
            $detail = pathinfo($image->getClientOriginalName());
            $newName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();    

            $url = url('assets/resources/graphics/'.$newName);

            $upload_success = $image->move($destinationPath, $newName);
    
            
            return response("<script type='text/javascript'>window.parent.CKEDITOR.tools.callFunction($funcNum, '$url', 'Image uploaded successfully');</script>", 400);

        }else{
            return response("<script type='text/javascript'>window.parent.CKEDITOR.tools.callFunction($funcNum, '', 'Please select atleast one image for the product.');</script>", 400);

        }
        
        
         
    }

    
}
