<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductImageController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display all images for a product.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Product $product)
    {
        $images = $product->images;
        
        return $this->successResponse(
            $images,
            'Product images retrieved successfully'
        );
    }

    /**
     * Store a newly created image for a product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'image_url' => 'required|url',
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // If this is set as primary, remove primary status from other images
        if ($request->is_primary) {
            $product->images()->where('is_primary', true)->update(['is_primary' => false]);
        }

        $image = new ProductImage([
            'image_url' => $request->image_url,
            'alt_text' => $request->alt_text,
            'is_primary' => $request->is_primary ?? false,
        ]);

        $product->images()->save($image);

        return $this->successResponse(
            $image,
            'Product image added successfully',
            201
        );
    }

    /**
     * Update an existing product image.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @param  \App\Models\ProductImage  $image
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Product $product, ProductImage $image)
    {
        // Verify that the image belongs to the product
        if ($image->product_id !== $product->id) {
            return $this->errorResponse(
                'This image does not belong to the specified product',
                403
            );
        }

        $validator = Validator::make($request->all(), [
            'image_url' => 'url',
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // If setting as primary, remove primary status from other images
        if ($request->has('is_primary') && $request->is_primary && !$image->is_primary) {
            $product->images()->where('id', '!=', $image->id)
                ->where('is_primary', true)
                ->update(['is_primary' => false]);
        }

        $image->update($request->only(['image_url', 'alt_text', 'is_primary']));

        return $this->successResponse(
            $image,
            'Product image updated successfully'
        );
    }

    /**
     * Remove a product image.
     *
     * @param  \App\Models\Product  $product
     * @param  \App\Models\ProductImage  $image
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Product $product, ProductImage $image)
    {
        // Verify that the image belongs to the product
        if ($image->product_id !== $product->id) {
            return $this->errorResponse(
                'This image does not belong to the specified product',
                403
            );
        }

        $image->delete();

        return $this->successResponse(
            null,
            'Product image deleted successfully'
        );
    }

    /**
     * Upload a product image to the server.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|max:2048', // 2MB max
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        // If this is set as primary, remove primary status from other images
        if ($request->is_primary) {
            $product->images()->where('is_primary', true)->update(['is_primary' => false]);
        }

        // Store the image
        $path = $request->file('image')->store('product-images', 'public');
        
        // Create the image record
        $image = new ProductImage([
            'image_url' => asset('storage/' . $path),
            'alt_text' => $request->alt_text,
            'is_primary' => $request->is_primary ?? false,
        ]);

        $product->images()->save($image);

        return $this->successResponse(
            $image,
            'Product image uploaded successfully',
            201
        );
    }
}
