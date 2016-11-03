@extends('invoice.layout')
@section('content')
<div id="content">
<div align="center" id="background">
  <p id="bg-text">1hr delivery</p>
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
          <table width="302" border="0" align="center" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td align="left" valign="middle">
                  <table width="100%" border="0" cellspacing="2" cellpadding="2" align="right" style="font-size:12px; margin-top:5px;">
                    <tbody>
                    <tr>
                      <td colspan="2" align="center" nowrap="nowrap" style="font-size:12px;">
                        <img style="width:150px;margin-left: 55px;" class="img-responsive" src="{{ asset('img/poslogo.png') }}">
                      </td>
                    </tr>                    
                    <tr>
                      <td colspan="2" align="center" nowrap="nowrap" style="font-size:12px;padding-top: 5px;">
                        <strong>Tel:+6592445533</strong>
                      </td>
                    </tr>
                    <tr>                      
                      <td colspan="2" align="left" nowrap="nowrap">&nbsp;</td>
                    </tr>
                    <tr>                      
                      <td colspan="2" align="center" nowrap="nowrap">
                        <h5><strong>Invoice</strong></h5>
                        <h4><strong>ADSG37561O0731</strong></h4>
                      </td>
                    </tr>
                    <tr>
                      <td valign="top">
                        <div><strong>Delivery Address</strong></div>
                        <div>John Doe</div>
                        <div>Nexus</div>
                        <div>CHENG SAN GREEN</div>
                        <div>ANG MO KIO AVENUE 10</div>
                        <div>#2 - 3</div>
                        <div>Singapore - 460543</div>
                      </td>
                      <td valign="top" align="right">
                        <div><strong>Order date</strong></div>
                        <div>27-10-2016 12:05</div>
                        <div><strong>Delivery date</strong></div>
                        <div>27-10-2016 01:05</div>
                        <div><strong>Contact Number</strong></div>
                        <div>+6580458222</div>
                      </td>
                    </tr>
                    <tr>                      
                      <td colspan="2" align="left" nowrap="nowrap">&nbsp;</td>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <table width="100%" border="0" cellspacing="2" cellpadding="0">
                          <tr class="">
                            <td align="left">QTY</td>
                            <td>PRODUCT</td>
                            <td align="right">UNIT</td>
                            <td align="right">TOTAL</td>
                          </tr>
                          <tr valign="top">
                            <td></td>
                          </tr>
                          <tr valign="top">
                            <td align="left">1</td>
                            <td>Absolute Vodka</td>
                            <td align="right">48.20</td>
                            <td align="right">48.20</td>
                          </tr>
                          <tr valign="top">
                            <td align="left">1</td>
                            <td>Red wine</td>
                            <td align="right">58.20</td>
                            <td align="right">58.20</td>
                          </tr>                          
                          <tr valign="top">
                            <td align="left">1</td>
                            <td><strong>3 FREE 1</strong></td>
                            <td align="right">148.20</td>
                            <td align="right">148.20</td>
                          </tr>
                          <tr valign="top">
                            <td align="left"></td>
                            <td>
                              <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td valign="top">3</td>      
                                  <td valign="top">Red wine</td>
                                </tr>
                              </table>  
                            </td>                            
                          </tr>
                          <tr valign="top">
                            <td align="left"></td>
                            <td>
                              <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td valign="top">1</td>      
                                  <td valign="top">Black label</td>
                                </tr>
                              </table>  
                            </td>                            
                          </tr>
                          <tr valign="top">
                            <td align="left">1</td>
                            <td><strong>Party package (8-10 pax)</strong></td>
                            <td align="right">148.20</td>
                            <td align="right">148.20</td>
                          </tr>   
                          <tr valign="top">
                            <td align="left"></td>
                            <td>
                              <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td valign="top">2</td>      
                                  <td valign="top">Red wine</td>
                                </tr>
                              </table>  
                            </td>                            
                          </tr>
                          <tr valign="top">
                            <td align="left"></td>
                            <td>
                              <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td valign="top">1</td>      
                                  <td valign="top">Champagne Saber</td>
                                </tr>
                              </table>  
                            </td>                            
                          </tr>                       
                          <tr valign="top">
                            <td align="left">1</td>
                            <td>Gift Certificate</td>
                            <td align="right">500.00</td>
                            <td align="right">500.00</td>
                          </tr>
                          <tr valign="top">
                            <td align="left">2</td>
                            <td>Tiger beer(chilled)</td>
                            <td align="right">16.20</td>
                            <td align="right">32.40</td>
                          </tr>
                          <tr valign="top">
                            <td align="left">1</td>
                            <td>Loyalty product</td>
                            <td align="right">0.00</td>
                            <td align="right">0.00</td>
                          </tr>
                          <tr valign="top">
                            <td align="left">1</td>
                            <td><strong>Basket</strong></td>
                            <td align="right">25.00</td>
                            <td align="right">25.00</td>
                          </tr>
                          <tr valign="top">
                            <td align="left"></td>
                            <td>
                              <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td valign="top">10</td>      
                                  <td valign="top">Absolute Vodka</td>
                                </tr>
                              </table>  
                            </td>                            
                          </tr>                          
                          <tr class="bottomborder">                      
                            <td colspan="4" align="left" nowrap="nowrap"></td>
                          </tr>
                          <tr>
                            <td align="left" colspan="3"><strong>Subtotal</strong></td>    
                            <td align="right"><strong>992.60</strong></td>
                          </tr>
                          <tr>
                            <td align="left" colspan="3"><strong>Delivery Charge</strong></td>    
                            <td align="right"><strong>20.00</strong></td>
                          </tr>                          
                          <tr>
                            <td align="left" colspan="3"><strong>Service Charge</strong></td>    
                            <td align="right"><strong>55.00</strong></td>
                          </tr>
                          <tr>
                            <td></td>
                            <td align="left" colspan="2">
                              <div><b>Need smoke ($5) :</b></div>
                              <div>Need smoke details will be printed here.</div>
                              <div><b>Express delivery ($50).</b></div>
                            </td>                                
                          </tr>
                          <tr>
                            <td align="left" colspan="3"><strong>Discount (Non-Chilled)</strong></td>    
                            <td align="right"><strong>-1.00</strong></td>
                          </tr>                          
                          <tr class="topborder">
                            <td align="left" valign="center" colspan="3"><strong>Total</strong></td>    
                            <td align="right" valign="center"><h5 class="nomargin">1,066.60</h5></td>
                          </tr>
                          <tr class="bottomborder">
                            <td align="left" valign="center" colspan="3"><strong>Payment mode : C.O.D</strong></td>    
                            <td align="right" valign="center"><h5 class="nomargin">1,066.60</h5></td>
                          </tr>
                          <tr class="bottomborder">
                            <td align="left" valign="center" colspan="3"><strong>To Pay</strong></td>    
                            <td align="right" valign="center"><h5 class="nomargin"><strong>$1,066.60</strong></h5></td>
                          </tr>                          
                        </table>
                      </td>  
                    </tr> 
                    <tr><td>&nbsp;</td></tr>
                    <tr>
                      <td colspan="4">
                        <strong><u>Delivery instructions</u></strong>
                        <div>Call upon delivery.</div>
                        <div>Leave this order at my doorstep.</div>
                        <div>&nbsp;</div>
                        <strong><u>Terms & conditions</u></strong>
                        <ul style="margin-left: 13px;padding:0px;">
                          <li>Cost of cigarettes must be paid in CASH.</li> 
                          <li>Service charge does not include cost of cigarettes.</li>
                          <li>Service is not applicable for Express Delivery.</li>
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