<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\BrandRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use MongoId;
use Storage;
use Validator;
use Image;

use AlcoholDelivery\Brand as Brand;

class BrandController extends Controller
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
    public function store(BrandRequest $request)
    {    

       	if ($request->hasFile('image'))
        {
            if ($request->file('image')->isValid()){

                $image = $request->file('image');
                $detail = pathinfo($request->file('image')->getClientOriginalName());
                $thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();    
                $path = public_path('assets/resources/brand');
                

                if (!File::exists($path)){
                    File::MakeDirectory($path,0777, true);
                }
                            
                if (!File::exists($path.'/200')){
                    File::MakeDirectory($path.'/200',0777, true);
                }
                if (!File::exists($path.'/400')){
                    File::MakeDirectory($path.'/400/',0777, true);
                }

                Image::make($image)->save($path.'/'.$thumbNewName);

                Image::make($image)->resize(200, null, function ($constraint) {
                    $constraint->aspectRatio();
                })->save($path.'/200/'.$thumbNewName);

                Image::make($image)->resize(400, null, function ($constraint) {
                    $constraint->aspectRatio();
                })->save($path.'/400/'.$thumbNewName);            

            }else{

                return response('There is some issue with image file', 400);

            }
            
        }
       

       	$inputs = $request->all();
        
        $inputs['status'] = (int)$inputs['status'];

        $inputs['image'] = $thumbNewName;

       	
        try {

            Brand::create($inputs);

        } catch(\Exception $e){

            return response(array("success"=>false,"message"=>$e->getMessage()));

        }
       	
        return response(array("success"=>true,"message"=>"Brand created successfully"));
       	
       	
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {

        $result = Brand::where("_id",$id)->first(array("title","image","link","status"));

        return response($result, 201);

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
    public function postUpdate(BrandRequest $request, $id)
    {   

        $brand = Brand::find($id);

        if(is_null($brand)){

            return response(array("success"=>false,"message"=>"Invalid Request :: Record you want to update is not exist"));

        }

        $inputs = $request->all();

        if ($request->hasFile('image'))
        {
            if ($request->file('image')->isValid()){

                $image = $request->file('image');
                $detail = pathinfo($request->file('image')->getClientOriginalName());
                $thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();    
                $path = public_path('assets/resources/brand');
                

                if (!File::exists($path)){
                    File::MakeDirectory($path,0777, true);
                }
                            
                if (!File::exists($path.'/200')){
                    File::MakeDirectory($path.'/200',0777, true);
                }
                if (!File::exists($path.'/400')){
                    File::MakeDirectory($path.'/400/',0777, true);
                }

                Image::make($image)->save($path.'/'.$thumbNewName);

                Image::make($image)->resize(200, null, function ($constraint) {
                    $constraint->aspectRatio();
                })->save($path.'/200/'.$thumbNewName);

                Image::make($image)->resize(400, null, function ($constraint) {
                    $constraint->aspectRatio();
                })->save($path.'/400/'.$thumbNewName);            

                $brand->image = $thumbNewName;

            }else{

                return response('There is some issue with image file', 400);

            }
            
        }
        


        $brand->title = $inputs['title'];
        $brand->link = $inputs['link'];        
        $brand->status = (int)$inputs['status'];        
                
        try {

            $brand->save();

        } catch(\Exception $e){

            return response(array("success"=>false,"message"=>$e->getMessage()));

        }
        
        return response(array("success"=>true,"message"=>"Brand $brand->title Updated successfully"));
                    
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($ids)
    {        
        $keys = explode(",", $ids);
        
        try {

            $brands = Brand::whereIn('_id', $keys)->delete();

        } catch(\Illuminate\Database\QueryException $e){

            return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

        }

        return response(array($brands,"success"=>true,"message"=>"Record(s) Removed Successfully"));
    }

    public function postListing(Request $request,$id = false)
    {

        $params = $request->all();

        $brands = new Brand;        
        

        $columns = array('_id','updated_at','image',"title","link",'status');
        $indexColumn = '_id';      
        $table = 'brands';
               

            
        /* Individual column filtering */    

        foreach($columns as $fieldKey=>$fieldTitle)
        {              

            if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
            {
                            
                if($fieldTitle=="status"){

                    $brands = $brands->where($fieldTitle, '=', (int)$params[$fieldTitle]);
                }
                else{
                    $brands = $brands->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");
                }
                            
            }
        }
    
        /*
         * Ordering
         */        

        if ( isset( $params['order'] ) )
        {

            foreach($params['order'] as $orderKey=>$orderField){

                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    
                    $brands = $brands->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
                    
                }
            }

        }
        
        /* Data set length after filtering */        

        $iFilteredTotal = $brands->count();

        /*
         * Paging
         */
        if ( isset( $params['start'] ) && $params['length'] != '-1' )
        {
            $brands = $brands->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
        }

        $iTotal = $brands->count();

        $brands = $brands->get($columns);

        $brands = $brands->toArray();
                
        /*
         * Output
         */
         
        
        $records = array(
            "iTotalRecords" => $iTotal,
            "iTotalDisplayRecords" => $iFilteredTotal,
            "data" => array()
        );

             
        
        $status_list = array(            
            array("warning" => "in-Active"),
            array("success" => "Active")
          );



        $srStart = intval( $params['start'] );
        if($params['order'][0]['column']==1 && $params['order'][0]['dir']=='desc'){
            $srStart = intval($iTotal);
        }

        $i = 1;

        foreach($brands as $key=>$value) {

            $row=array();

            $row[] = '<input type="checkbox" name="id[]" value="'.$value['_id'].'">';

            if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
                $row[] = $srStart--;//$row1[$aColumns[0]];
            }else{
                $row[] = ++$srStart;//$row1[$aColumns[0]];
            }



            $status = $status_list[(int)$value['status']];
            
            $row[] = "<img src='".asset('assets/resources/brand/200/'.$value['image'])."' width='100'>";

            $row[] = ucfirst($value['title']);

            $row[] = $value['link'];
            
            $row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$value['_id'].'\')" id="'.$value['_id'].'" data-table="brands" data-status="'.((int)$value['status']?0:1).'" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';
            $row[] = '<a title="Edit : '.$value['title'].'" ui-sref=userLayout.brand.edit({brandid:"'.$value['_id'].'"}) class="btn btn-xs default"><i class="fa fa-edit"></i></a>';
            
            $records['data'][] = $row;
        }
        
        return response($records, 201);
        
    }


}
