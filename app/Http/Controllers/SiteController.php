<?php

namespace AlcoholDelivery\Http\Controllers;

use Illuminate\Http\Request;

use AlcoholDelivery\Http\Requests;
use AlcoholDelivery\Http\Requests\QueryRequest;
use AlcoholDelivery\Http\Controllers\Controller;
use AlcoholDelivery\Products;
use AlcoholDelivery\User;
use AlcoholDelivery\Email;
use DateTime;
use Mail;

class SiteController extends Controller
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
        //
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

    public function getSearch(Request $request,$keyword){        
        
        $products = new Products;

        $query = [];

        $query[]['$match'] = [
            "categoriesObject" => [ '$exists' => true ],
            "status" => 1
        ];       

        $query[]['$project'] = [
            'chilled' => 1,
            'description' =>  1,
            'price' => [
                '$multiply' => [ '$price', 1 ]
            ],
            'categories' => 1,
            'categoriesObject'=>1,
            // 'discountPrice' => 1,
            'imageFiles' => 1,
            'name' => 1,
            'slug' => 1,
            'shortDescription' => 1,
            'sku' => 1,
            'quantity' => 1,
            'regular_express_delivery' => 1,
            'express_delivery' => 1,
            'express_delivery_bulk' => 1,
            'outOfStockType' => 1,
            // 'maxQuantity' => 1,
            'availabilityDays' => 1,
            'availabilityTime' => 1,
            'catParent' => ['$arrayElemAt'=> [ '$categoriesObject', 0 ]],
            'catSubParent' => ['$arrayElemAt'=> [ '$categoriesObject', -1 ]],
            'parentCategory' => 1,
            'childCategory' => 1
        ];

        $query[]['$lookup'] = [
            'from' => 'categories',
            'localField' => 'catParent',
            'foreignField' => '_id', 
            'as' => 'parentCategory'
        ];

        $query[]['$lookup'] = [
            'from' => 'categories',
            'localField' => 'catSubParent',
            'foreignField' => '_id', 
            'as' => 'childCategory'            
        ];

        $query[]['$unwind'] = [
            'path' => '$parentCategory',
            'preserveNullAndEmptyArrays' => true
        ];

        $query[]['$unwind'] = [
            'path' => '$childCategory',
            'preserveNullAndEmptyArrays' => true
        ];

        if(isset($keyword) && !empty($keyword)){
            $s = "/".$keyword."/i";
            
            $query[]['$match']['$or'] = [
                ['name' => ['$regex'=>new \MongoRegex($s)]],
                ['parentCategory.cat_title' => ['$regex'=>new \MongoRegex($s)]],
                ['childCategory.cat_title' => ['$regex'=>new \MongoRegex($s)]]
            ];    
        }

        $query[]['$match'] = [
            'parentCategory.cat_status' => 1            
        ];

        $query[]['$match'] = [
            'childCategory.cat_status' => 1
        ];

        $query[]['$skip'] = 0;
        $query[]['$limit'] = 10;

        $products = Products::raw()->aggregate($query);

        if(isset($products['result'])){
            return response($products['result'],200);
        }else{
            return response([],200);
        }

        if(isset($keyword) && trim($keyword)!=''){            
            $products = $products->where('name','regexp', "/.*$keyword/i")->where('status',1);
        }

        $products = $products->skip(0)->take(10)->get();        

        return response($products,200);
    }

    public function getSearchlist(Request $request){
        
        $params = $request->all();

        extract($params);    

        $products = new Products;

        $products = $products->where('status',1);

        if(isset($keyword) && trim($keyword)!=''){            
            $products = $products->where('name','regexp', "/.*$keyword/i");
        }

        if(isset($loyalty) && $loyalty){
            $products = $products->where('isLoyalty',1);
        }

        if(isset($filter) && trim($filter)!=''){

            switch ($filter) {
                case 'new':
                    $products = $products->where('created_at', '>', new DateTime('-1 months'));
                    break;
                case 'in-stock':
                    $products = $products->where('quantity','>',0);
                    break;
                default:
                    # code...
                    break;
            }
        }

        if(isset($sortby) && trim($sortby)!=''){
            $products = $products->orderBy('price', $sortby);
        }else{
            $products = $products->orderBy('created_at','desc');
        }

        $totalItem = $products->count();
        
        $fields = ['availabilityDays','availabilityTime','categories','chilled','deliveryType','description','express_delivery_bulk.bulk','imageFiles','isLoyalty','loyalty','loyaltyType','metaDescription','metaKeywords','metaTitle','name','outOfStockType','price','quantity','regular_express_delivery','shortDescription','slug'];


        $products = $products->skip($skip)->take($take)->get($fields);
        
        $response = [
            'items' => $products,
            'total' => $totalItem,
        ];

        return response($response,200);
    }

    public function getApicheck(Request $request){

        $secret_key = 'jMAb6rYoBPF96dacwGe9tCLYpnhYglkFBKPH4LbT8mKQi2IhOyIhWSmZBvlFjlshAyFPi3NrYGTKV35sLVrDekX5y5FxWSv2XKkcFvbGaafuj93rFoRT69FRKKpaBner';

        $request_params = array(
            'mid' => '1000089464',
            'card_no' => '4111111111111111',
            'exp_date' => '112019',
            'payer_name' => 'test',
            'payer_email' => 'test@reddotpayment.com',
            'mode' => 2,      
        );

        $request_params ['signature'] = $this->sign($secret_key, $request_params);
        
        $json_request = json_encode($request_params);

        $response = $this->post($json_request);    

        $response_array = json_decode($response, true);

        return response($response_array);

        $calculated_signature = $this->sign($secret_key, $request_params);

        $is_valid_response = ($calculated_signature == $response_array['signature']);

        if ($is_valid_response) {
              // proceed business flow
              if ($response_array['response_code'] == '0') {
                    //proceed to success creation
               }
               else {
                    //proceed to failed creation
               }
        }
        else {
              // proceed to invalid handling
        }

        return response($response_array,200);

    }

    public function sign($secret_key, $params) {
        unset($params['signature']);
        ksort($params);
        $data_to_sign = "";
        foreach ($params as $v) {
                       $data_to_sign .= $v;
        }
        $data_to_sign .= $secret_key;
        return hash('sha512', $data_to_sign);
    }

    public function post($json_request,$url = 'http://test.reddotpayment.com/service/tokenization-api/create') {
        // $url = "http://test.reddotpayment.com/service/Payment_processor";
        //$url = "http://test.reddotpayment.com/service/tokenization-api/create";
        // $url = "https://secure-dev.reddotpayment.com/service/payment-api";
        $curl = curl_init($url);
        curl_setopt_array($curl, array(
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_POST => 1,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_POSTFIELDS => $json_request,
            CURLOPT_HTTPHEADER =>
                 array('Content-Type: application/json')
        ));
        $response = curl_exec($curl);
        $curl_errno = curl_errno($curl);
        $curl_err = curl_error($curl);
        curl_close($curl);
        return $response;
    }

    public function getPayment(Request $request){
        
        $secret_key = 'jMAb6rYoBPF96dacwGe9tCLYpnhYglkFBKPH4LbT8mKQi2IhOyIhWSmZBvlFjlshAyFPi3NrYGTKV35sLVrDekX5y5FxWSv2XKkcFvbGaafuj93rFoRT69FRKKpaBner';        
        
        $request_transaction = array(
            "order_number" => "ABC123",
            "email" => "test@reddotpayment.com",
            "amount" => "1.00",
            "merchant_id" => "1000089464",
            "currency_code" => "SGD",
            "transaction_type" => "Sale",
            "key" => "r5f3ZLs8FRbhMnv7AaeQwvgkmHoDw9pKFAriTEFh",
            "token_id"=> "8417241649611117",            
            "return_url" => "http://192.168.1.174:8080/site/payres",            
        );


        $chosenFields = array_keys($request_transaction);
        sort($chosenFields);

        $requestsString = '';
        foreach ($chosenFields as $field) {
          if (isset($request_transaction[$field])) {
            $requestsString .= $field . '=' . ($request_transaction[$field]) .'&';
          }
        }

        $requestsString .= 'secret_key=' . $secret_key;

        $request_transaction['signature'] = md5($requestsString);
        
        dd($request_transaction);                
        
    }

    public function getPayres(Request $response){        

        $rdp_response = $response->all();

        $rdp_signature = $rdp_response['signature'];

        unset($rdp_response['signature']);

        ksort($rdp_response);

        $string_to_hash = ''; 
        
        foreach ($rdp_response as $key=>$value){ 
            $string_to_hash .= $key. '=' . ($value) . '&';
        }

        $secret_key = 'jMAb6rYoBPF96dacwGe9tCLYpnhYglkFBKPH4LbT8mKQi2IhOyIhWSmZBvlFjlshAyFPi3NrYGTKV35sLVrDekX5y5FxWSv2XKkcFvbGaafuj93rFoRT69FRKKpaBner';
        
        $string_to_hash .= 'secret_key=' . $secret_key; 

        $merchant_calculated_signature = md5($string_to_hash);

        //VALDATE THAT THE REQUEST IS FROM RDP
        $is_really_from_rdp = ($merchant_calculated_signature == $rdp_signature);

        if($is_really_from_rdp){
            echo 'VALID RESPONSE';               
        }
        else{
            echo 'INVALID RESPONSE';                
        }
        
        return dd($response->all());

    }

    public function postQuery(QueryRequest $request){

        $postData = $request->all();        

        switch ($postData['type']) {
            case 'contact-us':
                $subject = 'Query from '.$postData['name'].':'.$postData['subject'];                
                break;
            case 'bulkcorporate-discounts':
                $subject = 'Bulk / Corporate request from '.$postData['name'];                
                break;
            case 'event-planner':
                $subject = 'Event & services request from '.$postData['name'];                
                break;
            case 'suggest-a-product':
                $subject = 'Product suggestion query received';                
                break;            
            default:
                $subject = 'No subject';
                break;
        }

        $req = $postData;

        unset($req['type']);

        $content = '<div><p></p>';

        foreach ($req as $fieldLabel => $fieldValue) {
            $fieldLabel = preg_replace(array('/(?<=[^A-Z])([A-Z])/', '/(?<=[^0-9])([0-9])/'), ' $0', $fieldLabel);
            $fieldLabel = ucwords($fieldLabel);  

            $content .= '<p><b>'.$fieldLabel.'</b> : '.$fieldValue.'</p>';
            $content .= '<p></p>';
        }        

        $content .= '</div>';       

        $mail = new Email('customtemplate');

        $mdata = [
            'email' => 'sales@alcoholdelivery.com.sg',
            'name' => 'Admin',
            'message' => $content,
            'subject' => $subject
        ];

        $mailsent = $mail->sendEmail($mdata);

        if(!is_array($mailsent))
            return response(['mailsent' => 1],200);
        else
            return response($mailsent,422);

    }

    public function getSearchLocation(Request $request){

        // sleep(20);

        $q = $request->get('q');

        $user = new User;

        $user = $user->searchLocation($q);        

        return response($user,200);

    }
}


