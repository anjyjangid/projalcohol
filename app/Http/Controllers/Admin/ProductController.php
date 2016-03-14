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
        prd($inputs);      
        // validation rules
        $validator = Validator::make($request->all(), [
            'title' => 'required',            
            'thumb' => 'required|mimes:jpeg,jpg,png|max:8000',
        ]);

        // if validation fails
        if ($validator->fails()) {
            return response('There are errors in the form data', 400);
        }
                
       	$fileUpload = $this->uploadThumb($request);
        
        return Categories::create([
            'cat_title' => $inputs['title'],
            'cat_thumb' => $fileUpload->original['thumb'],
            'cat_lthumb' => isset($fileUpload->original['lthumb'])?$fileUpload->original['lthumb']:''
        ]);
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
