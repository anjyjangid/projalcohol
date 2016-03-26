@extends('login')

@section('content')

	<form class="login-form" method="POST" action="{{ url('/admin/password/reset') }}">
		{!! csrf_field() !!}
		
		<input type="hidden" name="token" value="{{ $token }}">	

		<h3 class="form-title">Reset Password</h3>		

		@if ($errors->has('email'))
		<div class="alert alert-danger">
			<button class="close" data-close="alert"></button>						
			<span>{{ $errors->first('email') }}</span>
		</div>
		@endif

		@if ($errors->has('password'))
		<div class="alert alert-danger">
			<button class="close" data-close="alert"></button>						
			<span>{{ $errors->first('password') }}</span>
		</div>
		@endif

		@if (Session::has('status'))
		<div class="alert alert-success">
			<button class="close" data-close="alert"></button>
			<span>{{ Session::get('status') }}</span>
		</div>
		@endif

		<div class="form-group">
			<label class="control-label visible-ie8 visible-ie9">Email</label>
			<input class="form-control form-control-solid placeholder-no-fix" type="text" autocomplete="off" placeholder="Email" name="email" value="{{ old('email') }}"/>
		</div>
		<div class="form-group">
			<label class="control-label visible-ie8 visible-ie9">New Password</label>
			<input class="form-control form-control-solid placeholder-no-fix" type="password" autocomplete="off" placeholder="Password" name="password" value="{{ old('password') }}"/>
		</div>
		<div class="form-group">
			<label class="control-label visible-ie8 visible-ie9">Confirm New Password</label>
			<input class="form-control form-control-solid placeholder-no-fix" type="password" autocomplete="off" placeholder="Confirm New Password" name="password_confirmation" value="{{ old('password_confirmation') }}"/>
		</div>
		<div class="form-actions">
			<button type="submit" class="btn btn-success uppercase">Reset</button>			
		</div>		
	</form>	
@endsection
