<div style="max-width: 575px; font-family: Arial; margin: 0px auto; padding: 20px; box-sizing: border-box; background: rgb(209, 211, 211);">
  <div style="font-size: 14px; padding: 5px 15px;background:#ffc412 none repeat scroll 0 0;">
    <div style="width:65%;display:inline-block;vertical-align: middle;">      
        <img src="{{asset('asset/i/ad_logo.png')}}" alt="{{Config::get('app.appName')}}" style="width: 150px; color: #553F11; font-size: 24px;" />
    </div>
    <div style="width:34%;display:inline-block;vertical-align: middle;">
      <div style="color:#553F11;text-align:center;font-weight:bold;font-size:16px">Visit Us<br/>
        <a href="{{url('/')}}" style="text-decoration:none;color:#553F11;font-weight:normal;font-size:15px">{{url('/')}}</a>
      </div>
      <div style="color:#553F11;margin-top:18px;text-align:center;font-weight:bold;font-size:16px">Contact Us<br/>
        <a style="text-decoration:none;color:#553F11;font-weight:normal;font-size:15px">{{Config::get('app.appContact')}}</a>
      </div>
    </div>
  </div>

  @yield('content')
  
  <div style="padding: 5px 15px; background-image: initial; background-attachment: initial;background-color: rgb(28, 175, 154); background-size: initial; background-origin: initial; background-clip: initial; background-position: initial; background-repeat: initial;"><span style="color:#FFFFFF;"><span style="font-size:10px">Access More Than 1000 alcohol products and brand</span></span></div>
  <div style="font-size: 14px; display: inline-block; width: 100%; text-align: center; background-image: initial; background-attachment: initial; background-color: rgb(50, 48, 48); background-size: initial; background-origin: initial; background-clip: initial; background-position: initial; background-repeat: initial;">
    <p>
    	<span style="color:#FFF; font-family:arial; font-size:12px">
    	For more information, visit our website at&nbsp;&nbsp;<a style="color:#FFF; font-family:arial; font-size:12px" href="{{url('/')}}">{{url('/')}}</a>
    	</span>
    </p>
  </div>
  <div style="font-size: 13px; line-height: 20px; color: rgb(66, 65, 67);">
    <p>Please do not reply to this email, it was generated automatically.<br />
      Registered users may <a href="{{url('/')}}" style="color:#F36C30;font-weight:bold">log in</a> to their account and update their email preferences.
    </p>
    &nbsp;
    <p style="text-align:center">
    	<a href="{social_facebook}" style="text-decoration: none;">
    		<img src="{{asset('asset/i/facebook.png')}}" style="max-width:30px;color: rgb(66, 65, 67);" alt="Facebook"/>
    	</a>&nbsp;
    	<a href="{social_twitter}" style="text-decoration: none;">
    		<img src="{{asset('asset/i/twitter.png')}}" style="max-width:30px;color: rgb(66, 65, 67);" alt="Twitter"/>
    	</a><br />
      <span style="color:#424142; font-size:11px">&copy; {{date('Y')}} {{Config::get('app.appName')}}</span>
    </p>
  </div>
</div>

