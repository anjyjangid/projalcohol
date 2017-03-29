<?php
		
	function prd($arr){

		if(isLocal()){
			pr($arr);
			die;
		}

	}

	function jprd($arr){

		if(isLocal()){
	        header("Content-type: application/json");
			echo json_encode($arr);
			die;
		}

	}

	function jpr($arr){
		if(isLocal()){
			pr(json_encode($arr));
		}

	}

	function pr($arr){

		if(isLocal()){
			echo "<pre>";
			print_r($arr);
			echo "</pre>";
		}

	}
	
	function getUserName($user){

		if(isset($user['name'])){
			
			return $user['name'];

		}else{

			return $user['email'];
			
		}

	}

	function valueToKey($array,$key){

		$newArray = [];
		foreach($array as $value){
			
			$newArray[(string)$value[$key]] = $value;
		}

		return $newArray;

	}

	function isLocal () {

		if($_SERVER['REMOTE_ADDR']==='192.168.1.222'||$_SERVER['REMOTE_ADDR']==='192.168.1.103'){
			return true;
		}
		return false;
	}

	// Returns the next highest integer value by rounding up number if necessary. optional significance specifies the multiple
	// used initially for applying tread offer based smart quantity in purchase order
    function ceiling($number, $significance = 1) {
        return ( is_numeric($number) && is_numeric($significance) ) ? (ceil($number/$significance)*$significance) : false;
    }

    if (!function_exists('formatPrice')) {

	    /**
	     * Format integer to a price
	     *
	     * @param integer $price
	     *
	     * @return string
	     */
	    function formatPrice($price,$showFree = 1)
	    {
	        // Do your necessary logic
	        if($price == 0 && $showFree)
	        	return 'FREE';
	        else
	    		return number_format( $price, 2 );	        
	    }
	}

	function currency($value,$sign = "$"){
		return $sign.money_format('%.2n', $value);
	}

	// Function to get singapore time which is +8 hours from GMT
	function getServerTime ($type = 'str') {

		$sgtTimeStamp = strtotime("+8 hours");

		switch ($type) {

			case 'date':
				$sgtTimeStamp = date('Y-m-d',$sgtTimeStamp);
				break;

			case 'datetime':
				$sgtTimeStamp = date('Y-m-d H:i:s',$sgtTimeStamp);
				break;

		}

		return $sgtTimeStamp;

	}

	function getTodayDayNumber() {
		return date('N', getServerTime());
	}

?>