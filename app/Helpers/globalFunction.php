<?php
		
	function prd($arr){
		
		pr(json_encode($arr));
		die;

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

?>