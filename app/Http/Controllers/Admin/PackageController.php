<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\PackageRequest;
use AlcoholDelivery\Http\Controllers\Controller;

use File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;
use MongoId;
use Input;
use DB;
use AlcoholDelivery\Packages;
use AlcoholDelivery\Products;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        
        $params = $request->all();

        extract($params); 

        $response = [
            'recordsTotal' => 0,
            'recordsFiltered' => 0,
            'draw' => $draw,
            'length' => $length,
            'aaData' => []
        ];
      
        return response($response,201);
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
    public function store(PackageRequest $request)
    {
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];
        $inputs['type'] = (int)$inputs['type'];

        $packageItems = [];

        if (isset($inputs['packageItems']) && !empty($inputs['packageItems'])){
            foreach ($inputs['packageItems'] as $dKey => $discount){   
                $packageItems[$dKey] = [
                    'cprice' => (float)$discount['cprice'],
                    'quantity' => (int)$discount['quantity'],
                ];                                               
            }
        }

        $inputs['packageItems'] = $packageItems;

        $package = Packages::create($inputs);            

        if($package){          
          $products = Products::whereIn('_id',$package->products)->get();
          //ADD PACKAGES IDS IN PRODUCT TABLE
          foreach ($products as $dkey => $dvalue) {
            $dvalue->push('packages',$package->_id,true);
          }
          $this->saveImage($package,$inputs['image']);
          return response($package,201);
        }else{          
          return response('Unable to add package',422);
        }  
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

    public function listpackage(Request $request){
        
        $params = $request->all();        

        extract($params);

        $packages = new Packages;

        $packages = $packages->where('type',(int)$ptype);

        if(isset($params['search']['value']) && trim($params['search']['value'])!=''){
            $sval = $params['search']['value'];
            $packages = $packages->where('title','regexp', "/.*$sval/i");
        }

        $iTotalRecords = $packages->count();        

        $columns = array('_id','title','status','type');

        $packages = $packages
        ->skip((int)$start)
        ->take((int)$length);

        $packages = $packages->get($columns);

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $packages
            /*'length' => $length,
            'aaData' => []*/
        ];
      
        return response($response,200);
    }

    public function saveImage($package,$file){
        $image = @$file['thumb'];
        $destinationPath = storage_path('packages');
        if (!File::exists($destinationPath)){
            File::MakeDirectory($destinationPath,0777, true);
        }
        $filename = $package->_id.'.'.$image->getClientOriginalExtension();
        $upload_success = $image->move($destinationPath, $filename);

        $package->coverImage = $filename;
        $package->save();

    }
}
