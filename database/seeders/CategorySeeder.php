<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'description' => 'Electronic devices and gadgets',
                'subcategories' => [
                    [
                        'name' => 'Smartphones',
                        'description' => 'Mobile phones and accessories',
                    ],
                    [
                        'name' => 'Laptops',
                        'description' => 'Notebook computers and accessories',
                    ],
                    [
                        'name' => 'Tablets',
                        'description' => 'Tablet computers and accessories',
                    ],
                ],
            ],
            [
                'name' => 'Clothing',
                'description' => 'Apparel and fashion items',
                'subcategories' => [
                    [
                        'name' => 'Men',
                        'description' => 'Men\'s clothing and accessories',
                    ],
                    [
                        'name' => 'Women',
                        'description' => 'Women\'s clothing and accessories',
                    ],
                    [
                        'name' => 'Kids',
                        'description' => 'Children\'s clothing and accessories',
                    ],
                ],
            ],
            [
                'name' => 'Books',
                'description' => 'Books, e-books, and publications',
                'subcategories' => [
                    [
                        'name' => 'Fiction',
                        'description' => 'Novels and fictional stories',
                    ],
                    [
                        'name' => 'Non-Fiction',
                        'description' => 'Educational and informational books',
                    ],
                    [
                        'name' => 'Academic',
                        'description' => 'Textbooks and scholarly publications',
                    ],
                ],
            ],
            [
                'name' => 'Home & Kitchen',
                'description' => 'Home appliances and kitchen essentials',
                'subcategories' => [
                    [
                        'name' => 'Appliances',
                        'description' => 'Home and kitchen appliances',
                    ],
                    [
                        'name' => 'Furniture',
                        'description' => 'Home and office furniture',
                    ],
                    [
                        'name' => 'Cookware',
                        'description' => 'Cooking utensils and kitchenware',
                    ],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $subcategories = $categoryData['subcategories'] ?? [];
            unset($categoryData['subcategories']);
            
            $categoryData['slug'] = Str::slug($categoryData['name']);
            $category = Category::create($categoryData);
            
            foreach ($subcategories as $subcategoryData) {
                $subcategoryData['slug'] = Str::slug($subcategoryData['name']);
                $subcategoryData['parent_id'] = $category->id;
                Category::create($subcategoryData);
            }
        }
    }
}
