<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# Ecommerce API

A RESTful API for an Ecommerce platform built with Laravel.

## Features

- Full CRUD operations for users, products, categories, and orders
- Authentication using Laravel Sanctum
- Role-based authorization (admin/user)
- Robust validation and error handling
- Comprehensive API documentation
- Database migrations and seeders
- Feature tests

## Requirements

- PHP 8.1 or higher
- Composer
- MySQL or PostgreSQL

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

- **POST /api/register** - Register a new user
- **POST /api/login** - Log in an existing user
- **POST /api/logout** - Log out a user (requires authentication)
- **GET /api/user** - Get authenticated user details (requires authentication)

### Product Endpoints

- **GET /api/products** - List all products (public)
- **GET /api/products/{product}** - Get a specific product (public)
- **POST /api/products** - Create a product (admin only)
- **PUT /api/products/{product}** - Update a product (admin only)
- **DELETE /api/products/{product}** - Delete a product (admin only)

### Category Endpoints

- **GET /api/categories** - List all categories (public)
- **GET /api/categories/{category}** - Get a specific category (public)
- **GET /api/categories/{category}/products** - Get products in a category (public)
- **POST /api/categories** - Create a category (admin only)
- **PUT /api/categories/{category}** - Update a category (admin only)
- **DELETE /api/categories/{category}** - Delete a category (admin only)

### Order Endpoints

- **GET /api/my-orders** - List user's orders (requires authentication)
- **GET /api/orders** - List all orders (admin only)
- **GET /api/orders/{order}** - Get a specific order (owner or admin)
- **POST /api/orders** - Create an order (requires authentication)
- **PUT /api/orders/{order}/status** - Update order status (admin only)

## Default Users

After seeding the database, the following users will be available:

- Admin:
  - Email: admin@example.com
  - Password: password

- Regular User:
  - Email: user@example.com
  - Password: password

## Testing

Run the tests with:

```bash
php artisan test
```

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
