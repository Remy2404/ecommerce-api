<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

try {
    echo "Creating categories...\n";
    
    // Create categories
    $electronics = Category::create([
        'name' => 'Electronics',
        'slug' => 'electronics',
        'description' => 'Electronic devices and gadgets'
    ]);
    
    $clothing = Category::create([
        'name' => 'Clothing',
        'slug' => 'clothing',
        'description' => 'Fashion and apparel'
    ]);
    
    $books = Category::create([
        'name' => 'Books',
        'slug' => 'books',
        'description' => 'Books and educational materials'
    ]);
    
    $homeGarden = Category::create([
        'name' => 'Home & Garden',
        'slug' => 'home-garden',
        'description' => 'Home improvement and garden supplies'
    ]);
    
    echo "Categories created successfully!\n";
    
    echo "Creating products...\n";
    
    // Create products
    $iphone = Product::create([
        'name' => 'iPhone 15 Pro',
        'slug' => 'iphone-15-pro',
        'description' => 'Latest iPhone with advanced camera system',
        'price' => 999.99,
        'stock_quantity' => 50,
        'category_id' => $electronics->id,
        'image_url' => 'https://via.placeholder.com/300x300?text=iPhone+15+Pro'
    ]);
    
    $laptop = Product::create([
        'name' => 'Samsung Galaxy Laptop',
        'slug' => 'samsung-galaxy-laptop',
        'description' => 'High-performance laptop for professionals',
        'price' => 1299.99,
        'stock_quantity' => 25,
        'category_id' => $electronics->id,
        'image_url' => 'https://via.placeholder.com/300x300?text=Galaxy+Laptop'
    ]);
    
    $tshirt = Product::create([
        'name' => 'Premium T-Shirt',
        'slug' => 'premium-t-shirt',
        'description' => 'Comfortable cotton t-shirt',
        'price' => 29.99,
        'stock_quantity' => 100,
        'category_id' => $clothing->id,
        'image_url' => 'https://via.placeholder.com/300x300?text=T-Shirt'
    ]);
    
    $jeans = Product::create([
        'name' => 'Designer Jeans',
        'slug' => 'designer-jeans',
        'description' => 'Stylish denim jeans',
        'price' => 89.99,
        'stock_quantity' => 75,
        'category_id' => $clothing->id,
        'image_url' => 'https://via.placeholder.com/300x300?text=Jeans'
    ]);
    
    $book = Product::create([
        'name' => 'Programming Book',
        'slug' => 'programming-book',
        'description' => 'Learn advanced programming concepts',
        'price' => 49.99,
        'stock_quantity' => 30,
        'category_id' => $books->id,
        'image_url' => 'https://via.placeholder.com/300x300?text=Programming+Book'
    ]);
    
    echo "Products created successfully!\n";
    
    echo "Creating sample orders for your account...\n";
    
    // Get your user account
    $user = User::where('email', 'rosexmee1122@gmail.com')->first();
    
    if ($user) {        // Create orders
        $order1 = Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-' . now()->format('YmdHis') . '-001',
            'order_date' => now()->subDays(5),
            'total_amount' => 1029.98,
            'status' => 'delivered',
            'shipping_address' => 'Phnom Penh, Cambodia',
            'billing_address' => 'Phnom Penh, Cambodia'
        ]);
        
        $order2 = Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-' . now()->format('YmdHis') . '-002',
            'order_date' => now()->subDays(2),
            'total_amount' => 139.98,
            'status' => 'processing',
            'shipping_address' => 'Phnom Penh, Cambodia',
            'billing_address' => 'Phnom Penh, Cambodia'
        ]);
        
        // Create order items
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $iphone->id,
            'quantity' => 1,
            'price_at_purchase' => 999.99
        ]);
        
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $tshirt->id,
            'quantity' => 1,
            'price_at_purchase' => 29.99
        ]);
        
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => $jeans->id,
            'quantity' => 1,
            'price_at_purchase' => 89.99
        ]);
        
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => $book->id,
            'quantity' => 1,
            'price_at_purchase' => 49.99
        ]);
        
        echo "Orders created successfully!\n";
    } else {
        echo "User not found!\n";
    }
    
    echo "\n=== DATA RESTORATION COMPLETE ===\n";
    echo "Categories: " . Category::count() . "\n";
    echo "Products: " . Product::count() . "\n";
    echo "Orders: " . Order::count() . "\n";
    echo "Order Items: " . OrderItem::count() . "\n";
    echo "================================\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}
