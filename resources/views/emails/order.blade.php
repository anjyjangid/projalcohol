<table width="100%">
<tbody>

<?php foreach($particulars as $product){?>
<tr style="float: left;width: 100%;background: #ffffff;border-bottom: 1px solid #d9d9d9;float: left;padding-bottom: 18px;width: 100%;">

	<td style="padding-left: 20px;margin-top: 18px;">

		<?php if($product['category'] == 'saleproduct' && count($product['products'])){?>
			<?php foreach($product['products'] as $sPro){?>
				<?php for($i=0;$i<$sPro['quantity'];$i++){?>
					<img alt="{{$sPro['name']}}" src="{{asset('products/i/200/'.$sPro['coverImage'])}}" style="border: 1px solid #d9d9d9;float: left;max-width:73px;max-height:73px;margin-right:10px">
				<?php }?>
			<?php }?>
		<?php }?>

		<?php if($product['category'] != 'saleproduct' && $product['category'] !='loyaltycard'){?>
		<div style="width:73px;height:73px;float:left">
			<img alt="{{$product['name']}}" src="{{asset('products/i/200/'.$product['coverImage'])}}" style="border: 1px solid #d9d9d9;float: left;max-width:73px;max-height:73px">
		</div>
		<?php }?>
		<div style="float:left">
			<span style="color: #343538;float: left;font-size: 14px;font-weight: bold;margin-top: 5px;padding-left: 20px;width: 75%;">{{ isset($product['detailTitle'])?$product['detailTitle']:$product['name']}}</span>

			<?php if(isset($product['sale']) && is_array($product['sale'])){?>
			<span style="float: left;color: #000000;text-align: center;width: 100%;">
				<a href="#" style="background: #ffc412;color: #000000;text-align: center;padding: 3px 6px;border-radius: 4px;-webkit-border-radius: 4px;-moz-border-radius: 4px;text-decoration: none;float: left;margin-top: 10px;">{{$product['sale']['detailTitle']}}</a>
			</span>
			<?php }?>
		</div>

	</td>
	
	<td width="50px">{{$product['quantity']}}</td>

	<?php if(!isset($product['totalLoyalty'])){?>
		<td width="50px" style="color: #37474f;font-size: 13px;font-weight: normal;padding-right: 20px;text-align: right;text-decoration: line-through">

				<?/* ${{$product['total']}} */?>
				<br> <span style="color: #aa00ff;font-size: 18px;font-weight: bold;text-decoration: none;margin-top: 5px;float: right;">${{$product['total']>0?$product['total']:'FREE'}}</span>
		</td>
	<?php }else{?>
		<td width="50px" style="color: #37474f;font-size: 13px;font-weight: normal;padding-right: 20px;text-align: right;text-decoration: line-through"><span style="color: #aa00ff;font-size: 18px;font-weight: bold;text-decoration: none;margin-top: 5px;float: right;">LP&nbsp{{$product['totalLoyalty']}}</span>
		</td>
	<?php }?>

</tr>
<?php }?>
</tbody>
</table>