<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CategoryCollection;
use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $categories = Category::with('subcategories')->whereNull('parent_id')->get();
        
        return response()->json(new CategoryCollection($categories));
    }

    /**
     * Store a newly created category in storage.
     *
     * @param  \App\Http\Requests\CategoryStoreRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CategoryStoreRequest $request)
    {
        $validated = $request->validated();

        // Generate slug from name
        $validated['slug'] = Str::slug($request->name);
        
        // Check if slug already exists and make it unique if needed
        $slug = $validated['slug'];
        $count = 0;
        while (Category::where('slug', $validated['slug'])->exists()) {
            $count++;
            $validated['slug'] = $slug . '-' . $count;
        }

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'category' => new CategoryResource($category),
        ], 201);
    }

    /**
     * Display the specified category.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Category $category)
    {
        $category->load('subcategories');
        
        return response()->json(new CategoryResource($category));
    }

    /**
     * Update the specified category in storage.
     *
     * @param  \App\Http\Requests\CategoryUpdateRequest  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(CategoryUpdateRequest $request, Category $category)
    {
        $validated = $request->validated();

        // Prevent a category from being its own parent or descendant
        if (isset($validated['parent_id'])) {
            if ($validated['parent_id'] == $category->id) {
                return response()->json([
                    'message' => 'A category cannot be its own parent',
                    'errors' => ['parent_id' => ['A category cannot be its own parent']]
                ], 422);
            }
            
            // Check if parent_id is a descendant of this category
            $currentParent = Category::find($validated['parent_id']);
            while ($currentParent && $currentParent->parent_id) {
                if ($currentParent->parent_id == $category->id) {
                    return response()->json([
                        'message' => 'A category cannot be a parent of its ancestor',
                        'errors' => ['parent_id' => ['A category cannot be a parent of its ancestor']]
                    ], 422);
                }
                $currentParent = $currentParent->parent;
            }
        }

        // Update slug if name is changed
        if ($request->has('name') && $request->name !== $category->name) {
            $slug = Str::slug($request->name);
            
            // Check if slug already exists and make it unique if needed
            $count = 0;
            $baseSlug = $slug;
            while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $count++;
                $slug = $baseSlug . '-' . $count;
            }
            
            $validated['slug'] = $slug;
        }

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => new CategoryResource($category),
        ]);
    }

    /**
     * Remove the specified category from storage.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Category $category)
    {
        // Check if category has products
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with associated products',
                'errors' => ['category' => ['This category has products and cannot be deleted']]
            ], 422);
        }

        // Check if category has subcategories
        if ($category->subcategories()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with subcategories',
                'errors' => ['category' => ['This category has subcategories and cannot be deleted']]
            ], 422);
        }
        
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}
