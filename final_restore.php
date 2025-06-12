<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

try {
    echo "Cleaning existing orders...\n";
    
    // Clean existing orders
    DB::table('order_items')->delete();
    DB::table('orders')->delete();
    
    echo "Creating sample orders for your account...\n";
    
    // Get your user account
    $user = User::where('email', 'rosexmee1122@gmail.com')->first();
    
    if ($user) {
        // Create orders
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
        
        echo "Orders created successfully!\n";
        echo "Order 1 ID: " . $order1->id . " (Total: $" . $order1->total_amount . ")\n";
        echo "Order 2 ID: " . $order2->id . " (Total: $" . $order2->total_amount . ")\n";
        
        // Create order items
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 1,
            'product_name_at_purchase' => 'iPhone 15 Pro',
            'quantity' => 1,
            'price_at_purchase' => 999.99
        ]);
        
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => 3,
            'product_name_at_purchase' => 'Premium T-Shirt',
            'quantity' => 1,
            'price_at_purchase' => 29.99
        ]);
        
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => 4,
            'product_name_at_purchase' => 'Designer Jeans',
            'quantity' => 1,
            'price_at_purchase' => 89.99
        ]);
        
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => 5,
            'product_name_at_purchase' => 'Programming Book',
            'quantity' => 1,
            'price_at_purchase' => 49.99
        ]);
        
        echo "Order items created successfully!\n";
        
        echo "\n=== DATA RESTORATION COMPLETE ===\n";
        echo "Your Account: " . $user->name . " (" . $user->email . ")\n";
        echo "Categories: " . DB::table('categories')->count() . "\n";
        echo "Products: " . DB::table('products')->count() . "\n";
        echo "Orders: " . DB::table('orders')->count() . "\n";
        echo "Order Items: " . DB::table('order_items')->count() . "\n";
        echo "================================\n";
        
    } else {
        echo "User not found!\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}
