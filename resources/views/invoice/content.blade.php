@extends('invoice.layout')
@section('content')
<div class="container">
	<div style="page-break-after: always;">
		<h1>Invoice #3215</h1>
		<table class="table table-bordered">
			<thead>
				<tr>
					<td colspan="2">Order Details</td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td style="width: 50%;">
						<address>
							<strong>The OpenCart demo store</strong><br/>
							OpenCart Limited, Unit 16, 26/F, Tuen Mun Central Square, 22 Hoi Wing Road, Tuen Mun, Hong Kong
						</address>
						<b>Telephone:</b> +852 24990996<br/>
						<b>E-Mail:</b> demo@demo.com<br/>
						<b>Web Site:</b> <a href="http://demo.opencart.com">http://demo.opencart.com</a>
					</td>
					<td style="width: 50%;">
						<b>Date Added:</b> 23/10/2016<br/>
						<b>Order ID:</b> 3215<br/>
						<b>Payment Method:</b> Cash On Delivery<br/>
						<b>Shipping Method:</b> Flat Shipping Rate<br/>
					</td>
				</tr>
			</tbody>
		</table>
		<table class="table table-bordered">
			<thead>
				<tr>
					<td style="width: 50%;"><b>To</b></td>
					<td style="width: 50%;"><b>Ship To (if different address)</b></td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<address>
							PiraTa zaranda<br/>asdsada<br/>asdsadsa 23232<br/>Clackmannanshire<br/>United Kingdom 
						</address>
					</td>
					<td>
						<address>
						PiraTa zaranda<br/>asdsada<br/>asdsadsa 23232<br/>Clackmannanshire<br/>United Kingdom 
						</address>
					</td>
				</tr>
			</tbody>
		</table>
		<table class="table table-bordered">
			<thead>
				<tr>
				<td><b>Product</b></td>
				<td><b>Model</b></td>
				<td class="text-right"><b>Quantity</b></td>
				<td class="text-right"><b>Unit Price</b></td>
				<td class="text-right"><b>Total</b></td>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>HP LP3065 <br/>
					&nbsp;<small> - Delivery Date: 2011-04-22</small>
					</td>
					<td>Product 21</td>
					<td class="text-right">1</td>
					<td class="text-right">$122.00</td>
					<td class="text-right">$122.00</td>
				</tr>
				<tr>
					<td class="text-right" colspan="4"><b>Sub-Total</b></td>
					<td class="text-right">$100.00</td>
				</tr>
				<tr>
					<td class="text-right" colspan="4"><b>Flat Shipping Rate</b></td>
					<td class="text-right">$5.00</td>
				</tr>
				<tr>
					<td class="text-right" colspan="4"><b>Eco Tax (-2.00)</b></td>
					<td class="text-right">$4.00</td>
				</tr>
				<tr>
					<td class="text-right" colspan="4"><b>VAT (20%)</b></td>
					<td class="text-right">$21.00</td>
				</tr>
				<tr>
					<td class="text-right" colspan="4"><b>Total</b></td>
					<td class="text-right">$130.00</td>
				</tr>
			</tbody>
		</table>
	</div>	
</div>
@endsection