<x-mail::message>
# Thank you for your order!

Hi {{ $order->billingAddress?->first_name }}, we have received your order **{{ $order->number }}**
placed on {{ $order->placed_at->format('F j, Y') }}.

<x-mail::table>
| Product | Qty | Total |
|:--------|:---:|------:|
@foreach ($order->items as $item)
| {{ $item->product_name }} | {{ $item->quantity }} | {{ $money($item->line_total) }} |
@endforeach
| Subtotal | | {{ $money($order->subtotal) }} |
@if ($order->discount > 0)
| Discount ({{ $order->coupon_code }}) | | −{{ $money($order->discount) }} |
@endif
| Shipping ({{ $order->shipping_method_name }}) | | {{ $order->shipping_total === 0 ? 'Free' : $money($order->shipping_total) }} |
| **Total** | | **{{ $money($order->total) }}** |
</x-mail::table>

**Payment:** {{ $order->payment_method->label() }}. {{ $order->payment_method->description() }}

@if ($order->shippingAddress)
**Shipping to:**
{{ $order->shippingAddress->first_name }} {{ $order->shippingAddress->last_name }},
{{ $order->shippingAddress->address_line_1 }}{{ $order->shippingAddress->address_line_2 ? ', '.$order->shippingAddress->address_line_2 : '' }},
{{ $order->shippingAddress->city }}{{ $order->shippingAddress->state ? ', '.$order->shippingAddress->state : '' }}
{{ $order->shippingAddress->postcode }}, {{ $order->shippingAddress->country_name }}
@endif

<x-mail::button :url="$orderUrl">
View your order
</x-mail::button>

You can follow your order at any time on the [tracking page]({{ $trackingUrl }}) with the order number
and this e-mail address.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
