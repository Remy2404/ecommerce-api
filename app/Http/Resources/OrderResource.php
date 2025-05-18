<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'user_id' => $this->user_id,
            'user' => $this->when($this->relationLoaded('user'), function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'shipping_address' => [
                'address_line1' => $this->shipping_address_line1,
                'address_line2' => $this->shipping_address_line2,
                'city' => $this->shipping_city,
                'postal_code' => $this->shipping_postal_code,
                'country' => $this->shipping_country,
            ],
            'billing_address' => [
                'address_line1' => $this->billing_address_line1,
                'address_line2' => $this->billing_address_line2,
                'city' => $this->billing_city,
                'postal_code' => $this->billing_postal_code,
                'country' => $this->billing_country,
            ],
            'notes' => $this->notes,
            'items' => $this->when($this->relationLoaded('items'), function () {
                return $this->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product' => $item->relationLoaded('product') ? [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'slug' => $item->product->slug,
                            'image_url' => $item->product->image_url,
                        ] : null,
                        'quantity' => $item->quantity,
                        'price_at_purchase' => $item->price_at_purchase,
                        'product_name_at_purchase' => $item->product_name_at_purchase,
                        'subtotal' => $item->quantity * $item->price_at_purchase,
                    ];
                });
            }),
            'ordered_at' => $this->ordered_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
