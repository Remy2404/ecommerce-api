<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrderCollection;
use App\Http\Requests\OrderStoreRequest;
use App\Http\Requests\OrderStatusUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     * Admin sees all orders, regular users see their own orders.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Admin sees all orders, with filtering options
        if ($user->is_admin) {
            $query = Order::query();
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by user
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            
            // Filter by date range
            if ($request->has('from_date')) {
                $query->where('ordered_at', '>=', $request->from_date);
            }
            
            if ($request->has('to_date')) {
                $query->where('ordered_at', '<=', $request->to_date);
            }
            
            // Sort orders
            $sortField = $request->input('sort_by', 'ordered_at');
            $sortDirection = $request->input('sort_direction', 'desc');
            
            // Validate sort field
            $allowedSortFields = ['id', 'ordered_at', 'total_amount', 'status'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
            }
            
            // Paginate results
            $perPage = $request->input('per_page', 15);
            $orders = $query->with(['user', 'items.product'])->paginate($perPage);
            
            return response()->json(new OrderCollection($orders));
        }

        return response()->json([
            'message' => 'Access denied. Use /my-orders endpoint to view your orders.',
        ], 403);
    }

    /**
     * Get orders for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function userOrders(Request $request)
    {
        $user = $request->user();
        
        $query = $user->orders();
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by date range
        if ($request->has('from_date')) {
            $query->where('ordered_at', '>=', $request->from_date);
        }
        
        if ($request->has('to_date')) {
            $query->where('ordered_at', '<=', $request->to_date);
        }
        
        // Sort orders
        $sortField = $request->input('sort_by', 'ordered_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field
        $allowedSortFields = ['id', 'ordered_at', 'total_amount', 'status'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }
        
        // Paginate results
        $perPage = $request->input('per_page', 15);
        $orders = $query->with('items.product')->paginate($perPage);
        
        return response()->json(new OrderCollection($orders));
    }

    /**
     * Store a newly created order in storage.
     *
     * @param  \App\Http\Requests\OrderStoreRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(OrderStoreRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();
        
        // If billing address is not provided, use shipping address
        if (empty($validated['billing_address_line1'])) {
            $validated['billing_address_line1'] = $validated['shipping_address_line1'];
            $validated['billing_address_line2'] = $validated['shipping_address_line2'];
            $validated['billing_city'] = $validated['shipping_city'];
            $validated['billing_postal_code'] = $validated['shipping_postal_code'];
            $validated['billing_country'] = $validated['shipping_country'];
        }
        
        // Begin transaction
        return DB::transaction(function () use ($validated, $user) {
            $totalAmount = 0;
            $orderItems = [];
            $productStockUpdates = [];
            
            // Check product availability and calculate total
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                // Check if product is active
                if (!$product->is_active) {
                    throw new \Exception("Product '{$product->name}' is not available");
                }
                
                // Check if enough stock is available
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Not enough stock available for product '{$product->name}'");
                }
                
                // Calculate item total
                $itemTotal = $product->price * $item['quantity'];
                $totalAmount += $itemTotal;
                
                // Prepare order item data
                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price_at_purchase' => $product->price,
                    'product_name_at_purchase' => $product->name,
                ];
                
                // Prepare stock update
                $productStockUpdates[$product->id] = $product->stock_quantity - $item['quantity'];
            }
            
            // Generate unique order number
            $orderNumber = 'ORD-' . strtoupper(Str::random(10));
            
            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'pending',
                'shipping_address_line1' => $validated['shipping_address_line1'],
                'shipping_address_line2' => $validated['shipping_address_line2'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_postal_code' => $validated['shipping_postal_code'],
                'shipping_country' => $validated['shipping_country'],
                'billing_address_line1' => $validated['billing_address_line1'],
                'billing_address_line2' => $validated['billing_address_line2'],
                'billing_city' => $validated['billing_city'],
                'billing_postal_code' => $validated['billing_postal_code'],
                'billing_country' => $validated['billing_country'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
                'ordered_at' => now(),
            ]);
            
            // Create order items
            foreach ($orderItems as $item) {
                $order->items()->create($item);
                
                // Update product stock
                Product::where('id', $item['product_id'])
                    ->update(['stock_quantity' => $productStockUpdates[$item['product_id']]]);
            }
            
            // Load relationships
            $order->load('items.product');
            
            return response()->json([
                'message' => 'Order created successfully',
                'order' => new OrderResource($order),
            ], 201);
        });
    }

    /**
     * Display the specified order.
     *
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Order $order)
    {
        $this->authorize('view', $order);
        
        $order->load('items.product', 'user');
        
        return response()->json(new OrderResource($order));
    }

    /**
     * Update order status (admin only).
     *
     * @param  \App\Http\Requests\OrderStatusUpdateRequest  $request
     * @param  \App\Models\Order  $order
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(OrderStatusUpdateRequest $request, Order $order)
    {
        $validated = $request->validated();
        
        $order->update($validated);
        
        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => new OrderResource($order),
        ]);
    }
}
