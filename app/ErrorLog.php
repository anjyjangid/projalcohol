<?php

namespace AlcoholDelivery;

use Illuminate\Support\Facades\Log;

class ErrorLog
{
	public static function create ($type,$params = []) {

		if(isset($params['error']) && is_object($params['error'])){

			$e = $params['error'];

			$error = [
				'File'=>$e->getFile(),
				'Line'=>$e->getLine(),
				'Message'=>$e->getMessage()
			];
			
		}

		switch ($type) {
			case 'emergency':
				Log::emergency($params['message'],$error);
				break;
			case 'alert':
				Log::alert($params['message'],$error);
				break;
			case 'critical':
				Log::critical($params['message'],$error);
				break;
			case 'error':
				Log::error($params['message'],$error);
				break;
			case 'notice':
				Log::notice($params['message'],$error);
				break;
			case 'info':
				Log::info($params['message'],$error);
				break;
			case 'debug':
				Log::debug($params['message'],$error);
				break;			
			default:
				Log::warning($params['message'],$error);
				break;
		}

		


	}
}