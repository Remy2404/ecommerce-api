<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Resources\ProductCollection;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponseTrait;

    /**
     * Search for products based on query string
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function products(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2|max:50',
            'category_id' => 'nullable|exists:categories,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'sort_by' => 'nullable|in:name,price,created_at',
            'sort_direction' => 'nullable|in:asc,desc',
            'per_page' => 'nullable|integer|min:5|max:50'
        ]);

        $query = Product::query();
        
        // Only include active products for non-admin users
        if (!$request->user() || !$request->user()->is_admin) {
            $query->where('is_active', true);
        }

        // Search query
        $searchTerm = $request->q;
        $query->where(function ($q) use ($searchTerm) {
            $q->where('name', 'like', "%{$searchTerm}%")
              ->orWhere('description', 'like', "%{$searchTerm}%")
              ->orWhere('sku', 'like', "%{$searchTerm}%");
        });

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

        return $this->successResponse(
            new ProductCollection($products),
            'Search results retrieved successfully'
        );
    }
}
