@extends('emails.layout')
@section('content')
<?php echo htmlspecialchars_decode($content); ?>
@endsection