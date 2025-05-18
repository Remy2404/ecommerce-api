<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all subcategories
        $categories = Category::whereNotNull('parent_id')->get();
        
        foreach ($categories as $category) {
            // Create 5 products for each subcategory
            for ($i = 1; $i <= 5; $i++) {
                $name = "Product {$i} in {$category->name}";
                Product::create([
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'description' => "This is product {$i} in the {$category->name} category. " . 
                                     "It belongs to the {$category->parent->name} department.",
                    'price' => rand(999, 99999) / 100, // Random price between 9.99 and 999.99
                    'stock_quantity' => rand(10, 100),
                    'category_id' => $category->id,
                    'image_url' => "https://picsum.photos/id/" . rand(1, 1000) . "/400/300",
                    'is_active' => true,
                ]);
            }
        }
    }
}
