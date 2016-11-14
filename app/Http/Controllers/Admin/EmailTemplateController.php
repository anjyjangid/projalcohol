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
        //
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

        return response(array("success"=>false,"message"=>"Something went wrong"));

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

    public function getTemplate($templateId){

        $templateObj = new EmailTemplate;

        $result = $templateObj->getTemplates(array(
                        "key"=>$templateId,
                        "multiple"=>false
                    ));
        
        return response($result, 201);

    }

    

    public function postTemplates(Request $request)
    {
    
        $params = $request->all();

        extract($params);

        $columns = ['_id','smallTitle','subject'];

        $project = ['title'=>1,'subject'=>1];

        $project['smallTitle'] = ['$toLower' => '$title'];

        $query = [];
        
        $query[]['$project'] = $project;

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = EmailTemplate::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = EmailTemplate::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);
    }


    
    
}
