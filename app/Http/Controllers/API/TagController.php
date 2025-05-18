<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TagController extends Controller
{
    use ApiResponseTrait;

    /**
     * Display a listing of the tags.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $tags = Tag::all();
        
        return $this->successResponse($tags, 'Tags retrieved successfully');
    }

    /**
     * Store a newly created tag in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:tags'
        ]);

        // Generate slug from name
        $slug = Str::slug($request->name);
        
        $tag = Tag::create([
            'name' => $request->name,
            'slug' => $slug
        ]);

        return $this->successResponse($tag, 'Tag created successfully', 201);
    }

    /**
     * Display the specified tag.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Tag $tag)
    {
        return $this->successResponse($tag, 'Tag retrieved successfully');
    }

    /**
     * Update the specified tag in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Tag $tag)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:tags,name,' . $tag->id
        ]);

        // Update slug if name changes
        if ($request->name !== $tag->name) {
            $tag->slug = Str::slug($request->name);
        }
        
        $tag->name = $request->name;
        $tag->save();

        return $this->successResponse($tag, 'Tag updated successfully');
    }

    /**
     * Remove the specified tag from storage.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Tag $tag)
    {
        // Check if tag is used by any products
        if ($tag->products()->count() > 0) {
            return $this->errorResponse('Cannot delete tag. It is associated with products.', 422);
        }
        
        $tag->delete();

        return $this->successResponse(null, 'Tag deleted successfully');
    }

    /**
     * Get products with the specified tag.
     *
     * @param  \App\Models\Tag  $tag
     * @return \Illuminate\Http\JsonResponse
     */
    public function products(Tag $tag)
    {
        $products = $tag->products()->where('is_active', true)->paginate(15);
        
        return $this->successResponse($products, 'Tagged products retrieved successfully');
    }
}
