<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Hash;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone_number' => '1234567890',
            'address_line1' => '123 Test St',
            'city' => 'Test City',
            'postal_code' => '12345',
            'country' => 'Test Country'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'user' => [
                             'id',
                             'name',
                             'email',
                             'is_admin',
                             'created_at',
                             'profile'
                         ],
                         'token' => [
                             'access_token',
                             'token_type'
                         ]
                     ]
                 ]);

        // Check that user and profile are created
        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'test@example.com'
        ]);

        $this->assertDatabaseHas('user_profiles', [
            'phone_number' => '1234567890',
            'address_line1' => '123 Test St',
            'city' => 'Test City'
        ]);
    }

    public function test_user_can_login()
    {
        // Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123')
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/login', $loginData);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'user' => [
                             'id',
                             'name',
                             'email',
                             'is_admin',
                             'created_at'
                         ],
                         'token' => [
                             'access_token',
                             'token_type'
                         ]
                     ]
                 ]);
    }

    public function test_user_can_logout()
    {
        // Create a user
        $user = User::factory()->create();

        // Create a token for the user
        $token = $user->createToken('test-token')->plainTextToken;

        // Make a logout request with the token
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'Logged out successfully',
                     'data' => null
                 ]);

        // Check that the token is no longer valid
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        // Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123')
        ]);

        // Try to login with wrong password
        $loginData = [
            'email' => 'test@example.com',
            'password' => 'wrongpassword'
        ];

        $response = $this->postJson('/api/login', $loginData);

        $response->assertStatus(401)
                 ->assertJson([
                     'status' => 'error',
                     'message' => 'The provided credentials are incorrect',
                 ]);
    }

    public function test_authenticated_user_can_get_their_details()
    {
        // Create a user
        $user = User::factory()->create();

        // Create a profile for the user
        UserProfile::factory()->create([
            'user_id' => $user->id
        ]);

        // Create a token for the user
        $token = $user->createToken('test-token')->plainTextToken;

        // Make a request to get user details with the token
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                         ->getJson('/api/user');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         'user' => [
                             'id',
                             'name',
                             'email',
                             'is_admin',
                             'created_at',
                             'profile'
                         ]
                     ]
                 ]);
    }
}
