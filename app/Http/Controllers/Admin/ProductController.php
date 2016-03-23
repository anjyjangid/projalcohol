<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Products;
use MongoId;
use Input;
use DB;


class ProductController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {    
        $inputs = $request->all();        
        //prd($inputs);
               
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'description' => 'required',
            'shortDescription' => 'required',
            'categories' => 'required',
            'sku' => 'required',
            'price' => 'required|numeric',
            'discountPrice' => 'required|numeric',
            'chilled' => 'required|integer',
            'status' => 'required|integer',
            'metaTitle' => 'max:100',
            'metaKeywords' => 'max:1000',
            'metaDescription' => 'max:255',
            'isFeatured' => 'required|integer',
        ],[
            'required' => 'Please enter :attribute.',
            'categories.required' => 'Please select atleast one category.',
            'status.required' => 'Please select :attribute.',
        ]);

        //VALIDATE ALL UPLOADED FILES       

        $ferror = false;                        

        if(isset($inputs['images']) && !empty($inputs['images'])){

          $files = $inputs['images'];

          foreach ($files as $key => $file) {
              $rules = [
                'image' => 'required|mimes:png,jpeg,jpg'
              ];
              $validfile = Validator::make(['image'=> @$file['thumb']], $rules, ['image.required'=>'Please select :attribute for the product']);
              if($validfile->passes()){

              }else{
                  $ferror = $validfile->errors()->first('image');
                  break;
              }
          }        

        }else{
            $ferror = 'Please select atleast one image for the product.';          
        }

        // if validation fails
        if ($validator->fails() || $ferror){
            
            if($ferror)
                $validator->errors()->add('image',$ferror);

            return response($validator->errors(), 422);
        }     

       	$product = Products::create([
            'name' => $inputs['name'],
            'description' => $inputs['description'],
            'shortDescription' => $inputs['shortDescription'],
            'categories' => $inputs['categories'],
            'sku' => $inputs['sku'],
            'price' => (float)$inputs['price'],
            'discountPrice' => (float)$inputs['discountPrice'],
            'chilled' => (int)$inputs['chilled'],
            'status' => (int)$inputs['status'],
            'metaTitle' => @$inputs['metaTitle'],
            'metaKeywords' => @$inputs['metaKeywords'],
            'metaDescription' => @$inputs['metaDescription'],
            'isFeatured' => (int)$inputs['isFeatured'],
        ]);    

        $this->saveImages($product,$files);

        return $product;
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $galleryObj = new Products;
        return $galleryObj->getSingleProduct($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $inputs = $request->all();
        
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'description' => 'required',
            'shortDescription' => 'required',
            'categories' => 'required',
            'sku' => 'required',
            'price' => 'required|numeric',
            'discountPrice' => 'required|numeric',
            'chilled' => 'required|integer',
            'status' => 'required|integer',
            'metaTitle' => 'max:100',
            'metaKeywords' => 'max:1000',
            'metaDescription' => 'max:255',            
            'isFeatured' => 'required|integer',
        ],[
            'required' => 'Please enter :attribute.',
            'categories.required' => 'Please select atleast one category.',
            'status.required' => 'Please select :attribute.',
        ]);              

        //VALIDATE ALL UPLOADED FILES       

        $ferror = false;                        

        if(isset($inputs['images']) && !empty($inputs['images'])){

          $files = $inputs['images'];

          foreach ($files as $key => $file) {              
              if(isset($file['source']) && empty($file['thumb'])){continue;}              
              $in = $key+1;
              $rules = [
                'image' => 'required|mimes:png,jpeg,jpg'
              ];
              $validfile = Validator::make(['image'=> @$file['thumb']], $rules, ['image.required'=>'One of the image file is missing.']);
              if(!$validfile->passes()){              
                  $ferror = $validfile->errors()->first('image');
                  break;
              }
          }
        }else{
            $ferror = 'Please select atleast one image for the product.';          
        }
        
        // if validation fails
        if ($validator->fails() || $ferror){            
            if($ferror)
                $validator->errors()->add('image',$ferror);

            return response($validator->errors(), 422);
        }

        $product = Products::find($id);

        $update = $product->update([
            'name' => $inputs['name'],
            'description' => $inputs['description'],
            'shortDescription' => $inputs['shortDescription'],
            'categories' => $inputs['categories'],
            'sku' => $inputs['sku'],
            'price' => (float)$inputs['price'],
            'discountPrice' => (float)$inputs['discountPrice'],
            'chilled' => (int)$inputs['chilled'],
            'status' => (int)$inputs['status'],
            'metaTitle' => @$inputs['metaTitle'],
            'metaKeywords' => @$inputs['metaKeywords'],
            'metaDescription' => @$inputs['metaDescription'],
            'isFeatured' => (int)$inputs['isFeatured'],            
        ]);

        $this->saveImages($product,$files);

        return response($product);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }


    public function productlist(Request $request){   

        //$pro = new Products;

        $params = $request->all();

        $columns = array('_id','','name','categories','price','status','isFeatured');

        $products = new Products;

        if(isset($params['name']) && trim($params['name'])!=''){
          $pname = $params['name'];
          $products = $products->where('name','regexp', "/.*$pname/i");
        }

        if(isset($params['categories']) && trim($params['categories'])!=''){          
          $products = $products->where('categories',$params['categories']);
        }

        if(isset($params['status']) && trim($params['status'])!=''){
          $products = $products->where('status',(int)$params['status']);
        }

        if(isset($params['isFeatured']) && trim($params['isFeatured'])!=''){
          $products = $products->where('isFeatured',(int)$params['isFeatured']);
        }

        $iTotalRecords = $products->count();
        $iDisplayLength = intval($_REQUEST['length']);
        $iDisplayLength = $iDisplayLength < 0 ? $iTotalRecords : $iDisplayLength; 
        $iDisplayStart = intval($_REQUEST['start']);
        $sEcho = intval($_REQUEST['draw']);

        $records = array();
        $records["data"] = array(); 

        $end = $iDisplayStart + $iDisplayLength;
        $end = $end > $iTotalRecords ? $iTotalRecords : $end;

        $status_list = array(            
            array("info" => "Not Published"),            
            array("success" => "Published"),
        );

        $fstatus = [['success'=>'No'],['info'=>'Yes']];

        $notordered = true;

        if ( isset( $params['order'] ) ){

            foreach($params['order'] as $orderKey=>$orderField){

                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    $ordered = false;                    
                    $products = $products->orderBy($columns[$orderField['column']],$orderField['dir']);
                    
                }
            }

        }  

        if($notordered){
          $products = $products->orderBy('created_at','desc');
        }

        $products = $products->skip($iDisplayStart)        
        ->take($iDisplayLength)->get();

        foreach($products as $i => $product) {
            $status = $status_list[$product->status];
            $isFeatured  = $fstatus[$product->isFeatured];            
            $id = ($i + 1);
            
            $categories = Categories::whereIn('_id', $product->categories)->get();

            $cname = [];
            foreach ($categories as $key => $value) {                
              $cname[] = $value->cat_title;                
            }

            $records["data"][] = array(
              '<input type="checkbox" name="id[]" value="'.$product->_id.'">',
              $id,
              $product->name,
              implode(', ', $cname),
              $product->price,      
              '<span class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span>',
              '<span class="label label-sm label-'.(key($isFeatured)).'">'.(current($isFeatured)).'</span>',
              
              '<a href="#/product/edit/'.$product->_id.'" class="btn btn-xs default btn-editable"><i class="fa fa-pencil"></i> Edit</a>'
              
            );
        }

        if (isset($_REQUEST["customActionType"]) && $_REQUEST["customActionType"] == "group_action") {
            $records["customActionStatus"] = "OK"; // pass custom message(useful for getting status of group actions)
            $records["customActionMessage"] = "Group action successfully has been completed. Well done!"; // pass custom message(useful for getting status of group actions)
        }
        $records["draw"] = $sEcho;
        $records["recordsTotal"] = $iTotalRecords;
        $records["recordsFiltered"] = $iTotalRecords; 

        return response($records);
    }

    protected function saveImages($product,$files){

      if($product){
            $filearr = [];
            foreach ($files as $key => $file) {
                $image = @$file['thumb']; 

                if($image){

                    $destinationPath = storage_path('products');
                    $filename = $product->_id.'_'.$key.'.'.$image->getClientOriginalExtension();
                    
                    if (!File::exists($destinationPath.'/200')){
                        File::MakeDirectory($destinationPath.'/200',0777, true);
                    }
                    if (!File::exists($destinationPath.'/400')){
                        File::MakeDirectory($destinationPath.'/400/',0777, true);
                    }

                    Image::make($image)->resize(400, null, function ($constraint) {
                        $constraint->aspectRatio();
                    })->save($destinationPath.'/400/'.$filename);

                    Image::make($image)->resize(200, null, function ($constraint) {
                        $constraint->aspectRatio();
                    })->save($destinationPath.'/200/'.$filename);

                    $upload_success = $image->move($destinationPath, $filename);  

                }else{
                  $filename = @$file['source'];
                }

                $cover = (int)$file['coverimage'];

                $filearr[] = [
                    'source' => $filename,
                    'label' => @$file['label'],
                    'order' => @$file['order'],
                    'coverimage' => $cover,
                ];
            }

            if(!empty($filearr)){
                $product->imageFiles = $filearr;
                $product->save();
            }
        }

    }
     
}
    