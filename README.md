# Ecommerce API

A RESTful API for an Ecommerce platform built with Laravel.

## Features

-   Full CRUD operations for users, products, categories, and orders
-   Authentication using Laravel Sanctum
-   Role-based authorization (admin/user)
-   Robust validation and error handling
-   Comprehensive API documentation
-   Database migrations and seeders
-   Feature tests
-   Shopping cart functionality
-   Product tags and search capabilities

## Requirements

-   PHP 8.1 or higher
-   Composer
-   MySQL or PostgreSQL

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ecommerce-api.git
cd ecommerce-api
```

2. Install dependencies:

```bash
composer install
```

3. Create a copy of the `.env.example` file:

```bash
cp .env.example .env
```

4. Generate an application key:

```bash
php artisan key:generate
```

5. Configure your database settings in the `.env` file:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_api
DB_USERNAME=root
DB_PASSWORD=
```

6. Run the migrations and seed the database:

```bash
php artisan migrate --seed
```

7. Start the development server:

```bash
php artisan serve
```

## API Documentation

The API is available at `http://localhost:8000/api`.

### Authentication Endpoints

-   **POST /api/register** - Register a new user
-   **POST /api/login** - Log in an existing user
-   **POST /api/logout** - Log out a user (requires authentication)
-   **GET /api/user** - Get authenticated user details (requires authentication)

### Product Endpoints

-   **GET /api/products** - List all products (public)
-   **GET /api/products/{product}** - Get a specific product (public)
-   **POST /api/products** - Create a product (admin only)
-   **PUT /api/products/{product}** - Update a product (admin only)
-   **DELETE /api/products/{product}** - Delete a product (admin only)
-   **GET /api/search/products?q={query}** - Search products (public)

### Product Tags

-   **GET /api/products/{id}/tags** - Get all tags for a product (public)
-   **POST /api/products/{id}/tags** - Attach tags to a product (admin only)
-   **PUT /api/products/{id}/tags** - Update (sync) tags for a product (admin only)
-   **DELETE /api/products/{id}/tags/{tagId}** - Remove a tag from a product (admin only)

### Category Endpoints

-   **GET /api/categories** - List all categories (public)
-   **GET /api/categories/{category}** - Get a specific category (public)
-   **GET /api/categories/{category}/products** - Get products in a category (public)
-   **POST /api/categories** - Create a category (admin only)
-   **PUT /api/categories/{category}** - Update a category (admin only)
-   **DELETE /api/categories/{category}** - Delete a category (admin only)

### Tag Endpoints

-   **GET /api/tags** - List all tags (public)
-   **GET /api/tags/{tag}** - Get a specific tag (public)
-   **POST /api/tags** - Create a tag (admin only)
-   **PUT /api/tags/{tag}** - Update a tag (admin only)
-   **DELETE /api/tags/{tag}** - Delete a tag (admin only)
-   **GET /api/tags/{tag}/products** - Get products with a tag (public)

### Cart Endpoints

-   **GET /api/cart** - Get the current user's cart (auth required)
-   **POST /api/cart/items** - Add item to cart (auth required)
-   **PUT /api/cart/items/{id}** - Update cart item (auth required)
-   **DELETE /api/cart/items/{id}** - Remove item from cart (auth required)
-   **DELETE /api/cart** - Clear the cart (auth required)

### Order Endpoints

-   **GET /api/my-orders** - List user's orders (requires authentication)
-   **GET /api/orders** - List all orders (admin only)
-   **GET /api/orders/{order}** - Get a specific order (owner or admin)
-   **POST /api/orders** - Create an order (requires authentication)
-   **PUT /api/orders/{order}/status** - Update order status (admin only)

## Default Users

After seeding the database, the following users will be available:

-   Admin:

    -   Email: admin@example.com
    -   Password: password

-   Regular User:
    -   Email: user@example.com
    -   Password: password

## Testing with Postman

### Setting up Postman Environment

1. Create a new environment in Postman called "Ecommerce API"
2. Add the following variables:
   - `base_url`: `http://localhost:8000`
   - `api_url`: `{{base_url}}/api`
   - `auth_token`: (will be set after login)

### Step-by-Step API Testing Guide

#### 1. User Registration

**POST** `{{api_url}}/register`

Headers:
```
Content-Type: application/json
Accept: application/json
```

Body (JSON):
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

Expected Response:
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "is_admin": false,
            "created_at": "2025-06-13T10:00:00.000000Z"
        },
        "token": "1|abc123...xyz789"
    }
}
```

**Test Script** (Add to Postman Tests tab):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("auth_token", response.data.token);
    }
}
```

#### 2. User Login

**POST** `{{api_url}}/login`

Headers:
```
Content-Type: application/json
Accept: application/json
```

Body (JSON):
```json
{
    "email": "admin@example.com",
    "password": "password"
}
```

Expected Response:
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com",
            "is_admin": true
        },
        "token": "2|def456...uvw012"
    }
}
```

**Test Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("auth_token", response.data.token);
    }
}
```

#### 3. Get Authenticated User

**GET** `{{api_url}}/user`

Headers:
```
Accept: application/json
Authorization: Bearer {{auth_token}}
```

#### 4. Create a Category (Admin Required)

**POST** `{{api_url}}/categories`

Headers:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}
```

Body (JSON):
```json
{
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic devices and gadgets"
}
```

#### 5. Create a Product (Admin Required)

**POST** `{{api_url}}/products`

Headers:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}
```

Body (JSON):
```json
{
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro",
    "description": "Latest iPhone with advanced features",
    "price": 999.99,
    "stock_quantity": 50,
    "category_id": 1,
    "image_url": "https://example.com/iphone15.jpg"
}
```

#### 6. Get All Products (Public)

**GET** `{{api_url}}/products`

Headers:
```
Accept: application/json
```

Query Parameters (optional):
- `page`: 1
- `per_page`: 15
- `category_id`: 1
- `search`: "iPhone"

#### 7. Search Products

**GET** `{{api_url}}/search/products?q=iPhone`

Headers:
```
Accept: application/json
```

#### 8. Add Item to Cart

**POST** `{{api_url}}/cart/items`

Headers:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}
```

Body (JSON):
```json
{
    "product_id": 1,
    "quantity": 2
}
```

#### 9. Get User's Cart

**GET** `{{api_url}}/cart`

Headers:
```
Accept: application/json
Authorization: Bearer {{auth_token}}
```

#### 10. Create an Order

**POST** `{{api_url}}/orders`

Headers:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}
```

Body (JSON):
```json
{
    "shipping_address": "123 Main St, City, State 12345",
    "billing_address": "123 Main St, City, State 12345"
}
```

#### 11. Get User's Orders

**GET** `{{api_url}}/my-orders`

Headers:
```
Accept: application/json
Authorization: Bearer {{auth_token}}
```

#### 12. Create and Attach Tags to Product

**POST** `{{api_url}}/tags`

Headers:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}
```

Body (JSON):
```json
{
    "name": "Premium",
    "slug": "premium"
}
```

**POST** `{{api_url}}/products/1/tags`

Headers:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}
```

Body (JSON):
```json
{
    "tag_ids": [1, 2, 3]
}
```

#### 13. Update Order Status (Admin Only)

**PUT** `{{api_url}}/orders/1/status`

Headers:
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {{auth_token}}
```

Body (JSON):
```json
{
    "status": "shipped"
}
```

#### 14. Logout

**POST** `{{api_url}}/logout`

Headers:
```
Accept: application/json
Authorization: Bearer {{auth_token}}
```

### Postman Collection Import

You can create a Postman collection with all these requests. Here's a sample collection structure:

```json
{
    "info": {
        "name": "Ecommerce API",
        "description": "Complete API testing collection for Laravel Ecommerce API"
    },
    "variable": [
        {
            "key": "base_url",
            "value": "http://localhost:8000"
        },
        {
            "key": "api_url",
            "value": "{{base_url}}/api"
        }
    ]
}
```

### Testing Scenarios

#### Complete User Journey Test:
1. Register a new user
2. Login with the user
3. Browse products
4. Add products to cart
5. Create an order
6. View order history

#### Admin Workflow Test:
1. Login as admin
2. Create categories
3. Create products
4. Create tags and attach to products
5. View all orders
6. Update order statuses

### Error Testing

Test these error scenarios:

1. **Unauthorized Access**: Try accessing protected endpoints without token
2. **Invalid Data**: Send malformed JSON or missing required fields
3. **Not Found**: Request non-existent resources
4. **Validation Errors**: Send invalid email formats, short passwords, etc.

Example error response:
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

### Response Status Codes

- `200`: Success (GET, PUT requests)
- `201`: Created (POST requests)
- `204`: No Content (DELETE requests)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `422`: Unprocessable Entity (validation errors)
- `500`: Internal Server Error

## Automated Testing

Run the automated test suite with:

```bash
php artisan test
```

For specific test types:
```bash
# Run feature tests only
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/AuthTest.php
```

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
