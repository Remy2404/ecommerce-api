<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Response;

// Serve the static HTML files directly with proper Content-Type header
Route::get('/', function () {
    $content = file_get_contents(public_path('index.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});

Route::get('/dashboard', function () {
    $content = file_get_contents(public_path('dashboard.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});

Route::get('/login', function () {
    $content = file_get_contents(public_path('login.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});

Route::get('/register', function () {
    $content = file_get_contents(public_path('register.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});
Route::get('/products', function () {
    $content = file_get_contents(public_path('products.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});
Route::get('/products/{id}', function ($id) {
    $content = file_get_contents(public_path('product.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});
Route::get('/my-orders', function () {
    $content = file_get_contents(public_path('my-orders.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});
Route::get('/categories', function () {
    $content = file_get_contents(public_path('categories.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});
Route::get('/profile', function () {
    $content = file_get_contents(public_path('profile.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});

Route::get('/orders', function () {
    $content = file_get_contents(public_path('orders.html'));
    return Response::make($content, 200, ['Content-Type' => 'text/html']);
});