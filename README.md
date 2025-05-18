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

## Testing

Run the tests with:

```bash
php artisan test
```

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
