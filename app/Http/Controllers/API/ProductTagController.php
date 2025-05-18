<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ProductTagController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get all tags for a product
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Product $product)
    {
        // Check if product is active for non-admin users
        if (!$product->is_active && (!auth()->user() || !auth()->user()->is_admin)) {
            return $this->errorResponse('Product not found', 404);
        }
        
        $tags = $product->tags;
        
        return $this->successResponse($tags, 'Product tags retrieved successfully');
    }

    /**
     * Attach tags to a product
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'required|exists:tags,id'
        ]);

        $product->tags()->attach($request->tag_ids);
        
        $tags = $product->tags()->get();
        
        return $this->successResponse($tags, 'Tags attached to product successfully');
    }

    /**
     * Sync tags for a product (replacing existing tags)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'required|exists:tags,id'
        ]);

        $product->tags()->sync($request->tag_ids);
        
        $tags = $product->tags()->get();
        
        return $this->successResponse($tags, 'Product tags updated successfully');
    }

    /**
     * Remove a tag from a product
     *
     * @param  \App\Models\Product  $product
     * @param  int  $tagId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Product $product, $tagId)
    {
        $product->tags()->detach($tagId);
        
        $tags = $product->tags()->get();
        
        return $this->successResponse($tags, 'Tag removed from product successfully');
    }
}
