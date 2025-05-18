<?php

namespace App\Console\Commands;

use App\Models\Category;
use Illuminate\Console\Command;

class CreateCategory extends Command
{
    protected $signature = 'category:create {name} {slug} {description?}';
    protected $description = 'Create a new category';

    public function handle()
    {
        $category = new Category();
        $category->name = $this->argument('name');
        $category->slug = $this->argument('slug');
        $category->description = $this->argument('description');
        
        $saved = $category->save();
        
        if ($saved) {
            $this->info("Category created successfully with ID: " . $category->id);
        } else {
            $this->error("Failed to create category");
        }
        
        return $saved ? 0 : 1;
    }
}
