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
use AlcoholDelivery\Setting;
use AlcoholDelivery\Categories;
use AlcoholDelivery\Sale;

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
    public function postStore(PackageRequest $request)
    {
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];
        $inputs['type'] = (int)$inputs['type'];

        $packageItems = [];

        if (isset($inputs['packageItems']) && !empty($inputs['packageItems'])){
            foreach ($inputs['packageItems'] as $dKey => $discount){   
                
                if($inputs['type'] == 1)
                  $inputs['packageItems'][$dKey]['quantity'] = (int)$discount['quantity'];

                $pckgpro = [];
                foreach ($discount['products'] as $prokey => $provalue) {
                  $inputs['packageItems'][$dKey]['products'][$prokey] = [
                    '_id' => $provalue['_id'],
                    'cprice' => (float)$provalue['cprice'],
                  ];
                }                

            }
        }

        if(isset($inputs['recipe']) && !empty($inputs['recipe'])){
            foreach ($inputs['recipe'] as $rKey => $rVal){   
                unset($inputs['recipe'][$rKey]['$$hashKey']);            
            }            
        }        

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
    public function getDetail($id,$type)
    {
        $package = new Packages;

        $package = $package->where('_id', $id)->where('type',(int)$type)->with('productlist')->first();

        if($package){

            $settingObj = new Setting;

            $global = $settingObj->getSettings(array(
              "key"=>'pricing',
              "multiple"=>false
            ));

            
            $packageItems = $package['packageItems'];
            $packageupdate = [];
            foreach ($packageItems as $pkgkey => $pkgvalue) {              
              $packageupdate[$pkgkey] = $pkgvalue;
              $pkgpro = [];
              foreach ($pkgvalue['products'] as $prokey => $provalue) {
                  $tier = $global->settings['regular_express_delivery'];
                  $value = $this->getProductById($provalue['_id'], $package['productlist']);     

                  if(isset($value['regular_express_delivery']) && !empty($value['regular_express_delivery'])){
                  $tier = $value['regular_express_delivery'];          
                  }else{
                    $categories = Categories::whereIn('_id',$value['categories'])->get();
                    if($categories){
                      foreach ($categories as $ckey => $cvalue) {
                        if(isset($cvalue['regular_express_delivery']) && !empty($cvalue['regular_express_delivery'])){
                          $tier = $cvalue['regular_express_delivery'];                
                        }
                      }
                    }
                  }
                  $sprice = $this->calculatePrice($value['price'],$tier);

                  $pkgpro[$prokey] = [
                    '_id' => $provalue['_id'],
                    'cprice' => $provalue['cprice'],
                    'name' => $value['name'],
                    'sprice' => $sprice,
                    'imageFiles' => $value['imageFiles']
                  ];
              }
              $packageupdate[$pkgkey]['products'] = $pkgpro;              
            }

            $package->packageItems = $packageupdate;            

            return response($package,200);
        }
        else
            return response('Invalid Package',404);

    }   

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function postUpdate(PackageRequest $request, $id)
    {
        $inputs = $request->all();

        $inputs['status'] = (int)$inputs['status'];
        $inputs['type'] = (int)$inputs['type'];

        $packageItems = [];

        if (isset($inputs['packageItems']) && !empty($inputs['packageItems'])){
            foreach ($inputs['packageItems'] as $dKey => $discount){   
                unset($inputs['packageItems'][$dKey]['$$hashKey']);
                if($inputs['type'] == 1)
                  $inputs['packageItems'][$dKey]['quantity'] = (int)$discount['quantity'];

                $pckgpro = [];
                foreach ($discount['products'] as $prokey => $provalue) {
                  unset($inputs['packageItems'][$dKey]['products'][$prokey]['$$hashKey']);
                  $inputs['packageItems'][$dKey]['products'][$prokey] = [
                    '_id' => $provalue['_id'],
                    'cprice' => (float)$provalue['cprice'],
                  ];
                }                

            }
        }        

        if(isset($inputs['recipe']) && !empty($inputs['recipe'])){
            foreach ($inputs['recipe'] as $rKey => $rVal){   
                unset($inputs['recipe'][$rKey]['$$hashKey']);            
            }            
        }        

        $package = Packages::find($id);

        if($package){          
          
          $existingproduct = (!empty($package->products))?$package->products:[];

          //CHECK IF Product IS REMOVED
          $removed = array_diff($existingproduct, $inputs['products']);
          if($removed){
            $rdealers = Products::whereIn('_id',$removed)->get();
            foreach ($rdealers as $rdkey => $rdvalue) {
              $rdvalue->pull('packages',$package->_id);
            }
          }

          //UPDATE PACKAGE          
          $update = $package->update($inputs);

          $pro = Products::whereIn('_id',$package->products)->get();

          //ADD packages IDS IN Products TABLE
          foreach ($pro as $dkey => $dvalue) {
            $dvalue->push('packages',$package->_id,true);
          }
          
          if(isset($inputs['image']) && !empty($inputs['image']))
            $this->saveImage($package,$inputs['image']);

          return response($package,201);
        }else{          
          return response('Unable to update package',422);
        }
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

    public function postListpackage(Request $request,$type){
        
        $params = $request->all();

        extract($params);

        $columns = ['_id','smallTitle','status'];

        $project = ['title'=>1,'status'=>1,'type'=>1];

        $project['smallTitle'] = ['$toLower' => '$title'];

        $query = [];
        
        $query[]['$project'] = $project;
        
        $query[]['$match']['type'] = (int)$type;        

        if(isset($name) && trim($name)!=''){
            $s = '/'.$name.'/i';
            $query[]['$match']['title'] = ['$regex'=>new \MongoRegex($s)];
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

        $model = Packages::raw()->aggregate($query);

        $iTotalRecords = count($model['result']);

        $query[]['$skip'] = (int)$start;

        if($length > 0){
            $query[]['$limit'] = (int)$length;
            $model = Packages::raw()->aggregate($query);
        }            

        $response = [
            'recordsTotal' => $iTotalRecords,
            'recordsFiltered' => $iTotalRecords,
            'draw' => $draw,
            'data' => $model['result']            
        ];

        return response($response,200);



        $params = $request->all();        

        extract($params);

        $packages = new Packages;

        $packages = $packages->where('type',(int)$type);

        if(isset($name) && trim($name)!=''){
            $sval = $name;
            $packages = $packages->where('title','regexp', "/.*$sval/i");
        }

        if(isset($status) && trim($status)!=''){            
            $packages = $packages->where('status',(int)$status);
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

        if(isset($file['thumb'])){
            $image = @$file['thumb'];
            $destinationPath = storage_path('packages');
            if (!File::exists($destinationPath)){
                File::MakeDirectory($destinationPath,0777, true);
            }
            $filename = $package->_id.'.'.$image->getClientOriginalExtension();
            $upload_success = $image->move($destinationPath, $filename);
            $package->coverImage = ['source'=>$filename];
            $package->save();
        }
    }

    public function getSearchproduct(Request $request){

      $params = $request->all();

      $settingObj = new Setting;

      $global = $settingObj->getSettings(array(
                  "key"=>'pricing',
                  "multiple"=>false
                ));

      $products = new Products;

      extract($params);      

      if(isset($qry) && trim($qry)!=''){        
        $products = $products->where('name','regexp', "/.*$qry/i");
      }     

      $iTotalRecords = $products->count();      
      
      $columns = ['name','_id','imageFiles','categories','price','regular_express_delivery'];

      /*$products = $products
      ->skip(0)
      ->take((int)$length);*/
      
      $products = $products->orderBy('created','desc');      

      $products = $products->get($columns);

      foreach($products as $key => $value) {
        $tier = $global->settings['regular_express_delivery'];
        if(isset($value->regular_express_delivery) && !empty($value->regular_express_delivery)){
          $tier = $value->regular_express_delivery;          
        }else{
          $categories = Categories::whereIn('_id',$value->categories)->get();
          if($categories){
            foreach ($categories as $ckey => $cvalue) {
              if(isset($cvalue->regular_express_delivery) && !empty($cvalue->regular_express_delivery)){
                $tier = $cvalue->regular_express_delivery;                
              }
            }
          }
        }
        $products[$key]['sale'] = Sale::raw()->findOne(['type'=>1,'saleProductId'=>['$eq'=>$value->_id]]);
        $products[$key]['sprice'] = $this->calculatePrice($value->price,$tier);                        
      }
      
      return response($products,200);
    }

    protected function calculatePrice($cost = 0, $tiers){
      if($tiers['type'] == 1){
        $p = $cost+($cost/100*$tiers['value']);
      }else{
        $p = $cost+$tiers['value'];
      }      
      return round($p,2);
    }

    protected function getProductById($id, $parray){
        $return = [];
        foreach ($parray as $key => $value) {
            if($value['_id'] == $id){
                $return = $value;
                break;
            }
        }
        return $return;
    }
}
