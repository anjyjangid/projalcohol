<table width="100%" cellpadding="0" cellspacing="0">
<tbody>

<tr style="float: left;width: 100%;background: #ffffff;border-bottom: 1px solid #d9d9d9; padding-bottom: 10px;">
	<td style="float: left;width: 45%;padding-left: 20px;text-align: left;font-family: 14px;color: #343538;">List of item ordered</td>
	<td style="float: right;width: 45%;padding-right: 20px;text-align: right;font-family: 14px;color: #343538;">Order number: {{$order['reference']}}</td>
</tr>

<!-- Products Starts -->

{!! showProducts($order) !!}
{!! showSales($order) !!}
{!! showPackages($order) !!}

{!! showLoyalty($order) !!}
{!! showLoyaltyCards($order) !!}
{!! showGiftCards($order) !!}
{!! showPromotion($order) !!}

<!-- Products ends -->

<tr style="float: left;width: 100%;background: #ffffff;">
	<td style="float: left;width: 49%;"><div style="width: 100%;height: 1px;"></div></td>
	<td style="float: left;width: 50%;margin-bottom: 30px;">
		<span style="float: left;width: 50%;font-size: 13px;color: #343538;line-height: 30px;text-align:right;">
			<span style="float: left;width: 100%;">Subtotal</span>
			<span style="float: left;width: 100%;">Delivery Charge</span>
			<span style="float: left;width: 100%;">Service Charge</span>
			<span style="float: left;width: 100%;">Discount (Non-Chilled)</span>
			@if(isset($order['discount']['coupon']))
				<span style="float: left;width: 100%;">Coupon Discount</span>
			@endif
			@if(isset($order['service']['surcharge_taxes']))
				@foreach($order['service']['surcharge_taxes'] as $surcharges)
					<span style="float: left;width: 100%;">{{$surcharges['label']}}</span>
				@endforeach
			@endif
			<span style="float: left;width: 100%;">Total</span>
		</span>
		<span style="float: right;width: 40%;font-size: 13px;color: #343538;text-align:right;line-height: 30px;font-weight: bold;padding-right: 20px;">
			<span style="float: left;width: 100%;">{{currency($order['payment']['subtotal'])}}</span>
			<span style="float: left;width: 100%;">{{getDeliveryCharges($order['service'])}}</span>
			<span style="float: left;width: 100%;">{{getServiceCharges($order['service'])}}</span>
			<span style="float: left;width: 100%;">-{{getNonChilledDiscount($order)}}</span>
			@if(isset($order['discount']['coupon']))
				<span style="float: left;width: 100%;">-{{getCouponDiscount($order)}}</span>
			@endif
			@if(isset($order['service']['surcharge_taxes']))
				@foreach($order['service']['surcharge_taxes'] as $surcharges)
					<span style="float: left;width: 100%;">{{currency($surcharges['value'])}}</span>
				@endforeach
			@endif
			<span style="float: left;width: 100%;">{{currency($order['payment']['total'])}}</span>
		</span>
	</td>
</tr>

<tr style="float: left;width: 100%;background: #ffffff;border-bottom: 1px solid #d9d9d9; padding-bottom: 10px;">
	<td style="float: left;width: 45%;padding-left: 20px;text-align: left;font-family: 14px;color: #343538;">Delivery Address</td>
</tr>
<tr style="float: left;width: 100%;background: #ffffff;">

	<td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px;">{{ucfirst($order['delivery']['address']['detail']['firstname'].' '.@$order['delivery']['address']['detail']['lastname'])}} ,</td>

	<?php if(isset($order['delivery']['address']['detail']['company'])){?>      
      <td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px;">{{$order['delivery']['address']['detail']['company']}}</td>
    <?php }?>

    <?php if(isset($order['delivery']['address']['detail']['BLDG_NAME'])){?>      
      <td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px;">{{$order['delivery']['address']['detail']['BLDG_NAME']}}</td>
    <?php }?>

    <td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px;">{{$order['delivery']['address']['detail']['HBRN']}}</td>

    <?php if(isset($order['delivery']['address']['detail']['FLOOR']) || isset($order['delivery']['address']['detail']['UNIT'])){?>
    	<td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px;">
    		<?php if(isset($order['delivery']['address']['detail']['FLOOR'])){?>
    			<span>#{{ $order['delivery']['address']['detail']['FLOOR'] }} - </span>
			<?php }?>
			<?php if(isset($order['delivery']['address']['detail']['UNIT'])){?>
				<span>{{ $order['delivery']['address']['detail']['UNIT'] }}</span>
			<?php }?>
    	</td>
    <?php }?>

	<td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px;">Singapore - {{$order['delivery']['address']['detail']['PostalCode']}}</td>
	<td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px; margin-bottom:25px;">Contact - {{@$order['delivery']['contact']}}</td>
</tr>

<tr style="float: left;width: 100%;background: #ffffff;border-bottom: 1px solid #d9d9d9; padding-bottom: 10px;">
	<td style="float: left;width: 45%;padding-left: 20px;text-align: left;font-family: 14px;color: #343538;">Delivery Time</td>
</tr>
<tr style="float: left;width: 100%;background: #ffffff;">
	<td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px; margin-bottom:25px;">
        <div><?php echo @$order['delivery']['deliveryDate']; ?></div>
        <?php if(isset($order['delivery']['deliveryTimeRange']) && $order['delivery']['deliveryTimeRange']!=''){?>                        
        <div><?php echo @$order['delivery']['deliveryTimeRange']; ?></div>
        <?php }?>
	</td>
</tr>

<tr style="float: left;width: 100%;background: #ffffff;border-bottom: 1px solid #d9d9d9; padding-bottom: 10px;">
	<td style="float: left;width: 45%;padding-left: 20px;text-align: left;font-family: 14px;color: #343538;">Payment Method</td>
</tr>
<tr style="float: left;width: 100%;background: #ffffff; margin-bottom:15px;">
	<td style="float: left;width: 96%;padding-left:20px;font-size: 13px;color: #343538;margin-top: 10px; margin-bottom:25px;">{{getPaymentMethod($order['payment'])}}</td>
</tr>
</tbody>
</table>

<?php 

setlocale(LC_MONETARY, 'en_US.UTF-8');

function getServiceCharges($service){

	$serviceCharges = 0;
	if($service['express']['status']){
		$serviceCharges+=$service['express']['charges'];
	}
	if($service['smoke']['status']){
		$serviceCharges+=$service['smoke']['charges'];
	}
	
	return currency($serviceCharges);

}

function getDeliveryCharges($service){

	if($service['delivery']['free']){
		return 'FREE';
	}

	return currency($service['delivery']['charges']);

}

function getNonChilledDiscount($order){

	$discount = 0;
	if(isset($order['discount']['nonchilled']) && $order['discount']['nonchilled']['status']){
		$discount = $order['discount']['nonchilled']['exemption'];
	}

	return currency($discount);

}
			
function getCouponDiscount($order){
	$discount = 0;
	if(isset($order['discount']['coupon'])){
		$discount = $order['discount']['coupon'];
	}

	return currency($discount);
}

function getPaymentMethod($payment){

	$paymode = '';	

	if($payment['method'] == 'COD'){
		$paymode = 'Cash on delivery';
	}else{
		$paymode = 'Debit/Credit Card';
	}

	return $paymode;

}

function currency($value,$sign = "$"){
	return $sign.money_format('%.2n', $value);
}

function showProducts($order){

$tpl = "";
foreach($order['products'] as $product){

	if($product['qtyfinal']<1){continue;}
	$productInfo = $order['productsLog'][(string)$product['_id']];
	
	$tpl.= '<tr style="float: left;width: 100%;background: #ffffff;">
				<td style="float: left;width: 70%;padding-left: 20px;margin-top: 18px;">
					<a href="'.url("/product/".$productInfo['slug']).'" style="border: 1px solid #d9d9d9;float: left;width:70px;height:70px;padding:5px">
					<img src="'.asset('products/i/200/'.$productInfo['coverImage']).'" style="float: left;max-width:100%;max-height:100%">
					</a>
					<span style="color: #343538;float: left;font-size: 14px;font-weight: bold;margin-top: 5px;padding-left: 20px;width: 75%;">'.$productInfo['name'].'</span>
					<span style="float: left;font-size: 14px;color: #343538;margin-top: 5px;padding-left: 20px;width: 75%;;font-weight: normal;">'.currency($product['unitprice']).'</span>
					<span style="float: left;font-size: 14px;color: #343538;margin-top: 5px;padding-left: 20px;width: 75%;;font-weight: normal;">unit price</span>';

	if(isset($productInfo['sale'])){
		$tpl.='<span style="float:left; width:100%;">
					<a href="#" style="background: #ffc412;color: #000000;text-align: center;padding: 3px 6px;border-radius: 4px;-webkit-border-radius: 4px;-moz-border-radius: 4px;text-decoration: none;float: left;margin-top: 10px; margin-right:8px;">'.$productInfo['sale']['detailTitle'].'</a>
				</span>';
	}
					
	$tpl.=		'</td>
				<td style="float: right;width: 20%;padding-right: 20px;margin-top: 50px;font-size: 14px;font-weight: normal;color: #343538;text-align: right;">( '.$product['qtyfinal'].' ) &nbsp;&nbsp;&nbsp;&nbsp;  <span style="font-size: 14px;color: #343538;font-weight: bold;">'.currency($product['price']).'</span></td>
			</tr>';
}

return $tpl;

}

function showSales($order){

$tpl = "";

if(isset($order['sales']))
foreach($order['sales'] as $sale){
	
	$tpl.= '<tr style="float: left;width: 100%;background: #ffffff;">
				<td style="float: left;width: 70%;padding-left: 20px;margin-top: 18px;">';

	foreach($sale['products'] as $product){

		$productInfo = $order['productsLog'][(string)$product['_id']];

		for($i=0;$i<$product['quantity'];$i++){

		$tpl.='<a href="'.url("/product/".$productInfo['slug']).'" style="border: 1px solid #d9d9d9;float: left;width:70px;height:70px;padding:5px;margin-right:5px">
				<img title="'.$productInfo['name'].'" alt="'.$productInfo['name'].'" src="'.asset('products/i/200/'.$productInfo['coverImage']).'" style="float: left;max-width:100%;max-height:100%">
				</a>';

		}
	}

	if(isset($sale['action'])){
	foreach($sale['action'] as $product){

		$productInfo = $order['productsLog'][(string)$product['_id']];

		for($i=0;$i<$product['quantity'];$i++){

		$tpl.='<a href="'.url("/product/".$productInfo['slug']).'" style="border: 1px solid #d9d9d9;float: left;width:70px;height:70px;padding:5px;margin-right:5px">
				<img title="'.$productInfo['name'].'" alt="'.$productInfo['name'].'" src="'.asset('products/i/200/'.$productInfo['coverImage']).'" style="float: left;max-width:100%;max-height:100%">
				</a>';

		}
	}
	}

	$tpl.=		'<div style="width:100%;float:left"><span style="float: left;font-size: 14px;color: #343538;margin-top: 5px;font-weight: normal;background: #FFEB3B;padding: 3px 10px;border-radius: 3px;">'.$sale['sale']['detailTitle'].'</span></div>
				</td>
				<td style="float: right;width: 20%;padding-right: 20px;margin-top: 50px;font-size: 14px;font-weight: normal;color: #343538;text-align: right;"><span style="font-size: 14px;color: #343538;font-weight: bold;">'.currency($sale['price']['sale']).'</span></td>
			</tr>';
	
}

return $tpl;

}

function showPackages($order){

	$tpl = "";

	if(isset($order['packages']))
	foreach($order['packages'] as $package){
		
		$tpl.= '<tr style="float: left;width: 100%;background: #ffffff;">
					<td style="float: left;width: 70%;padding-left: 20px;margin-top: 18px;">
						<a href="javascript:void(0)" style="border: 1px solid #d9d9d9;float: left;width:70px;height:70px;padding:5px">
						<img src="'.asset('packages/i/'.$package['coverImage']).'" style="float: left;max-width:100%;max-height:100%">
						</a>
						<span style="color: #343538;float: left;font-size: 14px;font-weight: bold;margin-top: 5px;padding-left: 20px;width: 75%;">'.$package['title'].'</span>
						<span style="float: left;font-size: 14px;color: #343538;margin-top: 5px;width: 100%;font-weight: normal;">'.currency($package['packagePrice']).'</span>
						<span style="float: left;font-size: 14px;color: #343538;margin-top: 5px;width: 100%;font-weight: normal;">unit price</span><div style="width:100%;float:left">';

		foreach($package['packageItems'] as $product){
			
			$pro = array_pop($product['products']);

			$productInfo = $order['productsLog'][(string)$pro['_id']];

			$tpl.= '<a target="new" href="'.url("/product/".$productInfo['slug']).'" style="border: 1px solid #d9d9d9;float: left;width:70px;height:70px;padding:5px">
						<img title="'.$productInfo['name'].'" alt="'.$productInfo['name'].'" src="'.asset('products/i/200/'.$productInfo['coverImage']).'" style="float: left;max-width:100%;max-height:100%">
					</a> <span style="float: left;margin-top: 35px;padding: 0 15px;font-size: 12px;">X '.$pro['quantity'].'</span>';

		}
						
		$tpl.=		'</div></td>
					<td style="float: right;width: 20%;padding-right: 20px;margin-top: 50px;font-size: 14px;font-weight: normal;color: #343538;text-align: right;">( '.$package['packageQuantity'].' ) &nbsp;&nbsp;&nbsp;&nbsp; <span style="font-size: 14px;color: #343538;font-weight: bold;">'.currency($package['price']).'</span></td>
				</tr>';
	}

	return $tpl;
}

function showGiftCards($order){

}

function showLoyaltyCards($order){

$tpl = "";
if(isset($order['loyaltyCards']))
foreach($order['loyaltyCards'] as $card){
		
	$tpl.= '<tr style="float: left;width: 100%;background: #ffffff;">
				<td style="float: left;width: 70%;padding-left: 20px;margin-top: 18px;">
					
					<span style="color: #343538;float: left;font-size: 14px;font-weight: bold;margin-top: 5px;padding-left: 20px;width: 75%;">Convert '.$card['points'].' to '.currency($card['value']).'</span>';
					
	$tpl.=		'</td>
				<td style="float: right;width: 20%;padding-right: 20px;margin-top: 50px;font-size: 14px;font-weight: normal;color: #343538;text-align: right;">( '.$card['quantity'].' ) &nbsp;&nbsp;&nbsp;&nbsp; <span style="font-size: 14px;color: #343538;font-weight: bold;">LP '.$card['total'].'</span></td>
			</tr>';
}

return $tpl;

}

function showLoyalty($order){

$tpl = "";
if(isset($order['loyalty']))
foreach($order['loyalty'] as $product){
	
	$productInfo = $order['productsLog'][(string)$product['_id']];
	
	$tpl.= '<tr style="float: left;width: 100%;background: #ffffff;">
				<td style="float: left;width: 70%;padding-left: 20px;margin-top: 18px;">
					<a href="'.url("/product/".$productInfo['slug']).'" style="border: 1px solid #d9d9d9;float: left;width:70px;height:70px;padding:5px">
					<img src="'.asset('products/i/200/'.$productInfo['coverImage']).'" style="float: left;max-width:100%;max-height:100%">
					</a>
					<span style="color: #343538;float: left;font-size: 14px;font-weight: bold;margin-top: 5px;padding-left: 20px;width: 75%;">'.$productInfo['name'].'</span>
					<span style="color: #343538;float: left;font-size: 14px;margin-top: 5px;padding-left: 20px;width: 75%;">'.getLoyaltyUnitPrice($product).'</span>
					<span style="color: #343538;float: left;font-size: 14px;margin-top: 5px;padding-left: 20px;width: 75%;">unit value</span>';	
					
					
	$tpl.=		'</td>
				<td style="float: right;width: 20%;padding-right: 20px;margin-top: 50px;font-size: 14px;font-weight: normal;color: #343538;text-align: right;">'.$product['quantity']['total'].' X <span style="font-size: 14px;color: #343538;font-weight: bold;">'.setLoyaltyPrice($product['price']).'</span></td>
			</tr>';
}

return $tpl;

}

function showPromotion($order){

$tpl = "";
if(isset($order['promotion']))
foreach($order['promotion'] as $product){

	$productInfo = $order['productsLog'][(string)$product['product']];
	 
	$tpl.= '<tr style="float: left;width: 100%;background: #ffffff;">
				<td style="float: left;width: 70%;padding-left: 20px;margin-top: 18px;">
					<a href="'.url("/product/".$productInfo['slug']).'" style="border: 1px solid #d9d9d9;float: left;width:70px;height:70px;padding:5px">
					<img src="'.asset('products/i/200/'.$productInfo['coverImage']).'" style="float: left;max-width:100%;max-height:100%">
					</a>
					<span style="color: #343538;float: left;font-size: 14px;font-weight: bold;margin-top: 5px;padding-left: 20px;width: 75%;">'.$productInfo['name'].'</span>';	
					
	$tpl.=		'</td>
				<td style="float: right;width: 20%;padding-right: 20px;margin-top: 50px;font-size: 14px;font-weight: normal;color: #343538;text-align: right;"><span style="font-size: 14px;color: #343538;font-weight: bold;">'.($product['price']>0?currency($product['price']):"FREE").'</span></td>
			</tr>';
}

return $tpl;

}


function setLoyaltyPrice($data){

	$price = 'LP '.$data['points'];

	if(isset($data['amount']) && $data['amount']>0)
	$price = $price.' + '.currency($data['amount']);
	
	return $price;
}

function getLoyaltyUnitPrice($data){

	$quantity = $data['quantity']['total'];

	$price = 'LP '.number_format($data['price']['points']/$quantity,2);

	if(isset($data['price']['amount']) && $data['price']['amount']>0)
	$price = $price.' + '.currency($data['price']['amount']/$quantity);
	
	return $price;
}


?>
