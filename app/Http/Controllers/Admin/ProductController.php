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
        ],[
            'required' => 'Please enter :attribute.',
            'categories.required' => 'Please select atleast one category.',
            'status.required' => 'Please select :attribute.',
        ]);

        //VALIDATE ALL UPLOADED FILES
        $files = $inputs['images'];      

        $ferror = false;                
        
        foreach ($files as $key => $file) {           
            $rules = ['image' => 'required|mimes:png,jpeg,jpg'];
            $validfile = Validator::make(['image'=> @$file['thumb']], $rules, ['image.required'=>'Please select atleast one :attribute for the product']);
            if($validfile->passes()){

            }else{
                $ferror = $validfile->errors()->first('image');
                break;
            }
        }        

        // if validation fails
        if ($validator->fails() || $ferror){
            
            if($ferror)
                $validator->errors()->add('image',$ferror);

            return response($validator->errors(), 422);
        }
        
        /*$cat = [];
        //SET CATEGORIES FOR PRODUCT
        foreach ($inputs['categories'] as $key => $value) {
            $cat [] = ["_id" => new MongoId($value)];
        }*/      

       	$product = Products::create([
            'p_name' => $inputs['name'],
            'p_description' => $inputs['description'],
            'p_shortDescription' => $inputs['shortDescription'],
            'p_categories' => $inputs['categories'],
            'p_sku' => $inputs['sku'],
            'p_price' => (float)$inputs['price'],
            'p_discountPrice' => (float)$inputs['discountPrice'],
            'p_chilled' => (int)$inputs['chilled'],
            'p_status' => (int)$inputs['status'],
            'p_metaTitle' => @$inputs['metaTitle'],
            'p_metaKeywords' => @$inputs['metaKeywords'],
            'p_metaDescription' => @$inputs['metaDescription']            
        ]);    

        if($product){
            $filearr = [];
            foreach ($files as $key => $file) {
                $image = $file['thumb']; 
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

                $filearr[] = [
                    'source' => $filename,
                    'label' => @$file['label'],
                    'order' => @$file['order'],
                    'is_cover' => @$file['cover'],
                ];
            }

            if($filearr){
                $product->p_images = $filearr;
                $product->save();
            }
        }

        //$product->p_price = 25;
        //$product->save();
        return $product;
    }

    public function uploadThumb(Request $request)
    {
    	
    	$files = array();
    	// check if the file exist
        if (!$request->hasFile('thumb')) {
            return response('No file sent.', 400);
        }

        // check if the file is valid file
        if (!$request->file('thumb')->isValid()) {
            return response('File is not valid.', 400);
        }	                                          

        if ($request->hasFile('thumb'))
        {
            if ($request->file('thumb')->isValid()){

                $image = $request->file('thumb');
				$detail = pathinfo($request->file('thumb')->getClientOriginalName());
				$thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();
				
                $path = public_path('assets/resources/category/thumb');
				
				Image::make($image)->save($path.'/'.$thumbNewName);
                
                if (!File::exists($path.'/200')){
                    File::MakeDirectory($path.'/200',0777, true);
                }
                if (!File::exists($path.'/400')){
                    File::MakeDirectory($path.'/400/',0777, true);
                }

				Image::make($image)->resize(200, null, function ($constraint) {
		            $constraint->aspectRatio();
		        })->save($path.'/200/'.$thumbNewName);

		        Image::make($image)->resize(400, null, function ($constraint) {
		            $constraint->aspectRatio();
		        })->save($path.'/400/'.$thumbNewName);

		        $files['thumb'] = $thumbNewName;

            }
            
        }
        if ($request->hasFile('lthumb'))
        {
            if ($request->file('lthumb')->isValid()){
                
                $image = $request->file('lthumb');
				$detail = pathinfo($request->file('lthumb')->getClientOriginalName());
				$lthumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();	
				$path = public_path('assets/resources/category/lthumb');
				
				Image::make($image)->save($path.'/'.$lthumbNewName);

                if (!File::exists($path.'/400')){
                    File::MakeDirectory($path.'/400',0777, true);
                }

		        Image::make($image)->resize(400, null, function ($constraint) {
		            $constraint->aspectRatio();
		        })->save($path.'/400/'.$lthumbNewName);

		        $files['lthumb'] = $lthumbNewName;
            }
            
        }

        return response($files);

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
        //
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
        //
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
     
}
