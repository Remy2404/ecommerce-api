<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateProduct extends Command
{
    protected $signature = 'product:create {name} {price} {stock_quantity} {category_id?} {description?} {image_url?}';
    protected $description = 'Create a new product';

    public function handle()
    {
        try {
            // Prepare data
            $data = [
                'name' => $this->argument('name'),
                'slug' => Str::slug($this->argument('name')),
                'price' => $this->argument('price'),
                'stock_quantity' => $this->argument('stock_quantity'),
                'is_active' => true
            ];

            // Add optional fields if provided
            if ($this->argument('category_id')) {
                $data['category_id'] = $this->argument('category_id');
            }

            if ($this->argument('description')) {
                $data['description'] = $this->argument('description');
            }

            if ($this->argument('image_url')) {
                $data['image_url'] = $this->argument('image_url');
            }

            // Check if slug exists and make unique if needed
            $originalSlug = $data['slug'];
            $count = 0;
            while (Product::where('slug', $data['slug'])->exists()) {
                $count++;
                $data['slug'] = $originalSlug . '-' . $count;
            }

            $this->info("Creating product with data:");
            $this->table(
                ['Field', 'Value'],
                collect($data)->map(function ($value, $key) {
                    return [$key, is_bool($value) ? ($value ? 'true' : 'false') : $value];
                })->toArray()
            );

            // Create product
            $product = Product::create($data);

            if ($product && $product->exists) {
                $this->info("Product created successfully with ID: " . $product->id);
                return 0;
            } else {
                $this->error("Failed to create product");
                return 1;
            }
        } catch (\Exception $e) {
            $this->error("Error creating product: " . $e->getMessage());
            $this->line("Stack trace: " . $e->getTraceAsString());
            return 1;
        }
    }
}
