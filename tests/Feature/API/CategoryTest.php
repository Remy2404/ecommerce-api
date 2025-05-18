<?php

namespace Tests\Feature\API;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_list_categories(): void
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'description', 'parent_id', 'created_at', 'updated_at'],
                ],
            ]);
    }

    public function test_anyone_can_view_single_category(): void
    {
        $category = Category::factory()->create();

        $response = $this->getJson('/api/categories/' . $category->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id', 'name', 'slug', 'description', 'parent_id', 'created_at', 'updated_at',
            ])
            ->assertJson([
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ]);
    }

    public function test_admin_can_create_category(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('test-token')->plainTextToken;

        $categoryData = [
            'name' => 'Test Category',
            'description' => 'This is a test category',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/categories', $categoryData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'category' => ['id', 'name', 'slug', 'description', 'created_at', 'updated_at'],
            ])
            ->assertJson([
                'message' => 'Category created successfully',
                'category' => [
                    'name' => 'Test Category',
                    'slug' => 'test-category',
                    'description' => 'This is a test category',
                ],
            ]);
        
        $this->assertDatabaseHas('categories', [
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);
    }

    public function test_non_admin_cannot_create_category(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $token = $user->createToken('test-token')->plainTextToken;

        $categoryData = [
            'name' => 'Test Category',
            'description' => 'This is a test category',
        ];

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/categories', $categoryData);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_category(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('test-token')->plainTextToken;
        
        $category = Category::factory()->create();
        
        $updatedData = [
            'name' => 'Updated Category',
            'description' => 'This is an updated description',
        ];
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/categories/' . $category->id, $updatedData);
            
        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'category' => ['id', 'name', 'slug', 'description', 'created_at', 'updated_at'],
            ])
            ->assertJson([
                'message' => 'Category updated successfully',
                'category' => [
                    'name' => 'Updated Category',
                    'slug' => 'updated-category',
                    'description' => 'This is an updated description',
                ],
            ]);
            
        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Updated Category',
            'slug' => 'updated-category',
        ]);
    }

    public function test_admin_can_delete_category(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $token = $admin->createToken('test-token')->plainTextToken;
        
        $category = Category::factory()->create();
        
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/categories/' . $category->id);
            
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Category deleted successfully',
            ]);
            
        $this->assertDatabaseMissing('categories', [
            'id' => $category->id,
        ]);
    }

    public function test_anyone_can_view_products_in_category(): void
    {
        $category = Category::factory()->create();
        $products = \App\Models\Product::factory()->count(5)->create(['category_id' => $category->id]);
        
        $response = $this->getJson('/api/categories/' . $category->id . '/products');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'description', 'price'],
                ],
                'pagination' => [
                    'total', 'count', 'per_page', 'current_page', 'total_pages',
                ],
            ]);
    }
}
