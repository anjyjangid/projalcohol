<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\CmsRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;

use AlcoholDelivery\Cms as Cms;

class CmsController extends Controller
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
    public function store(CmsRequest $request)
    {        
        $inputs = $request->all();
        
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
     */
    public function update(CmsRequest $request, $id)
    {
        $inputs = $request->all();
        
        $page = Cms::find($id);
        
        $page->title = $inputs['title'];
        $page->description = $inputs['description'];
        $page->content = $inputs['content'];
        $page->status = $inputs['status'];    
        
        
        if($page->save()){
            return response(array("success"=>true,"message"=>"Cms ".ucfirst($page->title)." page updated successfully"));
        }
        
        return response(array("success"=>false,"message"=>"Something went worng"));
        
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

    public function getpage($pageId){

        $cmsObj = new Cms;

        $result = $cmsObj->getPages(array(
                        "key"=>$pageId,
                        "multiple"=>false
                    ));
        
        return response($result, 201);

    }

    public function getpages(Request $request)
    {        
        $params = $request->all();

        $cms = new Cms;

        $columns = array('_id',"title",'description','content','updated_at','status');
        
        /* Individual column filtering */
    
        foreach($columns as $fieldKey=>$fieldTitle)
        {

            if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
            {

                $cms = $cms->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");

            }
        }


        //prd($cms->toSql());

            
        /*
         * Ordering
         */
        
        if ( isset( $params['order'] ) )
        {

            foreach($params['order'] as $orderKey=>$orderField){

                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    
                    $cms = $cms->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
                    
                }
            }

        }
        
        /* Data set length after filtering */        

        $iFilteredTotal = $cms->count();

        /*
         * Paging
         */
        if ( isset( $params['start'] ) && $params['length'] != '-1' )
        {
            $cms = $cms->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
        }

        $iTotal = $cms->count();

        $cms = $cms->get($columns);

        $cms = $cms->toArray();
                
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
        if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
            $srStart = intval($iTotal);
        }

        $i = 1;
        foreach($cms as $key=>$value) {

            $row=array();

            if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
                $row[] = $srStart--;//$row1[$aColumns[0]];
            }else{
                $row[] = ++$srStart;//$row1[$aColumns[0]];
            }

            $status = $status_list[(int)$value['status']];
            
                    
            $row[] = ucfirst($value['title']);
            $row[] = $value['description'];

            $row[] = '<a href="javascript:void(0)"><span ng-click="changeStatus(\''.$value['_id'].'\')" id="'.$value['_id'].'" data-table="pages" data-status="'.((int)$value['status']?0:1).'" class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span></a>';
            $row[] = '<a title="View : '.$value['title'].'" ui-sref=cms.show({pageid:"'.$value['_id'].'"}) class="btn btn-xs default"><i class="fa fa-search"></i></a>'.
                     '<a title="Edit : '.$value['title'].'" ui-sref=cms.edit({pageid:"'.$value['_id'].'"}) class="btn btn-xs default"><i class="fa fa-edit"></i></a>';
            
            $records['data'][] = $row;
        }
        
        return response($records, 201);
        
    }
    
    
}
