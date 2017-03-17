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
        //$page = new Cms; //TO ADD NEW CMS UNCOMMENT THIS LINE
        $page->section = $inputs['section'];
        $page->title = $inputs['title'];
        $page->linkTitle = $inputs['linkTitle'];
        //$page->description = $inputs['description'];
        $page->content = $inputs['content'];
        $page->status = (int)$inputs['status'];
        //$page->slug = $inputs['slug'];
        $page->metaTitle = @$inputs['metaTitle'];
        $page->metaKeywords = @$inputs['metaKeywords'];
        $page->metaDescription = @$inputs['metaDescription'];    
        
        
        if($page->save()){
            return response(array("success"=>true,"message"=>"Cms ".ucfirst($page->title)." page updated successfully"));
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

    public function getDetail($pageId){

        $cmsObj = new Cms;

        $result = $cmsObj->getPages(array(
                        "key"=>$pageId,
                        "multiple"=>false
                    ));

        return response($result, 201);

    }

    public function postList(Request $request)
    {        
        
        $params = $request->all();

        extract($params);

        $columns = ['_id','smallTitle','description'];

        $project = ['title'=>1,'description'=>1,'slug'=>1];

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

        $model = Cms::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Cms::raw()->aggregate($query);
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
