import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
                               price,
                               compareAtPrice,
                               children, // Agrega children para incluir contenido adicional
                             }: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  children?: React.ReactNode; // Hacer children opcional
}) {
  return (
      <div className="product-price inline-flex flex-row-reverse justify-center items-center background-blue rounded-lg">
        <div>
          {compareAtPrice ? (
              <div className="product-price-on-sale">
                {price ? <Money data={price} /> : null}
                <s>
                  <Money data={compareAtPrice} />
                </s>
              </div>
          ) : price ? (
              <div className="py-4 px-5">
                  <Money data={price} />
              </div>
          ) : (
              <span>&nbsp;</span>
          )}
        </div>
        {/* Renderiza los children aquí */}
        {children}
      </div>
  );
}
