<table width="100%" cellpadding="0" cellspacing="0">
<tbody>
@foreach($userMail['products'] as $products)

<tr style="float: left;width: 100%;background: #ffffff;border-bottom: 1px solid #d9d9d9;float: left;padding-bottom: 18px;width: 100%;">
	<td style="float: left;width: 70%;padding-left: 20px;margin-top: 18px;">
		<div style="border: 1px solid #d9d9d9;float: left;width: 70px;text-align: center;padding:5px">
			<img src="{{ asset('products/i/200/'.$products['cImage'][0]['source']) }}" style="max-width:70px;max-height:70px;">
		</div>
		<span style="color: #343538;float: left;font-size: 14px;font-weight: bold;margin-top: 5px;padding-left: 20px;width: 75%;">
			{{$products['name']}}
		</span>		
		@if(isset($products['proSales']) && !empty($products['proSales']))
		<span style="
		float: left;		
		text-align: center;
		margin-left: 20px;
		background: #ffc412;
		padding: 3px 6px;
		border-radius: 4px;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;		
		margin-top: 10px;
		">
			<a href="#" style="text-decoration: none;color: #000;">
				{{ $products['proSales']['listingTitle'] }}
			</a>
		</span>
		@endif
	</td>
	<td style="color: #37474f;float: right;font-size: 13px;font-weight: normal;margin-top: 10px;padding-right: 20px;text-align: right;text-decoration: line-through;width: 20%">		
		@if(isset($products['salePrice']))
			{{ $products['finalPrice'] }} <br> 
		@endif
		<span style="color: #aa00ff;font-size: 18px;font-weight: bold;text-decoration: none;margin-top: 5px;float: right;">
			@if(isset($products['salePrice']))
				{{ currency($products['salePrice']) }}
			@else
				{{ currency($products['finalPrice']) }}
			@endif	
		</span>
		<span style="float: right;		
		text-align: center;		
		background: #ffc412;		
		text-align: center;
		padding: 3px 6px;
		border-radius: 4px;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;
		text-decoration: none;		
		margin-top: 10px;
		clear: both;
		">
			<a href="{{url('/product/'.$products['slug'])}}" style="text-decoration: none;color: #000;">
				BUY
			</a>
		</span>
	</td>
</tr>
@endforeach		
</tbody>
</table>