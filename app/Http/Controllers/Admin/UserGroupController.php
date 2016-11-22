<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\UserGroup;
use AlcoholDelivery\PageList;
use MongoId;

class UserGroupController extends Controller
{
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
    public function store(Request $request)
    {
        $inputs = $request->all();

prd($inputs);
        $model = UserGroup::create($inputs);
        
        if($model){
            return response($model,201);
        }

        return response('Error in saving UserGroup.',422);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $model = UserGroup::find($id);

        return response($model,200);
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
    public function postUpdate(CompanyRequest $request, $id)
    {
        $inputs = $request->all();

        $model = UserGroup::find($id);
        prd($inputs);
        if($model){                        
            
            $model->update($inputs);

            return response($model,201);
        }

        return response('Error in saving UserGroup.',422);
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

    public function postAddpagelist(Request $request){

        $data = $request->all();

        $pageList['page_url'] = $data['page_url'];
        $pageList['page_state'] = $data['page_state'];
        $pageList['status'] = 1;

        $res = PageList::create($pageList);
        //prd($res);
        return response($res, 200);
    }

    public function getPageslist(Request $request){

        $pageList = PageList::where('status', 1)->get();

        return response($pageList, 200);
    }

    public function postUsergroup(Request $request, $id=null){
        
        $data = $request->all();
        
        $inputs['name']         = $data['name'];
        $inputs['access_list']  = $data['access_list'];
        $inputs['modify_list']  = $data['modify_list'];

        if($id){
            $usergroup = UserGroup::where('_id', $id)->first();
            $usergroup->update($inputs);         
        }else{
            $inputs['status']       = 1;

            $usergroup = UserGroup::create($inputs);
        }

        if($usergroup){
            return response($usergroup, 200);
        }else{
            return response(['message'=>'Invalid usergroup.'], 404);
        }
    }

    public function getUsergroupid($id){
        
        $usergroup = UserGroup::where('_id', $id)->first();

        if($usergroup){
            return response($usergroup, 200);
        }else{
            return response(['message'=>'Invalid usergroup.'], 404);
        }
    }

    public function getUsergroup(){
        
        $usergroup = UserGroup::where('status', 1)->get(['_id', 'name']);

        if($usergroup){
            return response($usergroup, 200);
        }else{
            return response(['message'=>'Invalid usergroup.'], 404);
        }
    }

    public function postUsergrouplist(Request $request){

        $params = $request->all();

        extract($params);

        $columns = ['_id', 'name', 'status'];

        $project = ['name'=>1, 'status'=>1];

        //$project['name'] = ['$toLower' => '$name'];

        $query = [];        
        
        $query[]['$project'] = $project;

        if(isset($name) && trim($name)!=''){
            $s = "/".$name."/i";
            $query[]['$match']['name'] = ['$regex'=>new \MongoRegex($s)];
        }

        if(isset($status) && trim($status)!=''){            
            $query[]['$match']['status'] = (int)$status;
        }

        $sort = ['updated_at'=>-1];

        if(isset($params['order']) && !empty($params['order'])){
            $field = $columns[$params['order'][0]['column']];
            $direction = ($params['order'][0]['dir']=='asc')?1:-1;
            $sort = [$field=>$direction];            
        }

        $query[]['$sort'] = $sort;

        $model = UserGroup::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = UserGroup::raw()->aggregate($query);
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
