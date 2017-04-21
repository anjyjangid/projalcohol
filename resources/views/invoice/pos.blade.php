@extends('invoice.layout')
@section('content')
<?php  

  if($order['delivery']['type'] == 1){
    $delivery = 'advance delivery';
  }else{
    $delivery = '1hr delivery';
    if($order['service']['express']['status'])
       $delivery = 'express delivery';
  }

  $address = $order['delivery']['address']['detail'];

  $paymode = '';

  $topay = 0;

  if($order['payment']['method'] == 'COD'){
    $paymode = 'C.O.D';    
    $topay = $order['payment']['total'];
  }else{
    $paymode = 'Debit/Credit Card';
  } 

?>

<div id="content">
<div align="center" id="background">
  <p id="bg-text">{{ $delivery }}</p>
</div>
<table align="center" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tbody>
    <tr class="noprint">
      <td style="padding:20px;">
        <div align="right">
          <a href="JavaScript:void(0)" onclick="return printme()"><strong>Print</strong></a>
        </div>
      </td>
    </tr>
    <tr>
    	<td align="left" valign="top">
        <div id="print_barcode">
          <table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td align="left" valign="middle">
                  <table width="100%" border="0" cellspacing="2" cellpadding="2" align="right" style="font-size:12px; margin-top:5px;">
                    <tbody>
                    <tr>
                      <td align="left" nowrap="nowrap" style="font-size:12px;">
                        <img style="width:150px;" class="img-responsive" src="{{ asset('img/poslogo.png') }}">
                      </td>
                      <td align="right" nowrap="nowrap" valign="bottom">
                        <h5 class="nomargin"><strong>Invoice</strong></h5>
                      </td>
                    </tr>                    
                    <tr>
                      <td valign="center" align="left" nowrap="nowrap">
                        <strong>Tel:+6592445533</strong>
                      </td>
                      <td valign="center" align="right">
                        <h5 class="nomargin"><strong>{{ $order['reference'] }}</strong></h5>
                      </td>
                    </tr>
                    <tr>                      
                      <td colspan="2" align="left" nowrap="nowrap">&nbsp;</td>
                    </tr>
                    <!-- <tr>                      
                      <td colspan="2" align="center" nowrap="nowrap">
                        <h5><strong>Invoice</strong></h5>
                        <h4><strong>{{ $order['reference'] }}</strong></h4>
                      </td>
                    </tr> -->
                    <tr>
                      <td valign="top">
                        <div><strong>Delivery Address</strong></div>
                        <div>{{ $address['firstname'].' '.@$address['lastname'] }}</div>
                        <?php if(isset($address['company'])){?>
                          <div>{{ $address['company'] }}</div>
                        <?php }?>
                        <?php if(isset($address['BLDG_NAME'])){?>
                        <div>{{ $address['BLDG_NAME'] }}</div>
                        <?php }?>
                        <div>{{ @$address['house'].' '.$address['HBRN'] }}</div>
                        <?php if(isset($address['FLOOR']) || isset($address['UNIT'])){?>
                          <div>
                            <?php if(isset($address['FLOOR'])){?>
                            <span>#{{ $address['FLOOR'] }} - </span>
                            <?php }?>
                            <?php if(isset($address['UNIT'])){?>
                            <span>{{ $address['UNIT'] }}</span>
                            <?php }?>
                          </div>
                        <?php }?>
                        <div>Singapore - {{ $address['PostalCode'] }}</div>
                      </td>
                      <td valign="top" align="right">
                        <div><strong>Order date</strong></div>
                        <div>{{ date('Y-m-d',strtotime($order['created_at'])) }}</div>
                        <div><strong>Delivery date</strong></div>
                        <div><?php echo @$order['delivery']['deliveryDate']; ?></div>
                        <?php if(isset($order['delivery']['deliveryTimeRange']) && $order['delivery']['deliveryTimeRange']!=''){?>                        
                        <div><?php echo @$order['delivery']['deliveryTimeRange']; ?></div>
                        <?php }?>
                        <div><strong>Contact Number</strong></div>
                        <div>{{ $order['delivery']['contact'] }}</div>
                      </td>
                    </tr>
                    <tr>                      
                      <td colspan="2" align="left" nowrap="nowrap">&nbsp;</td>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <table width="100%" border="0" cellspacing="2" cellpadding="0">
                          <tr class="">
                            <td align="left" nowrap="nowrap">QTY</td>
                            <td nowrap="nowrap">PRODUCT</td>
                            <td align="right" nowrap="nowrap">UNIT</td>
                            <td align="right" nowrap="nowrap">TOTAL</td>
                          </tr>
                          <tr valign="top">
                            <td></td>
                          </tr>
                            <?php foreach ($order['particulars'] as $key => $value) {
                              $isPackage = '';                            
                              if(isset($value['products']) && !empty($value['products']))
                                $isPackage = 'fontbold';

                              $value['unitPrice'] = formatPrice($value['unitPrice']);
                              

                            ?>                             
                            <tr valign="top">
                              <td align="left" nowrap="nowrap">
                                <?php echo (!$isPackage)?$value['quantity']:'';?>
                              </td>
                              <td class="{{ $isPackage }}">
                                <?php echo $value['name'];?> 
                                  <?php if($value['chilled'] && !$order['nonchilled']){?> 
                                    <img src="{{ asset('img/snowflake.png') }}" width="16px">
                                  <?php }?>
                              </td>
                              <td align="right" nowrap="nowrap"><?php echo (!$isPackage)?$value['unitPrice']:'';?></td>
                              <td align="right" nowrap="nowrap"><?php echo formatPrice($value['total']);?></td>
                            </tr>
                            <?php if($isPackage){?>
                              <tr valign="top">
                                <td align="left"></td>
                                <td style="padding: 0px;">
                                  <table cellpadding="0" cellspacing="0" border="0">
                                    <?php foreach($value['products'] as $packageProduct){?>
                                    <tr>
                                      <td valign="top" nowrap="nowrap"><?php echo $packageProduct['quantity'];?></td>      
                                      <td valign="top"><?php echo $packageProduct['name'];?></td>
                                    </tr>
                                    <?php }?>                                    
                                  </table>  
                                </td>                            
                              </tr>
                            <?php }?>
                          <?php }?>                                                                            
                          <tr class="bottomborder">
                            <td colspan="4" align="left" nowrap="nowrap"></td>
                          </tr>
                          <tr>
                            <td align="left" colspan="3"><strong>Subtotal</strong></td>    
                            <td align="right" nowrap="nowrap"><strong>{{ formatPrice($order['payment']['subtotal']) }}</strong></td>
                          </tr>
                          <?php if(!$order['service']['delivery']['free']){?>
                          <tr>
                            <td align="left" colspan="3"><strong>Delivery Charge</strong></td>    
                            <td align="right" nowrap="nowrap"><strong> {{ formatPrice($order['service']['delivery']['charges']) }} </strong></td>
                          </tr>   
                          <?php } ?>                       
                          <?php if($order['service']['express']['status'] || $order['service']['smoke']['status']){
                            $serviceChrg = 0;                            
                            if($order['service']['express']['status']){
                              $serviceChrg += $order['service']['express']['charges'];
                              
                            }
                            if($order['service']['smoke']['status']){
                              $serviceChrg += $order['service']['smoke']['charges'];                              
                            }

                            ?>
                            <tr>
                              <td align="left" colspan="3"><strong>Service Charge</strong></td>    
                              <td align="right" nowrap="nowrap"><strong>{{ formatPrice($serviceChrg) }}</strong></td>
                            </tr>                          
                            <tr>
                              <td></td>
                              <td align="left" colspan="2">
                                <?php if($order['service']['smoke']['status']){?>
                                <div><b>Need smoke (${{ $order['service']['smoke']['charges'] }})</b></div>
                                <div>{{ @$order['service']['smoke']['detail'] }}</div>
                                <?php }
                                if($order['service']['express']['status']){?>
                                <div><b>Express delivery (${{ $order['service']['express']['charges'] }})</b></div>
                                <?php }?>
                              </td>                                
                            </tr>
                          <?php }?>
                          <?php if($order['discount']['nonchilled']['status']){?>
                          <tr>
                            <td align="left" colspan="3"><strong>Discount (Non-Chilled)</strong></td>    
                            <td align="right" nowrap="nowrap"><strong>-{{ formatPrice($order['discount']['nonchilled']['exemption']) }}</strong></td>
                          </tr>                          
                          <?php }?>
                          <?php if(isset($order['payment']['totalValue']) && isset($order['discount']['coupon']) && $order['discount']['coupon']>0){?>
                          <tr>
                            <td align="left" colspan="3"><strong>Coupon Discount</strong></td>    
                            <td align="right" nowrap="nowrap">
                              <?php if($order['payment']['totalValue'] < $order['discount']['coupon']){?>
                              <strong>-{{ formatPrice($order['payment']['totalValue'],0) }}</strong>
                              <?php }else{?>
                              <strong>-{{ formatPrice($order['discount']['coupon'],0) }}</strong>
                              <?php }?>
                            </td>
                          </tr> 
                          <?php }?>
                          <?php if(isset($order['service']['surcharge_taxes']) && !empty($order['service']['surcharge_taxes'])) {
                            foreach ($order['service']['surcharge_taxes'] as $key => $value) {?>
                            <tr>
                              <td align="left" colspan="3">
                                <strong>10% PH Surcharge<!-- {{ $value['label'] }} --></strong>
                              </td>
                              <td align="right" nowrap="nowrap">                                
                                {{ formatPrice($value['value'],0) }}
                              </td>
                            </tr>                         
                          <?php }?>  
                          <?php }?>
                          <tr class="topborder">
                            <td align="left" valign="center" colspan="3"><strong>Total</strong></td>    
                            <td align="right" valign="center" nowrap="nowrap"><h5 class="nomargin">{{ formatPrice($order['payment']['total'],0) }}</h5></td>
                          </tr>
                          
                          <tr class="bottomborder">
                            <td align="left" valign="center" colspan="3"><strong>Payment mode : {{ $paymode }}</strong></td>    
                            <td align="right" valign="center" nowrap="nowrap"><h5 class="nomargin">{{ formatPrice($order['payment']['total'],0) }}</h5></td>
                          </tr>
                          <tr class="bottomborder">
                            <td align="left" valign="center" colspan="3"><strong>To Pay</strong></td>    
                            <td align="right" valign="center" nowrap="nowrap">
                              <h5 class="nomargin">
                                <strong>${{ formatPrice($topay,0) }}</strong>
                              </h5>
                            </td>
                          </tr>                          
                        </table>
                      </td>  
                    </tr> 
                    <tr><td>&nbsp;</td></tr>
                    <tr>
                      <td colspan="4">
                        <?php if($order['delivery']['leaveatdoor'] || $order['delivery']['instructions'] || isset($address['instruction'])){?>
                        <strong><u>Delivery/Special Instructions</u></strong>
                        <?php if($order['delivery']['leaveatdoor']){?>
                        <div>- Leave this order at my doorstep.</div>
                        <?php }?>
                        <?php if($order['delivery']['instructions']){?>                        
                        <div>- {{ $order['delivery']['instructions'] }}</div>
                        <?php }?>
                        <?php if(isset($address['instruction'])){?>                        
                        <div>- {{ $address['instruction'] }}</div>
                        <?php }?>
                        <div>&nbsp;</div>
                        <?php }?>
                        <strong><u>Terms & Conditions with reference to <?php echo url();?></u></strong>
                        <ul style="margin-left: 13px;padding:0px;">
                          <?php if($order['service']['smoke']['status']){?>
                          <li>Cost of cigarettes must be paid in CASH.</li> 
                          <li>Service charge does not include cost of cigarettes.</li>                          
                          <?php }?>                          
                        </ul>
                      </td>
                    </tr>                   
                    </tbody>
                  </table>
                </td>                  
              </tr>
            </tbody>
          </table>
        </div>
    	</td>
    </tr>
  </tbody>
</table>
</div>
<script>
function printme(){
    window.print();
    /*var DocumentContainer = document.getElementById('print_barcode');

    var WindowObject = window.open('', "Print_page", "width=740,height=325,top=200,left=250,toolbars=no,scrollbars=yes,status=no,resizable=no");
    WindowObject.document.writeln("<html><body style='font-family:arial;font-size:11px;'>"+DocumentContainer.innerHTML+"</body></html>");
    WindowObject.document.close();
    WindowObject.focus();
    WindowObject.print();
    WindowObject.close();*/
	return true;
}
</script>
@endsection
