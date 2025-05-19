<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\ProductImageController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\CategoryProductController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\SearchController;
use App\Http\Controllers\API\TagController;
use App\Http\Controllers\API\ProductTagController;

// Test route
Route::get('/test', function() {
    return ['message' => 'API is working!'];
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Products public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/products/{product}/images', [ProductImageController::class, 'index']);
Route::get('/products/{product}/tags', [ProductTagController::class, 'index']);
Route::get('/search/products', [SearchController::class, 'products']);

// Categories public routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/categories/{category}/products', [CategoryProductController::class, 'index']);

// Tags public routes
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{tag}', [TagController::class, 'show']);
Route::get('/tags/{tag}/products', [TagController::class, 'products']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Cart routes
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{id}', [CartController::class, 'updateItem']);    Route::delete('/cart/items/{id}', [CartController::class, 'removeItem']);
    Route::delete('/cart', [CartController::class, 'clear']);
    
    // Admin routes
    Route::middleware('admin')->group(function () {        // Products admin routes        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/products/bulk-delete', [ProductController::class, 'bulkDestroy']);
          // Product images routes
        Route::get('/products/{product}/images', [ProductImageController::class, 'index']);
        Route::post('/products/{product}/images', [ProductImageController::class, 'store']);
        Route::post('/products/{product}/images/upload', [ProductImageController::class, 'upload']);
        Route::put('/products/{product}/images/{image}', [ProductImageController::class, 'update']);
        Route::delete('/products/{product}/images/{image}', [ProductImageController::class, 'destroy']);
        
        // Product tags routes
        Route::post('/products/{product}/tags', [ProductTagController::class, 'store']);
        Route::put('/products/{product}/tags', [ProductTagController::class, 'update']);
        Route::delete('/products/{product}/tags/{tag}', [ProductTagController::class, 'destroy']);
          // Categories admin routes
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        
        // Tags admin routes
        Route::post('/tags', [TagController::class, 'store']);
        Route::put('/tags/{tag}', [TagController::class, 'update']);
        Route::delete('/tags/{tag}', [TagController::class, 'destroy']);
        
        // Orders admin routes (admin can see all orders)
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    });
    
    // User routes (own orders)
    Route::get('/my-orders', [OrderController::class, 'userOrders']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show'])->middleware('can:view,order');
});
