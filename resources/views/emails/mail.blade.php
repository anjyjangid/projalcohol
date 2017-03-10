@extends('emails.maillayout')
@section('content')
<?php echo htmlspecialchars_decode($content); ?>
@endsection
