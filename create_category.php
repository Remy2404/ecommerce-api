<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Create a new category
$category = new \App\Models\Category();
$category->name = 'Electronics';
$category->slug = 'electronics';
$category->description = 'Electronic items';
$saved = $category->save();

echo "Category saved: " . ($saved ? 'Yes' : 'No') . "\n";
echo "Category ID: " . $category->id . "\n";

// List categories
$categories = \App\Models\Category::all();
echo "All categories:\n";
foreach ($categories as $cat) {
    echo "- {$cat->id}: {$cat->name} ({$cat->slug})\n";
}
