<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Http\Resources\ProductCollection;
use Illuminate\Http\Request;

class CategoryProductController extends Controller
{
    /**
     * Display a listing of the products for a specific category.
     *
     * @param  \App\Models\Category  $category
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Category $category, Request $request)
    {
        $query = $category->products();

        // Include products from subcategories if requested
        if ($request->input('include_subcategories', false)) {
            // Get all subcategory ids recursively
            $subcategoryIds = $this->getAllSubcategoryIds($category);
            
            if (!empty($subcategoryIds)) {
                $query = Product::where(function ($q) use ($category, $subcategoryIds) {
                    $q->where('category_id', $category->id)
                      ->orWhereIn('category_id', $subcategoryIds);
                });
            }
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

        // Only active products for regular users
        if (!$request->user() || !$request->user()->is_admin) {
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
        $products = $query->paginate($perPage);

        return response()->json(new ProductCollection($products));
    }

    /**
     * Recursively get all subcategory IDs for a category
     * 
     * @param  \App\Models\Category  $category
     * @return array
     */
    private function getAllSubcategoryIds(Category $category)
    {
        $subcategoryIds = [];
        
        foreach ($category->subcategories as $subcategory) {
            $subcategoryIds[] = $subcategory->id;
            $subcategoryIds = array_merge($subcategoryIds, $this->getAllSubcategoryIds($subcategory));
        }
        
        return $subcategoryIds;
    }
}
