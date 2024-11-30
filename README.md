# Hydrogen template: Skeleton

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [Remix](https://remix.run/), Shopify’s full stack web framework. This template contains a **minimal setup** of components, queries and tooling to get started with Hydrogen.

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)
[Get familiar with Remix](https://remix.run/docs/en/v1)

## What's included

- Remix
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 18.0.0 or higher

```bash
npm create @shopify/hydrogen@latest
```

URL:

## Building for production

```bash
npm run build
```

## Local development

### Create a .env file
``` text
SESSION_SECRET="your-session-secret"
PRIVATE_STOREFRONT_API_TOKEN=your-private-storefront-api-token
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=your-public-customer-account-api-client-id
PUBLIC_STOREFRONT_API_TOKEN=your-public-storefront-api-token
PUBLIC_CUSTOMER_ACCOUNT_API_URL=your-customer-account-api-url
PUBLIC_STORE_DOMAIN=your-public-store-domain
PUBLIC_STOREFRONT_ID=your-public-storefront-id
SHOP_ID=your-shop-id
VITE_OKENDO_SUBSCRIBERID=your-okendo-subscriberid
```

### And then
```bash
npm run dev
```

## Setup for using Customer Account API (`/account` section)

Follow step 1 and 2 of <https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development>
