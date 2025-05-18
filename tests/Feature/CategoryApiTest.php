<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Category;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_all_categories()
    {
        // Create 3 categories
        Category::factory()->count(3)->create();

        // Make a request to get all categories
        $response = $this->getJson('/api/categories');

        // Check response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'slug',
                             'description',
                             'parent_id',
                             'created_at',
                             'updated_at',
                         ]
                     ]
                 ]);
    }

    public function test_can_get_single_category()
    {
        // Create a category
        $category = Category::factory()->create();

        // Make a request to get the category
        $response = $this->getJson('/api/categories/' . $category->id);

        // Check response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'name',
                         'slug',
                         'description',
                         'parent_id',
                         'created_at',
                         'updated_at',
                     ]
                 ]);
    }

    public function test_admin_can_create_category()
    {
        // Create an admin user
        $admin = User::factory()->create([
            'is_admin' => true
        ]);

        // Category data
        $categoryData = [
            'name' => 'Test Category',
            'description' => 'This is a test category',
            'parent_id' => null
        ];

        // Make a request as admin to create a category
        $response = $this->actingAs($admin)
                         ->postJson('/api/categories', $categoryData);

        // Check response
        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'name' => 'Test Category',
                     'description' => 'This is a test category'
                 ]);

        // Check database
        $this->assertDatabaseHas('categories', [
            'name' => 'Test Category',
            'description' => 'This is a test category'
        ]);
    }

    public function test_non_admin_cannot_create_category()
    {
        // Create a regular user
        $user = User::factory()->create([
            'is_admin' => false
        ]);

        // Category data
        $categoryData = [
            'name' => 'Test Category',
            'description' => 'This is a test category',
            'parent_id' => null
        ];

        // Make a request as regular user to create a category
        $response = $this->actingAs($user)
                         ->postJson('/api/categories', $categoryData);

        // Check that we get a 403
        $response->assertStatus(403);

        // Check that no category was created
        $this->assertDatabaseMissing('categories', [
            'name' => 'Test Category'
        ]);
    }

    public function test_admin_can_create_subcategory()
    {
        // Create an admin user
        $admin = User::factory()->create([
            'is_admin' => true
        ]);

        // Create a parent category
        $parentCategory = Category::factory()->create([
            'name' => 'Parent Category'
        ]);

        // Subcategory data
        $subcategoryData = [
            'name' => 'Subcategory',
            'description' => 'This is a subcategory',
            'parent_id' => $parentCategory->id
        ];

        // Make a request as admin to create a subcategory
        $response = $this->actingAs($admin)
                         ->postJson('/api/categories', $subcategoryData);

        // Check response
        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'name' => 'Subcategory',
                     'description' => 'This is a subcategory',
                     'parent_id' => $parentCategory->id
                 ]);

        // Check database
        $this->assertDatabaseHas('categories', [
            'name' => 'Subcategory',
            'description' => 'This is a subcategory',
            'parent_id' => $parentCategory->id
        ]);
    }
}
