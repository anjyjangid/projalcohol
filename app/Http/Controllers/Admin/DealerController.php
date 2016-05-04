<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\DealerRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;

use AlcoholDelivery\Dealer as Dealer;

class DealerController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('admin');        
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
    public function store(DealerRequest $request)
    {        
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];

        $dealer = Dealer::create($inputs);    

        return $dealer;
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
    **/
    public function update(DealerRequest $request, $id)
    {
        $inputs = $request->all();

        $dealer = dealer::find($id);
        
        $dealer->title = $inputs['title'];
        $dealer->address = $inputs['address'];
        $dealer->contacts = $inputs['contacts'];
        $dealer->status = (int)$inputs['status'];    
        $dealer->description = $inputs['description'];
        
        if($dealer->save()){
            return response(array("success"=>true,"message"=>"Dealer updated successfully"));
        }
        
        return response(array("success"=>false,"message"=>"Something went worng"));
        
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

    		$dealers = Dealer::whereIn('_id', $keys)->delete();

    	} catch(\Illuminate\Database\QueryException $e){

    		return response(array($e,"success"=>false,"message"=>"There is some issue with deletion process"));

    	}

        return response(array("success"=>true,"message"=>"Record(s) Removed Successfully"));
    }

    public function getdealer($dealerId){

        $dealerObj = new Dealer;

        $result = $dealerObj->getDealers(array(
                        "key"=>$dealerId,
                        "multiple"=>false
                    ));
        
        return response($result, 201);

    }

    public function getdealers(Request $request)
    {
        $params = $request->all();

        $dealers = new Dealer;

        $columns = array('_id',"updated_at",'contacts','address','title','status');
        
        /* Individual column filtering */
    

        foreach($columns as $fieldKey=>$fieldTitle)
        {

            if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
            {   
                if($fieldTitle=="status"){
                    
                    $dealers = $dealers->where($fieldTitle, "=",(int)$params[$fieldTitle]);

                }else{

                    $dealers = $dealers->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");

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
                    
                    $dealers = $dealers->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
                    
                }
            }

        }
        
        /* Data set length after filtering */        

        $iFilteredTotal = $dealers->count();

        /*
         * Paging
         */
        if ( isset( $params['start'] ) && $params['length'] != '-1' )
        {
            $dealers = $dealers->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
        }

        $iTotal = $dealers->count();

        $dealers = $dealers->get($columns);

        $dealers = $dealers->toArray();
                
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
        
        foreach($dealers as $key=>$value) {

            $row=array();

            $row[] = '<input type="checkbox" name="id[]" value="'.$value['_id'].'">';

            if($params['order'][0]['column']==1 && $params['order'][0]['dir']=='desc'){
                $row[] = $srStart--;//$row1[$aColumns[0]];
            }else{
                $row[] = ++$srStart;//$row1[$aColumns[0]];
            }

            $status = $status_list[(int)$value['status']];
            
                    
            $row[] = ucfirst($value['title']);
            $row[] = count($value['contacts']);

            $row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$value['_id'].'\')" id="'.$value['_id'].'" data-table="dealer" data-status="'.((int)$value['status']?0:1).'" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';
            $row[] = '<a title="View : '.$value['title'].'" href="#/dealers/show/'.$value['_id'].'" class="btn btn-xs default"><i class="fa fa-search"></i></a>'.
                     '<a title="Edit : '.$value['title'].'" href="#/dealers/edit/'.$value['_id'].'" class="btn btn-xs default"><i class="fa fa-edit"></i></a>';
            
            $records['data'][] = $row;
        }
        
        return response($records, 201);
        
    }
    
    
    public function getlist(){
        $dealers = Dealer::where('status','=',1)->get(['_id','title']);                
        return response($dealers,201);
    }

}
