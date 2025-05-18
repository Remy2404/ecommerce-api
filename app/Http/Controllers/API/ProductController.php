<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductCollection;
use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Product::query();

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Search by name or description
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        // Filter active/inactive products (admin only)
        if ($request->has('is_active') && $request->user() && $request->user()->is_admin) {
            $query->where('is_active', $request->is_active);
        } else {
            // Regular users only see active products
            $query->where('is_active', true);
        }

        // Sort products
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        // Validate sort field to prevent SQL injection
        $allowedSortFields = ['name', 'price', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        }

        // Paginate results
        $perPage = $request->input('per_page', 15);
        $products = $query->with('category')->paginate($perPage);

        return response()->json(new ProductCollection($products));
    }

    /**
     * Store a newly created product in storage.
     *
     * @param  \App\Http\Requests\ProductStoreRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ProductStoreRequest $request)
    {
        try {
            DB::beginTransaction();
            
            $validated = $request->validated();
            Log::info('Validated data for product creation:', $validated);

            // Generate slug from name
            $validated['slug'] = Str::slug($request->name);
            
            // Check if slug already exists and make it unique if needed
            $originalSlug = $validated['slug'];
            $count = 0;
            $currentSlugToCheck = $validated['slug']; 
            while (Product::where('slug', $currentSlugToCheck)->exists()) {
                $count++;
                $currentSlugToCheck = $originalSlug . '-' . $count;
            }
            $validated['slug'] = $currentSlugToCheck;

            Log::info('Data before Product::create():', $validated);

            // Check if category exists if category_id is provided
            if (isset($validated['category_id'])) {
                $categoryExists = \App\Models\Category::where('id', $validated['category_id'])->exists();
                if (!$categoryExists) {
                    Log::warning('Category does not exist: ' . $validated['category_id']);
                    return response()->json([
                        'message' => 'The selected category does not exist',
                        'errors' => ['category_id' => ['The selected category does not exist.']]
                    ], 422);
                }
            }

            $product = Product::create($validated);

            Log::info('Product after Product::create():', $product ? $product->toArray() : ['Product creation failed or returned null']);
            
            if (!$product || !$product->exists) {
                DB::rollBack();
                Log::error('Product creation failed. Product does not exist after create call.', ['validated_input' => $validated]);
                return response()->json([
                    'message' => 'Product creation failed. Could not save to database.',
                ], 500);
            }

            DB::commit();
            Log::info('Product created successfully with ID: ' . $product->id);
            return response()->json([
                'message' => 'Product created successfully',
                'product' => new ProductResource($product),
            ], 201);
            
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database error while creating product: ' . $e->getMessage(), [
                'exception' => $e,
                'sql' => $e->getSql() ?? 'N/A',
                'bindings' => $e->getBindings() ?? []
            ]);
            
            return response()->json([
                'message' => 'Database error while creating product',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating product: ' . $e->getMessage(), ['exception' => $e]);
            
            return response()->json([
                'message' => 'Error creating product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified product.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Product $product)
    {
        // Check if product is active or user is admin
        if (!$product->is_active && (!auth()->user() || !auth()->user()->is_admin)) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        }

        $product->load('category', 'images');
        
        return response()->json(new ProductResource($product));
    }

    /**
     * Update the specified product in storage.
     *
     * @param  \App\Http\Requests\ProductUpdateRequest  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(ProductUpdateRequest $request, Product $product)
    {
        $validated = $request->validated();

        // Update slug if name is changed
        if ($request->has('name') && $request->name !== $product->name) {
            $slug = Str::slug($request->name);
            
            // Check if slug already exists and make it unique if needed
            $count = 0;
            $baseSlug = $slug;
            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $count++;
                $slug = $baseSlug . '-' . $count;
            }
            
            $validated['slug'] = $slug;
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => new ProductResource($product),
        ]);
    }

    /**
     * Remove the specified product from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Product $product)
    {
        // Check if product is used in any orders
        if ($product->orderItems()->exists()) {
            // Instead of deleting, just mark as inactive
            $product->update(['is_active' => false]);
            
            return response()->json([
                'message' => 'Product is used in orders and cannot be deleted. It has been marked as inactive.',
            ]);
        }
        
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
