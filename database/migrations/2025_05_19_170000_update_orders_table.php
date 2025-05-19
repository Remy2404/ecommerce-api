<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'user_id')) {
                $table->unsignedBigInteger('user_id')->after('id');
            }
            if (!Schema::hasColumn('orders', 'order_number')) {
                $table->string('order_number')->unique()->after('user_id');
            }
            if (!Schema::hasColumn('orders', 'total_amount')) {
                $table->decimal('total_amount', 10, 2)->default(0)->after('order_number');
            }
            if (!Schema::hasColumn('orders', 'status')) {
                $table->string('status')->default('pending')->after('total_amount');
            }
            if (!Schema::hasColumn('orders', 'shipping_address_line1')) {
                $table->string('shipping_address_line1')->nullable()->after('status');
            }
            if (!Schema::hasColumn('orders', 'shipping_address_line2')) {
                $table->string('shipping_address_line2')->nullable()->after('shipping_address_line1');
            }
            if (!Schema::hasColumn('orders', 'shipping_city')) {
                $table->string('shipping_city')->nullable()->after('shipping_address_line2');
            }
            if (!Schema::hasColumn('orders', 'shipping_postal_code')) {
                $table->string('shipping_postal_code')->nullable()->after('shipping_city');
            }
            if (!Schema::hasColumn('orders', 'shipping_country')) {
                $table->string('shipping_country')->nullable()->after('shipping_postal_code');
            }
            if (!Schema::hasColumn('orders', 'billing_address_line1')) {
                $table->string('billing_address_line1')->nullable()->after('shipping_country');
            }
            if (!Schema::hasColumn('orders', 'billing_address_line2')) {
                $table->string('billing_address_line2')->nullable()->after('billing_address_line1');
            }
            if (!Schema::hasColumn('orders', 'billing_city')) {
                $table->string('billing_city')->nullable()->after('billing_address_line2');
            }
            if (!Schema::hasColumn('orders', 'billing_postal_code')) {
                $table->string('billing_postal_code')->nullable()->after('billing_city');
            }
            if (!Schema::hasColumn('orders', 'billing_country')) {
                $table->string('billing_country')->nullable()->after('billing_postal_code');
            }
            if (!Schema::hasColumn('orders', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('billing_country');
            }
            if (!Schema::hasColumn('orders', 'payment_status')) {
                $table->string('payment_status')->default('pending')->after('payment_method');
            }
            if (!Schema::hasColumn('orders', 'notes')) {
                $table->text('notes')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('orders', 'ordered_at')) {
                $table->timestamp('ordered_at')->nullable()->after('notes');
            }

            // Add foreign key to users table
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Removing columns is risky in production, so leaving this empty intentionally
    }
};
