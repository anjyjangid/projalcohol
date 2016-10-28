@extends('invoice.layout')
@section('content')
<div id="content">
<div align="center" id="background">
  <p id="bg-text">1 hr delivery</p>
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
    	<td align="left" valign="top" style="padding:20px;">
        <div id="print_barcode">
          <table width="350" border="0" align="center" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td align="left" valign="middle" style="width:235px; padding-right:10px;">
                  <table width="100%" border="0" cellspacing="2" cellpadding="0" align="right" style="font-size:12px; margin-top:2px;">
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
                          <tr>
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
                            <td>3 Red wine</td>
                            <td align="right"></td>
                            <td align="right"></td>
                          </tr>
                          <tr valign="top">
                            <td align="left"></td>
                            <td>1 Black Label</td>
                            <td align="right"></td>
                            <td align="right"></td>
                          </tr>
                          <tr valign="top">
                            <td align="left">2</td>
                            <td>Tiger beer(chilled)</td>
                            <td align="right">16.20</td>
                            <td align="right">32.40</td>
                          </tr>                          
                          <tr valign="top">
                            <td align="left">1</td>
                            <td><strong>Party package (8-10 pax)</strong></td>
                            <td align="right">148.20</td>
                            <td align="right">148.20</td>
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
                            <td align="right">25</td>
                            <td align="right">25</td>
                          </tr>
                          <tr valign="top">
                            <td align="left"></td>
                            <td>1 Absolute Vodka</td>
                            <td align="right"></td>
                            <td align="right"></td>
                          </tr>
                          <tr valign="top">
                            <td align="left"></td>
                            <td>2 Tiger beer</td>
                            <td align="right"></td>
                            <td align="right"></td>
                          </tr>
                          <tr class="bottomborder">                      
                            <td colspan="4" align="left" nowrap="nowrap"></td>
                          </tr>
                          <tr>
                            <td align="right" colspan="3"><strong>Subtotal</strong></td>    
                            <td align="right"><strong>200</strong></td>
                          </tr>
                          <tr>
                            <td align="right" colspan="3"><strong>Delivery Charge</strong></td>    
                            <td align="right"><strong>20</strong></td>
                          </tr>
                          <tr>
                            <td align="right" colspan="3"><strong>Service Charge</strong></td>    
                            <td align="right"><strong>5</strong></td>
                          </tr>
                          <tr>
                            <td align="right" colspan="3"><strong>Discount (Non-Chilled)</strong></td>    
                            <td align="right"><strong>0</strong></td>
                          </tr>                          
                          <tr class="topborder">
                            <td align="right" valign="center" colspan="3"><strong>Total</strong></td>    
                            <td align="right" valign="center"><h5 class="nomargin">$225</h5></td>
                          </tr>
                          <tr class="bottomborder">
                            <td align="right" valign="center" colspan="3"><strong>Payment mode : C.O.D</strong></td>    
                            <td align="right" valign="center"><h5 class="nomargin">$225</h5></td>
                          </tr>
                          <tr class="bottomborder">
                            <td align="right" valign="center" colspan="3"><strong>To Pay</strong></td>    
                            <td align="right" valign="center"><h4 class="nomargin">$225</h4></td>
                          </tr>                          
                        </table>
                      </td>  
                    </tr> 
                    <tr><td>&nbsp;</td></tr>
                    <tr>
                      <td><h5><u>Terms & conditions</u></h5></td>
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