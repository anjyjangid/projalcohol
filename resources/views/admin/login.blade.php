@extends('login')

@section('content')

	<form class="login-form" method="POST" action="{{ action("Auth\AdminAuthController@getLogin") }}">
		{!! csrf_field() !!}
		<h3 class="form-title">Sign In</h3>		

		@if ($errors->has('email'))
		<div class="alert alert-danger">
			<button class="close" data-close="alert"></button>						
			<span>{{ $errors->first('email') }}</span>
		</div>
		@endif
		
		<div class="form-group">
			<!--ie8, ie9 does not support html5 placeholder, so we just show field title for that-->
			<label class="control-label visible-ie8 visible-ie9">Username</label>
			<input class="form-control form-control-solid placeholder-no-fix" type="text" autocomplete="off" placeholder="Username" name="email" value="{{ old('email') }}"/>
		</div>
		<div class="form-group">
			<label class="control-label visible-ie8 visible-ie9">Password</label>
			<input class="form-control form-control-solid placeholder-no-fix" type="password" autocomplete="off" placeholder="Password" name="password" value="{{ old('password') }}"/>
		</div>
		<div class="form-actions">
			<button type="submit" class="btn btn-success uppercase">Login</button>
			<label class="rememberme check">
			<input type="checkbox" name="remember" value="1"/>Remember </label>
			<a href="{{ url('/admin/password/email') }}" class="forget-password">Forgot Password?</a>
		</div>		
	</form>	
@endsection
