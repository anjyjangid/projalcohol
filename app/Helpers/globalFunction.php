<?php
	
	function pr($arr){
		
		echo "<pre>";
		print_r($arr);
		echo "</pre>";

	}

	function prd($arr){
		
		pr($arr);
		die;

	}


?>