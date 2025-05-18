<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_all_products()
    {
        // Create a category
        $category = Category::factory()->create();
        
        // Create 5 products
        Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'is_active' => true
        ]);

        // Make a request to get all products
        $response = $this->getJson('/api/products');

        // Check response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'slug',
                             'description',
                             'price',
                             'stock_quantity',
                             'category_id',
                             'image_url',
                             'is_active',
                             'created_at',
                             'updated_at',
                         ]
                     ],
                     'links',
                     'meta',
                 ]);
    }

    public function test_can_get_single_product()
    {
        // Create a category
        $category = Category::factory()->create();
        
        // Create a product
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'is_active' => true
        ]);

        // Make a request to get the product
        $response = $this->getJson('/api/products/' . $product->id);

        // Check response
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'name',
                         'slug',
                         'description',
                         'price',
                         'stock_quantity',
                         'category_id',
                         'image_url',
                         'is_active',
                         'created_at',
                         'updated_at',
                     ]
                 ]);
    }

    public function test_cannot_get_inactive_product()
    {
        // Create a category
        $category = Category::factory()->create();
        
        // Create an inactive product
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'is_active' => false
        ]);

        // Make a request to get the product
        $response = $this->getJson('/api/products/' . $product->id);

        // Check that we get a 404
        $response->assertStatus(404);
    }

    public function test_admin_can_create_product()
    {
        // Create an admin user
        $admin = User::factory()->create([
            'is_admin' => true
        ]);

        // Create a category
        $category = Category::factory()->create();

        // Product data
        $productData = [
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'price' => 99.99,
            'stock_quantity' => 100,
            'category_id' => $category->id,
            'is_active' => true
        ];

        // Make a request as admin to create a product
        $response = $this->actingAs($admin)
                         ->postJson('/api/products', $productData);

        // Check response
        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'name' => 'Test Product',
                     'description' => 'This is a test product',
                     'price' => '99.99',
                     'stock_quantity' => 100
                 ]);

        // Check database
        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'description' => 'This is a test product'
        ]);
    }

    public function test_non_admin_cannot_create_product()
    {
        // Create a regular user
        $user = User::factory()->create([
            'is_admin' => false
        ]);

        // Create a category
        $category = Category::factory()->create();

        // Product data
        $productData = [
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'price' => 99.99,
            'stock_quantity' => 100,
            'category_id' => $category->id,
            'is_active' => true
        ];

        // Make a request as regular user to create a product
        $response = $this->actingAs($user)
                         ->postJson('/api/products', $productData);

        // Check that we get a 403
        $response->assertStatus(403);

        // Check that no product was created
        $this->assertDatabaseMissing('products', [
            'name' => 'Test Product'
        ]);
    }
}
