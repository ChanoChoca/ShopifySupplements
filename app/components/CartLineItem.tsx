import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
                                 layout,
                                 line,
                             }: {
    layout: CartLayout;
    line: CartLine;
}) {
    const {id, merchandise} = line;
    const {product, title, image, selectedOptions} = merchandise;
    const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
    const {close} = useAside();

    return (
        <li key={id} className="cart-line text-center">
            <div>
                <Link
                    prefetch="intent"
                    to={lineItemUrl}
                    onClick={() => {
                        if (layout === 'aside') {
                            close();
                        }
                    }}
                >
                    {image && (
                        <Image
                            alt={title}
                            aspectRatio="1/1"
                            data={image}
                            loading="lazy"
                        />
                    )}
                    <h3>{product.title}</h3>
                </Link>
                {/* Encapsula CartLineQuantity dentro de ProductPrice */}
                <ProductPrice price={line?.cost?.totalAmount}>
                    <CartLineQuantity line={line} />
                </ProductPrice>
            </div>
        </li>
    );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

    return (
        <div className="inline-block rounded-lg py-4 px-5">
            <div className="cart-line-quantity flex items-center space-x-4">
                {/* Botón para disminuir cantidad */}
                <CartLineUpdateButton
                    lines={[
                        {
                            id: lineId,
                            quantity: quantity === 1 ? 0 : prevQuantity, // Si la cantidad es 1, se establece en 0 para eliminar
                        },
                    ]}
                >
                    <button
                        aria-label="Decrease quantity"
                        className="button-decrease"
                        disabled={!!isOptimistic}
                        name="decrease-quantity"
                        value={prevQuantity}
                    >
                        <span>&#8722;</span>
                    </button>
                </CartLineUpdateButton>

                {/* Cantidad actual */}
                <small className="quantity-display">{quantity}</small>

                {/* Botón para aumentar cantidad */}
                <CartLineUpdateButton
                    lines={[{id: lineId, quantity: nextQuantity}]}
                >
                    <button
                        aria-label="Increase quantity"
                        className="button-increase"
                        disabled={!!isOptimistic}
                        name="increase-quantity"
                        value={nextQuantity}
                    >
                        <span>&#43;</span>
                    </button>
                </CartLineUpdateButton>
            </div>
        </div>
    );

}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
                                  lineIds,
                                  disabled,
                              }: {
    lineIds: string[];
    disabled: boolean;
}) {
    return (
        <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{lineIds}}
        >
            <button disabled={disabled} type="submit">
                Remove
            </button>
        </CartForm>
    );
}

function CartLineUpdateButton({
                                  children,
                                  lines,
                              }: {
    children: React.ReactNode;
    lines: CartLineUpdateInput[];
}) {
    return (
        <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesUpdate}
            inputs={{lines}}
        >
            {children}
        </CartForm>
    );
}
