<?php

namespace AlcoholDelivery;

use Illuminate\Database\Eloquent\Model;

use AlcoholDelivery\User;
use GuzzleHttp\Client;
use DB;

class Payment extends Model
{
 	public $apiLive = false;
 	public $tokenUrl;
 	public $paymentUrl;
	public $secretKey;
	public $merchantId;
	public $currencyCode = 'USD'; 	/*SGD, USD, IDR, CNY, THB, VND*/
	public $transactionType = 'Sale';
	public $key;
	public $returnUrl;
	public $notificationUrl;	

 	public function __construct()
 	{
 		if((bool)$this->apiLive === true){  
 			//LIVE
 			$this->tokenUrl = 'https://secure.reddotpayment.com/service/tokenization-api/create';//'https://connect.reddotpayment.com/service/tokenization-api/create'; 			
			$this->notificationUrl = '';
 			$this->secretKey = 'oUGgs0nAa6E99EVEgjJZiPWzJctqhNzIAsfHgnSMlrKZM71gKfBIt44i19Wrgl3sjjWrKnJI9QDD4LaoNQrVDV3oeb1czTTkGLI88u3WAavFiKpDuu41K2Nxa7np4fpb'; 			
 			$this->merchantId = '0000021925';
 			$this->key = 'axpnrAsGCwVxbpdJM6YhVX3QK0fOhEiOPG10AWxq';
 			$this->paymentUrl = 'https://connect.reddotpayment.com/merchant/cgi-bin-live';
			$this->returnUrl = '';
 		}else{ 
 			//TEST
 			$this->tokenUrl = 'http://test.reddotpayment.com/service/tokenization-api/create'; 			
			$this->notificationUrl = '';
 			$this->secretKey = 'jMAb6rYoBPF96dacwGe9tCLYpnhYglkFBKPH4LbT8mKQi2IhOyIhWSmZBvlFjlshAyFPi3NrYGTKV35sLVrDekX5y5FxWSv2XKkcFvbGaafuj93rFoRT69FRKKpaBner'; 			
 			$this->merchantId = '1000089464';
 			$this->key = 'r5f3ZLs8FRbhMnv7AaeQwvgkmHoDw9pKFAriTEFh';
 			$this->paymentUrl = 'http://test.reddotpayment.com/merchant/cgi-bin';
			$this->returnUrl = '';
 		}
 	}   

 	public function saveCard($request,$user,$saveUser){        
 		$ret = [];
 		$expiryDate = strtotime($request['year'].'-'.$request['month'].'-1');
 		$expiryDate = date('m',$expiryDate).''.date('Y',$expiryDate); 		
 		$request['number'] = str_replace(' ', '', $request['number']);
        
        //USE OF CVV
        if(false)//if($this->apiLive)
            $request['number'] .= $request['cvc'];        

 		$request_params = array(
            'mid' => $this->merchantId,
            'card_no' => $request['number'],
            'exp_date' => $expiryDate,
            'payer_name' => $request['name'],
            'payer_email' => $user->email,
            'mode' => 2,      
        );
        $request_params['signature'] = $this->signRequest($request_params);        
        $json_request = json_encode($request_params);
        $response = $this->sendRequest($json_request,$this->tokenUrl);    
        $response_array = json_decode($response, true);
        $ret = $response_array;

        if(!empty($response_array) && isset($response_array['token_id'])){
            $type = (isset($request['type']))?$request['type']:'visa';
        	$cardInfo = ['token_id' => $response_array['token_id'],'type' => $type];        	
            if($saveUser){
                $u = User::find($user->_id);
    			$u = $u->push('savedCards',$cardInfo,true);                
			    $ret['user'] = User::find($user->_id);
            }else{
                $ret['card'] = $cardInfo;
            }
            $ret['success'] = true;         
        }else{
        	$ret['success'] = false;
        }
    
        return $ret;
 	}


 	public function signRequest($params) {
        unset($params['signature']);
        ksort($params);
        $data_to_sign = "";
        foreach ($params as $v) {
        	$data_to_sign .= $v;
        }
        $data_to_sign .= $this->secretKey;
        return hash('sha512', $data_to_sign);
    }

    public function sendRequest($json_request,$url) {        
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

    public function removeCard($request,$user){
		$ret = ['success'=>false];
		$cardInfo = ['token_id' => $request['token_id']];
    	$u = User::find($user->_id);
		if($u->pull('savedCards',$cardInfo)){
            $ret['success'] = true;
        }
		$ret['user'] = User::find($user->_id);
		return $ret;    	
    }

    public function prepareform($orderData, $userData, $isAdmin = false){

        $uprefix = '';

        if($isAdmin)
            $uprefix = '/adminapi/order';

        $request_transaction = array(
            'order_number' => $orderData['reference'],
            'email' => $userData->email,
            'amount' => $orderData['payment']['total'],
            'merchant_id' => $this->merchantId,
            'currency_code' => $this->currencyCode,
            'transaction_type' => $this->transactionType,
            'key' => $this->key,
            'token_id'=> $orderData['payment']['creditCard']['token_id'],            
            'return_url' => url().$uprefix.'/confirmorder',            
            'merchant_data1' => $orderData['_id']
            //'notify_url' => url().'/confirmorder', //FOR SAFE PAYMENTS
        );


        $chosenFields = array_keys($request_transaction);
        sort($chosenFields);

        $requestsString = '';
        foreach ($chosenFields as $field) {
          if (isset($request_transaction[$field])) {
            $requestsString .= $field . '=' . ($request_transaction[$field]) .'&';
          }
        }

        $requestsString .= 'secret_key=' . $this->secretKey;

        $request_transaction['signature'] = md5($requestsString);

        return ['formAction'=>$this->paymentUrl,'formData'=>$request_transaction];

    }

    public function validateresponse($rdp_response){

        $rdp_signature = $rdp_response['signature'];

        unset($rdp_response['signature']);

        ksort($rdp_response);

        $string_to_hash = ''; 
        
        foreach ($rdp_response as $key=>$value){ 
            $string_to_hash .= $key. '=' . ($value) . '&';
        }       
        
        $string_to_hash .= 'secret_key=' . $this->secretKey; 

        $merchant_calculated_signature = md5($string_to_hash);

        //VALDATE THAT THE REQUEST IS FROM RDP
        return ($merchant_calculated_signature == $rdp_signature);        

    }
    
}
