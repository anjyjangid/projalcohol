@extends('login')

@section('content')
	<form class="" method="POST" action="{{ action("Auth\AdminPasswordController@getEmail") }}">
		{!! csrf_field() !!}
		<h3>Forget Password ?</h3>

		@if ($errors->has('email'))
		<div class="alert alert-danger">
			<button class="close" data-close="alert"></button>						
			<span>{{ $errors->first('email') }}</span>
		</div>
		@endif
		
		@if (Session::has('status'))
		<div class="alert alert-success">
			<button class="close" data-close="alert"></button>
			<span>{{ Session::get('status') }}</span>
		</div>
		@endif

		<p>
			 Enter your e-mail address below to reset your password.
		</p>
		<div class="form-group">
			<input class="form-control placeholder-no-fix" type="text" autocomplete="off" required placeholder="Email" name="email" value=""/>
		</div>
		<div class="form-actions">
			<a href="{{ url('/admin/login') }}" class="btn btn-default">Back</a>			
			<button type="submit" class="btn btn-success uppercase pull-right">Submit</button>
		</div>
	</form>
@endsection
