<?php
		
	function prd($arr){
		
		pr($arr);
		die;

	}

	function jprd($arr){

        header("Content-type: application/json");
		echo json_encode($arr);
		die;

	}

	function jpr($arr){

		pr(json_encode($arr));

	}

	function pr($arr){
		
		echo "<pre>";
		print_r($arr);
		echo "</pre>";

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

?>