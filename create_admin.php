<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Hash;

// Create admin user
$admin = User::create([
    'name' => 'Admin User',
    'email' => 'rosexmee1122@gmail.com',
    'password' => Hash::make('Ramy2404RM$*1'),
    'is_admin' => true,
]);

UserProfile::create([
    'user_id' => $admin->id,
    'phone_number' => '1234567890',
    'address_line1' => 'Admin Address',
    'city' => 'Admin City',
    'postal_code' => '12345',
    'country' => 'Admin Country',
]);

echo "Admin user created with ID: " . $admin->id . "\n";

