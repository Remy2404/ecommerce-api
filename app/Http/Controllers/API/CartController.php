<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get the current user's cart
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $user = $request->user();

        // Get or create cart
        $cart = $user->cart;
        if (!$cart) {
            $cart = Cart::create([
                'user_id' => $user->id
            ]);
        }

        // Load cart items with product information
        $cart->load('items.product');

        // Calculate totals
        $totalItems = $cart->items->sum('quantity');
        $subtotal = $cart->items->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });

        return $this->successResponse([
            'cart' => [
                'id' => $cart->id,
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'product_slug' => $item->product->slug,
                        'price' => $item->product->price,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->quantity * $item->product->price,
                        'image_url' => $item->product->image_url
                    ];
                }),
                'total_items' => $totalItems,
                'subtotal' => $subtotal
            ]
        ], 'Cart retrieved successfully');
    }

    /**
     * Add item to cart
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:10'
        ]);

        $user = $request->user();
        $productId = $request->product_id;
        $quantity = $request->quantity;

        // Check if product is active and in stock
        $product = Product::findOrFail($productId);
        if (!$product->is_active) {
            return $this->errorResponse("Product is not available", 400);
        }

        if ($product->stock_quantity < $quantity) {
            return $this->errorResponse("Not enough stock available. Only {$product->stock_quantity} item(s) left.", 400);
        }

        // Get or create cart
        $cart = $user->cart;
        if (!$cart) {
            $cart = Cart::create([
                'user_id' => $user->id
            ]);
        }

        // Check if item already exists in cart
        $cartItem = $cart->items()->where('product_id', $productId)->first();

        DB::beginTransaction();
        try {
            if ($cartItem) {
                // Update quantity if item already exists
                $newQuantity = $cartItem->quantity + $quantity;
                
                // Check if the new quantity is within stock limits
                if ($newQuantity > $product->stock_quantity) {
                    return $this->errorResponse("Cannot add more items. Only {$product->stock_quantity} in stock.", 400);
                }
                
                $cartItem->update(['quantity' => $newQuantity]);
            } else {
                // Create new cart item
                $cartItem = CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $productId,
                    'quantity' => $quantity
                ]);
            }
            
            DB::commit();
            
            // Load updated cart
            $cart->load('items.product');
            
            // Calculate totals
            $totalItems = $cart->items->sum('quantity');
            $subtotal = $cart->items->sum(function ($item) {
                return $item->quantity * $item->product->price;
            });
            
            return $this->successResponse([
                'cart' => [
                    'id' => $cart->id,
                    'items' => $cart->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->name,
                            'product_slug' => $item->product->slug,
                            'price' => $item->product->price,
                            'quantity' => $item->quantity,
                            'subtotal' => $item->quantity * $item->product->price,
                            'image_url' => $item->product->image_url
                        ];
                    }),
                    'total_items' => $totalItems,
                    'subtotal' => $subtotal
                ]
            ], 'Item added to cart successfully', 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error adding item to cart: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update cart item
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateItem(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:10'
        ]);

        $user = $request->user();
        $cart = $user->cart;
        
        if (!$cart) {
            return $this->errorResponse('Cart not found', 404);
        }

        $cartItem = CartItem::find($id);
        
        if (!$cartItem || $cartItem->cart_id !== $cart->id) {
            return $this->errorResponse('Cart item not found', 404);
        }

        $product = $cartItem->product;
        
        if ($request->quantity > $product->stock_quantity) {
            return $this->errorResponse("Cannot update quantity. Only {$product->stock_quantity} in stock.", 400);
        }

        $cartItem->update(['quantity' => $request->quantity]);
        
        // Load updated cart
        $cart->load('items.product');
        
        // Calculate totals
        $totalItems = $cart->items->sum('quantity');
        $subtotal = $cart->items->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });
        
        return $this->successResponse([
            'cart' => [
                'id' => $cart->id,
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'product_slug' => $item->product->slug,
                        'price' => $item->product->price,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->quantity * $item->product->price,
                        'image_url' => $item->product->image_url
                    ];
                }),
                'total_items' => $totalItems,
                'subtotal' => $subtotal
            ]
        ], 'Cart item updated successfully');
    }

    /**
     * Remove item from cart
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeItem(Request $request, $id)
    {
        $user = $request->user();
        $cart = $user->cart;
        
        if (!$cart) {
            return $this->errorResponse('Cart not found', 404);
        }

        $cartItem = CartItem::find($id);
        
        if (!$cartItem || $cartItem->cart_id !== $cart->id) {
            return $this->errorResponse('Cart item not found', 404);
        }

        $cartItem->delete();
        
        // Load updated cart
        $cart->load('items.product');
        
        // Calculate totals
        $totalItems = $cart->items->sum('quantity');
        $subtotal = $cart->items->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });
        
        return $this->successResponse([
            'cart' => [
                'id' => $cart->id,
                'items' => $cart->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'product_slug' => $item->product->slug,
                        'price' => $item->product->price,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->quantity * $item->product->price,
                        'image_url' => $item->product->image_url
                    ];
                }),
                'total_items' => $totalItems,
                'subtotal' => $subtotal
            ]
        ], 'Cart item removed successfully');
    }

    /**
     * Clear the cart
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function clear(Request $request)
    {
        $user = $request->user();
        $cart = $user->cart;
        
        if (!$cart) {
            return $this->errorResponse('Cart not found', 404);
        }

        // Delete all cart items
        $cart->items()->delete();
        
        return $this->successResponse([
            'cart' => [
                'id' => $cart->id,
                'items' => [],
                'total_items' => 0,
                'subtotal' => 0
            ]
        ], 'Cart cleared successfully');
    }
}
