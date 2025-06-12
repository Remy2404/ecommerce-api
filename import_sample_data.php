<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "Starting to import sample data...\n";
    
    // Read the SQL file
    $sqlFile = file_get_contents('database/sql/sample_data.sql');
    
    // Remove comments and empty lines for cleaner execution
    $sqlCommands = array_filter(
        explode(';', $sqlFile),
        function($sql) {
            $sql = trim($sql);
            return !empty($sql) && !str_starts_with($sql, '--') && !str_starts_with($sql, '#');
        }
    );
    
    // Execute each SQL command
    foreach ($sqlCommands as $sql) {
        $sql = trim($sql);
        if (!empty($sql)) {
            try {
                DB::statement($sql);
                if (str_contains(strtolower($sql), 'insert into')) {
                    $table = '';
                    if (preg_match('/insert into\s+(\w+)/i', $sql, $matches)) {
                        $table = $matches[1];
                    }
                    echo "✓ Inserted data into $table\n";
                }
            } catch (Exception $e) {
                if (!str_contains($e->getMessage(), 'Duplicate entry')) {
                    echo "Warning: " . $e->getMessage() . "\n";
                }
            }
        }
    }
    
    echo "\n=== IMPORT COMPLETED ===\n";
    
    // Verify the data
    echo "Data verification:\n";
    echo "Categories: " . DB::table('categories')->count() . "\n";
    echo "Products: " . DB::table('products')->count() . "\n";
    echo "Product Images: " . DB::table('product_images')->count() . "\n";
    echo "Tags: " . DB::table('tags')->count() . "\n";
    echo "Product-Tag Relations: " . DB::table('product_tag')->count() . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
