<!DOCTYPE html>
<html>
<head>
	<title>Address</title>	
</head>
<body>
	<table width="100%" border="1">		
	<tr>
		<th>#</th>
		<th>ID</th>
		<th>EMAIL</th>
		<th>HOUSE</th>
		<th>ADDRESS</th>
		<th>POSTAL</th>
	</tr>
	<?php foreach ($addresslist['result'] as $key => $value) {?>
	<tr>
		<td>
			{{$key+1}}
		</td>
		<td>
			{{ (string)$value['_id'] }}
		</td>
		<td>
			{{ (string)$value['email'] }}
		</td>
		<td>
			{{ @$value['address']['house'] }}
		</td>
		<td>
			{{ @$value['address']['HBRN'] }}
		</td>
		<td>
			{{ @$value['address']['PostalCode'] }}
		</td>
	</tr>	
	<?php }?>
	</table>	
</body>
</html>