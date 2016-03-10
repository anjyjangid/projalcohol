<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
        

        // check if the file exist
        if (!$request->hasFile('thumb')) {
            return response('No file sent.', 400);
        }

        // check if the file is valid file
        if (!$request->file('thumb')->isValid()) {
            return response('File is not valid.', 400);
        }

        // validation rules
        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'thumb' => 'required|mimes:jpeg,jpg,png|max:8000',
        ]);

        // if validation fails
        if ($validator->fails()) {
            return response('There are errors in the form data', 400);
        }


        if ($request->hasFile('thumb'))
        {
            if ($request->file('thumb')->isValid()){

                $detail = pathinfo($request->file('thumb')->getClientOriginalName());
                $newName = strtotime(date("Y-m-d H:i:s"));
                $thumbNewName = $detail['filename']."-".$newName.".".$detail['extension'];
                $request->file('thumb')->move(public_path('assets/resources/category/thumb'), $thumbNewName);

            }
            
        }
        if ($request->hasFile('lthumb'))
        {
            if ($request->file('lthumb')->isValid()){
                
                $detail = pathinfo($request->file('lthumb')->getClientOriginalName());
                $newName = strtotime(date("Y-m-d H:i:s"));
                $lThumbNewName = $detail['filename']."-".$newName.".".$detail['extension'];
                $request->file('lthumb')->move(public_path('assets/resources/category/lthumb'), $lThumbNewName);

            }
            
        }        

        return Categories::create([
            'cat_title' => $inputs['title'],
            'cat_thumb' => $thumbNewName,
            'cat_lthumb' => $lThumbNewName
        ]);
        
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

    public function getcategories()
    {

        $categories = Categories::all()->toArray();
        
        $records = [
            "iTotalRecords" => Categories::count(),
            "iTotalDisplayRecords" => Categories::count(),
        ];

        $status_list = array(
            array("success" => "Active"),                    
            array("warning" => "in-Active")
          );
        $i = 1;
        foreach($categories as $key=>$value) {
            $status = $status_list[rand(0, 1)];
            $records["data"][] = array(
              '<input type="checkbox" name="id[]" value="'.$value['_id'].'">',
              $i++,
              
              '<img src="'.asset('assets/resources/category/thumb/'.$value['cat_thumb']).'" alt="'.$value['cat_title'].'" width="100" height="100">',
              $value['cat_title'],
              '<span class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span>',
              '<a href="javascript:;" class="btn btn-xs default"><i class="fa fa-search"></i> View</a>',
            );
        }
        
        return response($records, 201);

        
    }
    
}
