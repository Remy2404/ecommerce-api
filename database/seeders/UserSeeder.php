<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_admin' => true,
        ]);

        UserProfile::create([
            'user_id' => $admin->id,
            'phone_number' => '1234567890',
            'address_line1' => '123 Admin Street',
            'city' => 'Admin City',
            'postal_code' => '12345',
            'country' => 'Admin Country',
        ]);

        // Create regular user
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'is_admin' => false,
        ]);

        UserProfile::create([
            'user_id' => $user->id,
            'phone_number' => '0987654321',
            'address_line1' => '456 User Avenue',
            'city' => 'User City',
            'postal_code' => '54321',
            'country' => 'User Country',
        ]);

        // Create additional users
        User::factory(10)->create()->each(function ($user) {
            UserProfile::factory()->create([
                'user_id' => $user->id,
            ]);
        });
    }
}
