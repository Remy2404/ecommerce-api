<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class FixOrderItemsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add missing columns to order_items if not present
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'order_id')) {
                $table->unsignedBigInteger('order_id')->after('id');
            }
            if (!Schema::hasColumn('order_items', 'product_id')) {
                $table->unsignedBigInteger('product_id')->after('order_id');
            }
            if (!Schema::hasColumn('order_items', 'quantity')) {
                $table->unsignedInteger('quantity')->default(1)->after('product_id');
            }
            if (!Schema::hasColumn('order_items', 'price_at_purchase')) {
                $table->decimal('price_at_purchase', 10, 2)->after('quantity');
            }
            if (!Schema::hasColumn('order_items', 'product_name_at_purchase')) {
                $table->string('product_name_at_purchase')->after('price_at_purchase');
            }

            // Ensure timestamps exist
            if (!Schema::hasColumn('order_items', 'created_at') || !Schema::hasColumn('order_items', 'updated_at')) {
                $table->timestamps();
            }

            // Add unique key for order_id and product_id
            if (!Schema::hasColumn('order_items', 'uq_order_product')) {
                $table->unique(['order_id', 'product_id'], 'uq_order_product');
            }
        });

        // Add foreign keys separately to avoid index issues
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign('order_id', 'fk_order_items_order')
                  ->references('id')->on('orders')
                  ->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('product_id', 'fk_order_items_product')
                  ->references('id')->on('products')
                  ->onDelete('restrict')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign('fk_order_items_order');
            $table->dropForeign('fk_order_items_product');
            $table->dropUnique('uq_order_product');
            $table->dropColumn([
                'order_id',
                'product_id',
                'quantity',
                'price_at_purchase',
                'product_name_at_purchase',
                'created_at',
                'updated_at'
            ]);
        });
    }
};
