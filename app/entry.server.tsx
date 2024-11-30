import type {EntryContext, AppLoadContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  context: AppLoadContext,
) {
  const { nonce, header, NonceProvider } = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_STORE_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc: [
      "'self'",
      'localhost:*',
      'https://cdn.shopify.com',
      'https://www.google.com',
      'https://www.gstatic.com',
      'https://d3hw6dc1ow8pp2.cloudfront.net',
      'https://d3g5hqndtiniji.cloudfront.net',
      'https://dov7r31oq5dkj.cloudfront.net',
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
      'https://api.okendo.io',
      'data:',
    ],
    imgSrc: [
      "'self'",
      'https://s3-alpha-sig.figma.com',
      'http://localhost:3100',
      'https://cdn.shopify.com',
      'data:',
      'https://d3hw6dc1ow8pp2.cloudfront.net',
      'https://d3g5hqndtiniji.cloudfront.net',
      'https://dov7r31oq5dkj.cloudfront.net',
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
    ],
    mediaSrc: [
      "'self'",
      'https://s3-figma-videos-production-sig.figma.com',
      'https://cdn.shopify.com',
      'https://d3hw6dc1ow8pp2.cloudfront.net',
      'https://d3g5hqndtiniji.cloudfront.net',
      'https://dov7r31oq5dkj.cloudfront.net',
      'https://cdn-static.okendo.io',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://d3hw6dc1ow8pp2.cloudfront.net',
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
    ],
    scriptSrc: [
      "'self'",
      'http://localhost:3100',
      'https://cdn.shopify.com',
      'https://d3hw6dc1ow8pp2.cloudfront.net',
      'https://dov7r31oq5dkj.cloudfront.net',
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
      'https://api.okendo.io',
      'https://www.google.com',
      'https://www.gstatic.com',
    ],
    fontSrc: [
      "'self'",
      'http://localhost:3100',
      'https://fonts.gstatic.com',
      'https://d3hw6dc1ow8pp2.cloudfront.net',
      'https://dov7r31oq5dkj.cloudfront.net',
      'https://cdn.shopify.com',
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
    ],
    connectSrc: [
      "'self'",
      'https://monorail-edge.shopifysvc.com',
      'localhost:*',
      'ws://localhost:*',
      'ws://127.0.0.1:*',
      'https://api.okendo.io',
      'https://cdn-static.okendo.io',
      'https://surveys.okendo.io',
      'https://api.raygun.com',
      'https://www.google.com',
      'https://www.gstatic.com',
    ],
    frameSrc: [
      'https://www.google.com',
      'https://www.gstatic.com',
      'https://s3-figma-videos-production-sig.figma.com',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
