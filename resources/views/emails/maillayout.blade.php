<div style="margin: 0 auto; width: 100%;padding: 15px 0; background: #ebeef0;display: inline-block;">
<table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px;margin: auto;">
	<tbody>
		<tr style="background: #ffc412 none repeat scroll 0 0; float: left; padding: 10px 12px 10px 5px; width: 97%; margin-bottom:15px;">
			<td style="float: left; width: 33%; text-align: center;"><img src="{{asset('asset/i/emailtemplate-callusnow.jpg')}}" alt="9-2445533" style="margin-top:10px;"></td>
			<td style="float: left; width: 33%; text-align: center;"><img src="{{asset('asset/i/emaitemplate-logo.png')}}" alt="AlcoholDelivery"></td>
			<td style="	float: left; width: 33%; text-align: right;white-space:nowrap;">{{url('/')}}</td>
		</tr>
		<tr>
		<td colspan="3">
		@yield('content')
		</td>
		</tr>
		<tr style="	float: left;width: 100%;background: #ffffff;">
			<td colspan="3" style="float: left;width: 100%;text-align: center;font-weight: bold;font-size: 26px;color:#343538;margin: 35px 0px 45px 0px;">Need help? Simply contact us at:</td>
		</tr>
		<tr style="	float: left;width: 100%;background: #ffffff;margin-bottom:15px;">
			<td style="	float: left;width: 33%;text-align: center;">
				<img src="{{asset('asset/i/emailtemplate-hotline.png')}}">
				<span style="float: left;width: 100%;font-size: 13px;color: #000000;text-transform: uppercase;font-weight: 600;margin-top: 12px;">Hotline</span>
				<span style="float: left;width: 100%;font-size: 12px;color: #474747;margin: 8px 0px 35px 0px;line-height: 22px;">9-2445533 (9-CHILLED)</span>
			</td>
			<td style="	float: left;width: 33%;text-align: center;">
				<img src="{{asset('asset/i/emailtemplate-email.png')}}">
				<span style="float: left;width: 100%;font-size: 13px;color: #000000;text-transform: uppercase;font-weight: 600;margin-top: 12px;">Email</span>
				<span style="float: left;width: 100%;font-size: 12px;color: #474747;margin: 8px 0px 35px 0px;line-height: 22px;">sales@alcoholdelivery.com.sg</span>
			</td>
			<td style="	float: left;width: 33%;text-align: center;">
				<img src="{{asset('asset/i/emailtemplate-clock.png')}}">
				<span style="float: left;width: 100%;font-size: 13px;color: #000000;text-transform: uppercase;font-weight: 600;margin-top: 12px;">Operating hours</span>
				<span style="float: left;width: 100%;font-size: 12px;color: #474747;margin: 8px 0px 35px 0px;line-height: 22px;">12pm - 10:30pm <br> 365 days a year!</span>
			</td>	
		</tr>

		<tr style="background: #ffc412 none repeat scroll 0 0; float: left; padding: 10px 12px 10px 5px; width: 97%;">
			<td style="float: left;width: 100%;text-align: center;"><img src="{{asset('asset/i/emailtemplate-footer-fb.png')}}"></td>
			<td style="float: left;width: 100%;text-align: center;font-size: 12px;color: #000000;">Copyright AlcoholDelivery 2017. All rights reserved. <br> www.alcoholdelivery.com.sg</td>
		</tr>
	</tbody>
</table>
</div>
