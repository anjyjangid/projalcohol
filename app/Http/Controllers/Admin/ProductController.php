<?php

namespace AlcoholDelivery\Http\Controllers\Admin;

use Illuminate\Http\Request;
use File;
use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\ProductRequest;
use AlcoholDelivery\Http\Controllers\Controller;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

use AlcoholDelivery\Categories as Categories;
use AlcoholDelivery\Products;
use AlcoholDelivery\User;
use AlcoholDelivery\Dealer;
use MongoId;
use Input;
use DB;
use AlcoholDelivery\Setting;


class ProductController extends Controller
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
    public function store(ProductRequest $request)
    {    
        
        $inputs = $request->all();

        //prd($inputs);

        $inputs['quantity'] = (int)$inputs['quantity'];
        $inputs['price'] = (float)$inputs['price'];        
        $inputs['chilled'] = (int)$inputs['chilled'];
        $inputs['status'] = (int)$inputs['status'];
        $inputs['isFeatured'] = (int)$inputs['isFeatured'];
        $inputs['threshold'] = (int)$inputs['threshold'];
        $inputs['maxQuantity'] = (int)$inputs['maxQuantity'];       

        if (isset($inputs['advance_order_bulk']['bulk']) && !empty($inputs['advance_order_bulk']['bulk']))
        {
            foreach ($inputs['advance_order_bulk']['bulk'] as $dKey => $discount)
            {
                unset($inputs['advance_order_bulk']['bulk'][$dKey]['$$hashKey']);
                $inputs['advance_order_bulk']['bulk'][$dKey] = [
                  'from_qty' => (int)$discount['from_qty'],
                  'to_qty' => (int)$discount['to_qty'],
                  'type' => (int)$discount['type'],
                  'value' => (float)$discount['value'],
                ];                                
            }
        }

        if (isset($inputs['express_delivery_bulk']['bulk']) && !empty($inputs['express_delivery_bulk']['bulk']))
        {
            foreach ($inputs['express_delivery_bulk']['bulk'] as $dKey => $discount)
            {
                unset($inputs['express_delivery_bulk']['bulk'][$dKey]['$$hashKey']);
                $inputs['express_delivery_bulk']['bulk'][$dKey] = [
                  'from_qty' => (int)$discount['from_qty'],
                  'to_qty' => (int)$discount['to_qty'],
                  'type' => (int)$discount['type'],
                  'value' => (float)$discount['value'],
                ];                                
            }
        }

        $inputs['bulkDisable'] = (int)($inputs['bulkDisable']);

        $inputs['loyalty'] = (int)($inputs['loyalty']);

        if (isset($inputs['advance_order']['value']) && !empty($inputs['advance_order']['value'])){
              $inputs['advance_order']['value'] = (float)$inputs['advance_order']['value'];
        }

        if (isset($inputs['regular_express_delivery']['value']) && !empty($inputs['regular_express_delivery']['value'])){
              $inputs['regular_express_delivery']['value'] = (float)$inputs['regular_express_delivery']['value'];
        }

        $product = Products::create($inputs);            

        if($product){
          
          $dealers = Dealer::whereIn('_id',$product->dealers)->get();

          //ADD PRODUCT IDS IN DEALERS TABLE
          foreach ($dealers as $dkey => $dvalue) {
            $dvalue->push('products',$product->_id,true);
          }

          $files = $inputs['imageFiles'];
          
          $this->saveImages($product,$files);
          
          return $product;

        }else{          
          return response('Unable to add product',422);
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
        $galleryObj = new Products;
        return $galleryObj->getSingleProduct($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(ProductRequest $request, $id)
    {
        $inputs = $request->all();
        
        $inputs['quantity'] = (int)$inputs['quantity'];
        $inputs['price'] = (float)$inputs['price'];        
        $inputs['chilled'] = (int)$inputs['chilled'];
        $inputs['status'] = (int)$inputs['status'];
        $inputs['isFeatured'] = (int)$inputs['isFeatured'];    
        $inputs['threshold'] = (int)$inputs['threshold'];
        $inputs['maxQuantity'] = (int)$inputs['maxQuantity'];   

        $unset = [];

        if (isset($inputs['advance_order_bulk']['bulk']) && !empty($inputs['advance_order_bulk']['bulk']))
        {
            foreach ($inputs['advance_order_bulk']['bulk'] as $dKey => $discount)
            {
                unset($inputs['advance_order_bulk']['bulk'][$dKey]['$$hashKey']);
                $inputs['advance_order_bulk']['bulk'][$dKey] = [
                  'from_qty' => (int)$discount['from_qty'],
                  'to_qty' => (int)$discount['to_qty'],
                  'type' => (int)$discount['type'],
                  'value' => (float)$discount['value'],
                ];                                
            }
        }else{
            $unset[] = 'advance_order_bulk';
        }

        if (isset($inputs['express_delivery_bulk']['bulk']) && !empty($inputs['express_delivery_bulk']['bulk']))
        {
            foreach ($inputs['express_delivery_bulk']['bulk'] as $dKey => $discount)
            {
                unset($inputs['express_delivery_bulk']['bulk'][$dKey]['$$hashKey']);
                $inputs['express_delivery_bulk']['bulk'][$dKey] = [
                  'from_qty' => (int)$discount['from_qty'],
                  'to_qty' => (int)$discount['to_qty'],
                  'type' => (int)$discount['type'],
                  'value' => (float)$discount['value'],
                ];                                
            }
        }else{
            $unset[] = 'express_delivery_bulk';
        }

        $inputs['bulkDisable'] = (int)($inputs['bulkDisable']);

        $inputs['loyalty'] = (int)($inputs['loyalty']);

        if (isset($inputs['advance_order']['value']) && !empty($inputs['advance_order']['value'])){
              $inputs['advance_order']['value'] = (float)$inputs['advance_order']['value'];
        }else{
            $unset[] = 'advance_order';
        }

        if (isset($inputs['regular_express_delivery']['value']) && !empty($inputs['regular_express_delivery']['value'])){
              $inputs['regular_express_delivery']['value'] = (float)$inputs['regular_express_delivery']['value'];
        }else{
            $unset[] = 'regular_express_delivery';
        }

        $product = Products::find($id);

        if($product){          
          
          $files = $inputs['imageFiles'];

          $existingdealer = (!empty($product->dealers))?$product->dealers:[];

          //CHECK IF DEALER IS REMOVED
          $removed = array_diff($existingdealer, $inputs['dealers']);
          if($removed){
            $rdealers = Dealer::whereIn('_id',$removed)->get();
            foreach ($rdealers as $rdkey => $rdvalue) {
              $rdvalue->pull('products',$product->_id);
            }
          }

          //UPDATE PRODUCT          
          $update = $product->update($inputs);

          $dealers = Dealer::whereIn('_id',$product->dealers)->get();

          //ADD PRODUCT IDS IN DEALERS TABLE
          foreach ($dealers as $dkey => $dvalue) {
            $dvalue->push('products',$product->_id,true);
          }          

          //UNSET THE PRICING IF EXISTS AND NOT SET
          foreach ($unset as $key => $value) {
            $product->unset($value);
          }   

          $this->saveImages($product,$files);
        }

        return response($product);
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


    public function productlist(Request $request){   

        $params = $request->all();

        $columns = array('_id','','name','categories','price','status','isFeatured');

        $products = new Products;

        if(isset($params['name']) && trim($params['name'])!=''){
          $pname = $params['name'];
          $products = $products->where('name','regexp', "/.*$pname/i");
        }

        if(isset($params['categories']) && trim($params['categories'])!=''){          
          $products = $products->where('categories',$params['categories']);
        }

        if(isset($params['status']) && trim($params['status'])!=''){
          $products = $products->where('status',(int)$params['status']);
        }

        if(isset($params['isFeatured']) && trim($params['isFeatured'])!=''){
          $products = $products->where('isFeatured',(int)$params['isFeatured']);
        }

        $iTotalRecords = $products->count();
        $iDisplayLength = intval($_REQUEST['length']);
        $iDisplayLength = $iDisplayLength < 0 ? $iTotalRecords : $iDisplayLength; 
        $iDisplayStart = intval($_REQUEST['start']);
        $sEcho = intval($_REQUEST['draw']);

        $records = array();
        $records["data"] = array(); 

        $end = $iDisplayStart + $iDisplayLength;
        $end = $end > $iTotalRecords ? $iTotalRecords : $end;

        $status_list = array(            
            array("info" => "Not Published"),            
            array("success" => "Published"),
        );

        $fstatus = [['success'=>'No'],['info'=>'Yes']];

        $notordered = true;

        if ( isset( $params['order'] ) ){

            foreach($params['order'] as $orderKey=>$orderField){

                if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                    $ordered = false;                    
                    $products = $products->orderBy($columns[$orderField['column']],$orderField['dir']);
                    
                }
            }

        }  

        if($notordered){
          $products = $products->orderBy('created_at','desc');
        }

        $products = $products->skip($iDisplayStart)        
        ->take($iDisplayLength)->get();

        $ids = $iDisplayStart;

        foreach($products as $i => $product) {
            $status = $status_list[$product->status];
            $isFeatured  = $fstatus[$product->isFeatured];            
            $ids += 1;
            
            $categories = Categories::whereIn('_id', $product->categories)->get();

            $cname = [];
            foreach ($categories as $key => $value) {                
              $cname[] = $value->cat_title;                
            }

            $records["data"][] = array(
              '<input type="checkbox" name="id[]" value="'.$product->_id.'">',
              $ids,
              $product->name,
              implode(', ', $cname),
              $product->price,      
              '<span class="label label-sm label-'.(key($status)).'">'.(current($status)).'</span>',
              '<span class="label label-sm label-'.(key($isFeatured)).'">'.(current($isFeatured)).'</span>',
              $product->quantity,
              '<a href="#/product/edit/'.$product->_id.'" class="btn btn-xs default btn-editable"><i class="fa fa-pencil"></i> Edit</a>'
              
            );
        }

        if (isset($_REQUEST["customActionType"]) && $_REQUEST["customActionType"] == "group_action") {
            $records["customActionStatus"] = "OK"; // pass custom message(useful for getting status of group actions)
            $records["customActionMessage"] = "Group action successfully has been completed. Well done!"; // pass custom message(useful for getting status of group actions)
        }
        $records["draw"] = $sEcho;
        $records["recordsTotal"] = $iTotalRecords;
        $records["recordsFiltered"] = $iTotalRecords; 

        return response($records);
    }

    protected function saveImages($product,$files){

      if($product){
            $filearr = [];
            foreach ($files as $key => $file) {
                $image = @$file['thumb']; 

                if($image){

                    $destinationPath = storage_path('products');
                    $filename = $product->_id.'_'.$key.'.'.$image->getClientOriginalExtension();
                    
                    if (!File::exists($destinationPath.'/200')){
                        File::MakeDirectory($destinationPath.'/200',0777, true);
                    }
                    if (!File::exists($destinationPath.'/400')){
                        File::MakeDirectory($destinationPath.'/400/',0777, true);
                    }

                    Image::make($image)->resize(400, null, function ($constraint) {
                        $constraint->aspectRatio();
                    })->save($destinationPath.'/400/'.$filename);

                    Image::make($image)->resize(200, null, function ($constraint) {
                        $constraint->aspectRatio();
                    })->save($destinationPath.'/200/'.$filename);

                    $upload_success = $image->move($destinationPath, $filename);  

                }else{
                  $filename = @$file['source'];
                }

                $cover = (int)@$file['coverimage'];

                $filearr[] = [
                    'source' => $filename,
                    'label' => @$file['label'],
                    'order' => @$file['order'],
                    'coverimage' => $cover,
                ];
            }

            if(!empty($filearr)){
                $product->imageFiles = $filearr;
                $product->save();
            }
        }

    }

    public function orderProduct(Request $request){

      $params = $request->all();

      $products = new Products;

      extract($params);      

      if(isset($params['search']['value']) && trim($params['search']['value'])!=''){
        $sval = $params['search']['value'];
        $products = $products->where('name','regexp', "/.*$sval/i");
      }

      //$products = $products->where('dealers','all',['56ed55ecc31d53b2218b4568']);

      $iTotalRecords = $products->count();      
      
      $columns = ['name','quantity','maxQuantity','threshold','_id'];

      $notordered = true;
      if ( isset( $params['order'] ) ){
          foreach($params['order'] as $orderKey=>$orderField){
              if ( $params['columns'][intval($orderField['column'])]['orderable'] === "true" ){
                  $notordered = false;                    
                  $products = $products->orderBy($columns[$orderField['column']],$orderField['dir']);                    
              }
          }
      }

      $products = $products
      ->skip((int)$start)
      ->take((int)$length);

      if($notordered){
        $products = $products->orderBy('quantity','asc')->orderBy('threshold','asc')->orderBy('maxQuantity','asc');
      }

      $products = $products->get($columns);
      
      $response = [
        'recordsTotal' => $iTotalRecords,
        'recordsFiltered' => $iTotalRecords,
        'draw' => $draw,
        'length' => $length,
        'aaData' => $products
      ];
      
      return response($response,200);
    }

    public function searchProduct(Request $request){

      $params = $request->all();

      $settingObj = new Setting;

      $global = $settingObj->getSettings(array(
                  "key"=>'pricing',
                  "multiple"=>false
                ));

      $products = new products;

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
     
}
    