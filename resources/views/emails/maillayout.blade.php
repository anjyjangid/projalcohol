<table cellspacing="0" cellpadding="0" border="0" style="table-layout: fixed; background-color: #ebeef0; width: 100%; padding-top: 20px;">
    <tbody>
        <tr>
            <td align="center">
                <table cellspacing="0" cellpadding="0" border="0" width="600" style="table-layout: fixed;" class="flexible">
                    <tbody>
                        <tr>
                            <td style="background-color: #ffc412; padding: 8px 15px 8px 15px;">
                                <table cellspacing="0" cellpadding="0" border="0" width="70%" style="table-layout: fixed;" align="left" class="flexible">
                                    <tbody>
                                        <tr>
                                            <td class="logo"><img src="{{asset('asset/i/head-logo.png')}}" alt="9-2445533">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table cellspacing="0" cellpadding="0" border="0" width="30%" style="table-layout: fixed;" align="right" class="flexible">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="padding-top: 4px;">{{url('/')}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 15px;">
                            	@yield('content')
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #fff; padding: 35px 0 30px">
                                <table cellspacing="0" cellpadding="0" border="0" width="600" style="table-layout: fixed;" class="flexible">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="font-size: 23px; font-family: arial; padding-bottom: 30px; color: #343538; font-weight: 600">Need help? Simply contact us at:</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <table cellspacing="0" cellpadding="0" border="0" width="33%" style="table-layout: fixed; padding-bottom: 15px;" align="left"  class="flexible">
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" style="height: 50px;"><img src="{{asset('asset/i/earphones-microphone.png')}}">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="font-size: 13px; font-family: arial; font-weight: 600; color: #000000; padding-bottom: 4px">Hotline</td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="font-size: 12px; font-family: arial; color: #474747;">9-2445533 (9-CHILLED)</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table cellspacing="0" cellpadding="0" border="0" width="34%" style="table-layout: fixed; padding-bottom: 15px;" align="left" class="flexible">
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" style="height: 50px;"><img src="{{asset('asset/i/massage-icon.png')}}">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="font-size: 13px; font-family: arial; color: #000000; font-weight: 600; padding-bottom: 4px">email</td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="font-size: 12px; font-family: arial; color: #474747; ">sales@alcoholdelivery.com.sg</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table cellspacing="0" cellpadding="0" border="0" width="33%" style="table-layout: fixed; padding-bottom: 15px;" align="left" class="flexible">
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" style="height: 50px;"><img src="{{asset('asset/i/clock.png')}}">
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="font-size: 13px; font-family: arial; color: #000000; font-weight: 600; padding-bottom: 4px">operating hours</td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="font-size: 12px; font-family: arial; padding-bottom: 4px; color: #474747;">12pm - 10:30pm</td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="font-size: 12px; font-family: arial; color: #474747;">365 days a year!</td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-top: 15px;"></td>
                        </tr>
                        <tr>
                            <td align="center" style="background-color: #ffc412;">
                                <table cellspacing="0" cellpadding="0" border="0" width="100%" style="table-layout: fixed;" align="left" class="flexible">
                                    <tbody>
                                        <tr>
                                            <td align="center" style="padding: 16px 0 10px 0"><img src="{{asset('asset/i/socail-fb-con.png')}}">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="font-size: 12px; font-family: arial; color: #000000;">Copyright AlcoholDelivery {{date('Y')}}. All rights reserved.</td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="font-size: 12px; font-family: arial; color: #000000; padding: 2px 0 10px 0;">www.alcoholdelivery.com.sg</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>
<!-- <div style="margin: 0 auto; width: 100%;padding: 15px 0; background: #ebeef0;display: inline-block;">
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
			<td style="float: left;width: 100%;text-align: center;">
				<a href="{{$replace['{social_facebook}']}}" style="display: inline-block;"><img src="{{asset('asset/i/emailtemplate-footer-fb.png')}}"></a>
			</td>
			<td style="float: left;width: 100%;text-align: center;font-size: 12px;color: #000000;">Copyright AlcoholDelivery {{date('Y')}}. All rights reserved. <br> www.alcoholdelivery.com.sg</td>
		</tr>
	</tbody>
</table>
</div> -->