<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\TestimonialRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use MongoId;
use Storage;
use Validator;
use Image;

use AlcoholDelivery\Testimonial as Testimonial;

class TestimonialController extends Controller
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
    public function store(TestimonialRequest $request)
    {    

       	if ($request->hasFile('image'))
        {
            if ($request->file('image')->isValid()){

                $image = $request->file('image');
                $detail = pathinfo($request->file('image')->getClientOriginalName());
                $thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();    
                $path = public_path('assets/resources/testimonial');
                

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

            Testimonial::create($inputs);

        } catch(\Exception $e){

            return response(array("success"=>false,"message"=>$e->getMessage()));

        }
       	
        return response(array("success"=>true,"message"=>"Testimonial created successfully"));
       	
       	
    }


    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {

        $result = Testimonial::where("_id",$id)->first(array("name","image","content","status"));

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
    public function postUpdate(TestimonialRequest $request, $id)
    {   

        $testimonial = Testimonial::find($id);

        if(is_null($testimonial)){

            return response(array("success"=>false,"message"=>"Invalid Request :: Record you want to update is not exist"));

        }

        $inputs = $request->all();
        
        if ($request->hasFile('image'))
        {
            if ($request->file('image')->isValid()){

                $image = $request->file('image');
                $detail = pathinfo($request->file('image')->getClientOriginalName());
                $thumbNewName = $detail['filename']."-".time().".".$image->getClientOriginalExtension();    
                $path = public_path('assets/resources/testimonial');
                

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

        $testimonial->name = $inputs['name'];
        $testimonial->content = $inputs['content'];
        $testimonial->status = (int)$inputs['status'];

        try {

            $testimonial->save();

        } catch(\Exception $e){

            return response(array("success"=>false,"message"=>$e->getMessage()));

        }
        
        return response(array("success"=>true,"message"=>"Testimonial updated successfully"));
                    
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

            $testimonials = Testimonial::whereIn('_id', $keys)->delete();

        } catch(\Illuminate\Database\QueryException $e){

            return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

        }

        return response(array($testimonials,"success"=>true,"message"=>"Record(s) Removed Successfully"));
    }

    public function postListing(Request $request,$id = false)
    {
        $params = $request->all();

        $testimonials = new Testimonial;        
        

        $columns = array('_id','updated_at','image',"name","content",'status');
        $indexColumn = '_id';      
        $table = 'testimonials';
               

            
        /* Individual column filtering */    

        foreach($columns as $fieldKey=>$fieldTitle)
        {              

            if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
            {
                            
                if($fieldTitle=="status"){

                    $testimonials = $testimonials->where($fieldTitle, '=', (int)$params[$fieldTitle]);
                }
                else{
                    $testimonials = $testimonials->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");
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
                    
                    $testimonials = $testimonials->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
                    
                }
            }

        }
        
        /* Data set length after filtering */        

        $iFilteredTotal = $testimonials->count();

        /*
         * Paging
         */
        if ( isset( $params['start'] ) && $params['length'] != '-1' )
        {
            $testimonials = $testimonials->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
        }

        $iTotal = $testimonials->count();

        $testimonials = $testimonials->get($columns);

        $testimonials = $testimonials->toArray();
                
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

        foreach($testimonials as $key=>$value) {

            $row=array();

            $row[] = '<input type="checkbox" name="id[]" value="'.$value['_id'].'">';

            if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
                $row[] = $srStart--;//$row1[$aColumns[0]];
            }else{
                $row[] = ++$srStart;//$row1[$aColumns[0]];
            }



            $status = $status_list[(int)$value['status']];
            
            $row[] = "<img src='".asset('assets/resources/testimonial/200/'.$value['image'])."' width='100'>";

            $row[] = ucfirst($value['name']);

            $row[] = $value['content'];
            
            $row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$value['_id'].'\')" id="'.$value['_id'].'" data-table="testimonial" data-status="'.((int)$value['status']?0:1).'" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';
            $row[] = '<a title="Edit : '.$value['name'].'" ui-sref=testimonial.edit({testimonialid:"'.$value['_id'].'"}) class="btn btn-xs default"><i class="fa fa-edit"></i></a>';
            
            $records['data'][] = $row;
        }
        
        return response($records, 201);
        
    }


}
