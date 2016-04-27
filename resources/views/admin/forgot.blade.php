@extends('login')

@section('content')
	<form class="forget-form" method="POST" action="{{ action("Auth\AdminPasswordController@getEmail") }}">
		{!! csrf_field() !!}
		<h3>Forget Password ?</h3>
		<p>
			 Enter your e-mail address below to reset your password.
		</p>
		<div class="form-group">
			<input class="form-control placeholder-no-fix" type="text" autocomplete="off" required placeholder="Email" name="email" value="{{ old('email') }}"/>
		</div>
		<div class="form-actions">
			<button type="button" id="back-btn" class="btn btn-default">Back</button>
			<button type="submit" class="btn btn-success uppercase pull-right">Submit</button>
		</div>
	</form>
@endsection
