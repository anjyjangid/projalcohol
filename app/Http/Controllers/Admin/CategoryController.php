<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;
use Image;

use AlcoholDelivery\Categories as Categories;

class CategoryController extends Controller
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


       	
       	$category = new Categories;

       	if($inputs['ptitle']){

	       	$parentCategories = Categories::find($inputs['ptitle']);

	       	$ancestors = $parentCategories->ancestors;

	       	if(empty($ancestors)){
	       		$ancestors = [];
	       	}
	       	
	       	array_unshift($ancestors, ["_id" => $parentCategories->_id,'title' =>$parentCategories->cat_title] );

	       	$category->ancestors = $ancestors;

        }

       	$category->cat_title = $inputs['title'];
       	$category->cat_status = '0';
       	$category->cat_thumb = $fileUpload->original['thumb'];
       	$category->cat_lthumb = isset($fileUpload->original['lthumb'])?$fileUpload->original['lthumb']:'';
       	
       	if($category->save()){
       		return response(array("success"=>true,"message"=>"Category created successfully"));
       	}
       	
       	return response(array("success"=>false,"message"=>"Something went worng"));
    }

    public function uploadThumb(Request $request){
    	
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

    public function getparentcategories($id = false){
    	
    	if($id==""){

    		$categories = Categories::whereNull('ancestors')->get();

    	}elseif($id == 'all'){
            $categories = Categories::all()->toArray();
        }else{

    		$categories = Categories::where('ancestors.0._id','=',$id)->get();

    	}

    	return response($categories);
    }

    public function getcategories()
    {

        $categories = Categories::all()->toArray();
        
        $records = [
            "iTotalRecords" => Categories::count(),
            "iTotalDisplayRecords" => Categories::count(),
        ];

        $status_list = array(
            array("warning" => "in-Active"),
            array("success" => "Active")
          );
        $i = 1;
        foreach($categories as $key=>$value) {

            $status = $status_list[$value['cat_status']];
            $records["data"][] = array(
              '<input type="checkbox" name="id[]" value="'.$value['_id'].'">',
              $i++,
              
              // '<img src="'.asset('assets/resources/category/thumb/200/'.$value['cat_thumb']).'" alt="'.$value['cat_title'].'" width="100" height="100">',
              ucfirst($value['cat_title']),
              isset($value['ancestors'][0]['title'])?ucfirst($value['ancestors'][0]['title']):'',
              '<span class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span>',
              '<a href="javascript:;" class="btn btn-xs default"><i class="fa fa-search"></i> View</a>',
            );
        }
        
        return response($records, 201);

        
    }
    
}
