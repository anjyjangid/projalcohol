<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Http\Requests\CompanyRequest;
use MongoId;
use AlcoholDelivery\Company;
use File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

class CompanyController extends Controller
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
        $inputs['country'] = new MongoId($inputs['country']);
        $inputs['status'] = (int)$inputs['status'];

        //companyType : 1-ECI, 2-BI, 3-WI

        // $inputs['companyType'] = 3;
        $model = Company::create($inputs);
        
        if($model){                        
            
            if($request->hasFile('logo')){
                $image = $inputs['logo'];    
                $filename = $model->_id.'.'.$image->getClientOriginalExtension();            
                $destinationPath = storage_path('company');
                if (!File::exists($destinationPath)){
                    File::MakeDirectory($destinationPath,0777, true);
                }            
                $upload_success = $image->move($destinationPath, $filename);
                $model->logoImage = $filename;
                $model->save();
            }    
            return response($model,201);
        }

        return response('Error in saving company.',422);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $model = Company::find($id);

        $model->logo = $model->logoImage;

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
        $inputs['country'] = new MongoId($inputs['country']);
        $inputs['status'] = (int)$inputs['status'];

        //companyType : 1-ECI, 2-BI, 3-WI

        // $inputs['companyType'] = 3;
        $model = Company::find($id);
        
        if($model){                        
            
            $model->update($inputs);

            if($request->hasFile('logo')){
                $image = $inputs['logo'];    
                $filename = $model->_id.'.'.$image->getClientOriginalExtension();            
                $destinationPath = storage_path('company');
                if (!File::exists($destinationPath)){
                    File::MakeDirectory($destinationPath,0777, true);
                }            
                $upload_success = $image->move($destinationPath, $filename);
                $model->logoImage = $filename;
                $model->save();
            }    
            return response($model,201);
        }

        return response('Error in saving company.',422);
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


    public function postList(Request $request){

        $params = $request->all();

        extract($params);

        $columns = ['_id','smallTitle','companyType'];

        $project = ['title'=>1,'companyType'=>1];

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

        $model = Company::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Company::raw()->aggregate($query);
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
