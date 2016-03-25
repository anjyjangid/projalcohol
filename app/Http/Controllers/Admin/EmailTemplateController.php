<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\EmailTemplateRequest;

use AlcoholDelivery\Http\Controllers\Controller;

use Storage;
use Validator;

use AlcoholDelivery\EmailTemplate as EmailTemplate;

class EmailTemplateController extends Controller
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
    public function store(EmailTemplateRequest $request)
    {        
        $inputs = $request->all();
        
        $template = EmailTemplate::create($inputs);    

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
    public function update(EmailTemplateRequest $request, $id)
    {
        $inputs = $request->all();
        
        $template = EmailTemplate::find($id);
        
        $template->title = $inputs['title'];
        $template->subject = $inputs['subject'];
        $template->content = $inputs['content'];
        
        if($template->save()){
            return response(array("success"=>true,"message"=>"Email Template ".ucfirst($template->title)." updated successfully"));
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

    public function gettemplate($templateId){

        $templateObj = new EmailTemplate;

        $result = $templateObj->getTemplates(array(
                        "key"=>$templateId,
                        "multiple"=>false
                    ));
        
        return response($result, 201);

    }

    public function gettemplates(Request $request)
    {        
        $params = $request->all();

        $template = new EmailTemplate;

        $columns = array('_id',"title",'subject','content','updated_at');
        
        /* Individual column filtering */
    
        foreach($columns as $fieldKey=>$fieldTitle)
        {

            if ( isset($params[$fieldTitle]) && $params[$fieldTitle]!="" )
            {

                $template = $template->where($fieldTitle, 'regex', "/.*$params[$fieldTitle]/i");

            }
        }


        //prd($template->toSql());

            
        /*
         * Ordering
         */
        
        if ( isset( $params['order'] ) )
        {

            foreach($params['order'] as $orderKey=>$orderField){

                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    
                    $template = $template->orderBy($columns[ intval($orderField['column']) ],($orderField['dir']==='asc' ? 'asc' : 'desc'));
                    
                }
            }

        }
        
        /* Data set length after filtering */        

        $iFilteredTotal = $template->count();

        /*
         * Paging
         */
        if ( isset( $params['start'] ) && $params['length'] != '-1' )
        {
            $template = $template->skip(intval( $params['start'] ))->take(intval( $params['length'] ) );
        }

        $iTotal = $template->count();

        $template = $template->get($columns);

        $template = $template->toArray();
                
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
        foreach($template as $key=>$value) {

            $row=array();

            if($params['order'][0]['column']==0 && $params['order'][0]['dir']=='asc'){
                $row[] = $srStart--;//$row1[$aColumns[0]];
            }else{
                $row[] = ++$srStart;//$row1[$aColumns[0]];
            }

            $row[] = ucfirst($value['title']);

            $row[] = $value['subject'];

            $row[] = '<a title="View : '.$value['title'].'" href="#/emailtemplates/show/'.$value['_id'].'" class="btn btn-xs default"><i class="fa fa-search"></i></a>'.
                     '<a title="Edit : '.$value['title'].'" href="#/emailtemplates/edit/'.$value['_id'].'" class="btn btn-xs default"><i class="fa fa-edit"></i></a>';
            
            $records['data'][] = $row;
        }
        
        return response($records, 201);
        
    }
    
    
}
