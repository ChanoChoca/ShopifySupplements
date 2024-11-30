import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  carouselSettings,
  partnerCarouselSettings,
  trendingProductsSettings,
  videosCarouselSettings,
} from '~/utils/carouselSettings';

import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {RecommendedProductsQuery} from 'storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {OkendoReviews} from '@okendo/shopify-hydrogen';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const bundlesData = await loadBundlesData(args);

  const balancedDietBlogs = await fetchFilteredBlogs(
    args.context.storefront,
    'Balanced Diet',
  );
  const podcastBlogs = await fetchFilteredBlogs(
    args.context.storefront,
    'Podcasts',
  );

  return defer({
    ...deferredData,
    ...bundlesData,
    balancedDietBlogs: balancedDietBlogs || [],
    podcastBlogs: podcastBlogs || [],
  });
}

/**
 * Realiza la consulta para obtener blogs desde el storefront y los filtra por título.
 * @param {Object} storefront - Cliente del storefront.
 * @param {string} filterTitle - Título por el cual filtrar los blogs.
 * @returns {Promise<Array>} - Lista de blogs filtrados.
 */
async function fetchFilteredBlogs(storefront, filterTitle) {
  const query = `
        query GetBlogs($first: Int!, $articlesFirst: Int!) {
          blogs(first: $first) {
            edges {
              node {
                id
                title
                handle
                articles(first: $articlesFirst) {
                  edges {
                    node {
                      id
                      title
                      contentHtml
                      excerpt
                      publishedAt
                      authorV2 {
                        name
                      }
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
    `;

  // Definir las variables para el número de blogs y artículos
  const variables = {
    first: 3,
    articlesFirst: filterTitle === 'Balanced Diet' ? 3 : 100,
  };

  try {
    const response = await storefront.query(query, {variables});
    const blogs = response?.blogs?.edges || [];

    // Filtrar blogs por el título proporcionado
    return blogs.filter((blog) => blog.node.title === filterTitle);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

async function loadBundlesData({context}: LoaderFunctionArgs) {
  const response = await context.storefront.query(BUNDLES_COLLECTION_QUERY);
  return {
    bundles: response.collection?.products.nodes || [],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="home">
      <HeroSection />
      <AdvantagesSection />
      <RecommendedProducts products={data.recommendedProducts} />
      <InformationSection />
      <ScienceSection data={data} blogs={data.podcastBlogs} />
      <BundlesCollection products={data.bundles} />
      <CustomizedProduct />
      <InnovateEngineering />
      <BlogsPage blogs={data.balancedDietBlogs} />
      <ImagesCollection />
    </main>
  );
}

function HeroSection({}: {}) {
  return (
    <section className="p-0">
      <video
        src="/videos/home.mp4"
        autoPlay={true}
        className="hero-image"
      ></video>
      <div className="hero-content">
        <h2 className="hero-title">
          Great things never came from comfort zones
        </h2>
        <a href="/collections"><button className="hero-button">Shop Now</button></a>
      </div>
      <div className="hero-carousel">
        <Slider {...carouselSettings}>
          <p className="text-white">✸ High Quality Ingredients</p>
          <p className="text-white">✸ Independently Certified</p>
          <p className="text-white">✸ Expert Driven</p>
          <p className="text-white">✸ Shipped Internationally</p>
        </Slider>
      </div>
      <div className="recommended-products flex flex-col md:flex-row text-center md:text-left">
        <div className="md:ms-8">
          <a>
            <button className="mt-8 md:mt-5 button-black">
              #1 Doctor Recommended
            </button>
          </a>
          <OkendoReviews className="!w-fit" />
        </div>
        <hr />
        <div className="vr mx-8 my-5"></div>
        <div className="partners my-5 md:my-0">
          <Slider {...partnerCarouselSettings}>
            <div>
              <img
                src="/images/partners/img.png"
                alt="Rolling Stone Logo"
              ></img>
            </div>
            <div>
              <img
                src="/images/partners/img_1.png"
                alt="Mens Journal Logo"
              ></img>
            </div>
            <div>
              <img src="/images/partners/img_2.png" alt="LA Weekly Logo"></img>
            </div>
            <div>
              <img src="/images/partners/img_3.png" alt="Herb Logo"></img>
            </div>
            <div>
              <img
                src="/images/partners/img_4.png"
                alt="The New Work Times Logo"
              ></img>
            </div>
            <div>
              <img src="/images/partners/img_5.png" alt="BBC News Logo"></img>
            </div>
          </Slider>
        </div>
      </div>
    </section>
  );
}

function AdvantagesSection({}: {}) {
  return (
    <section className="mx-10 my-16 py-0">
      <div className="text-center mb-8">
        <h6>COMFORTABLY UNCOMFORTABLE</h6>
        <h2>Start with your Goals</h2>
        <p>We cannot become what we want to be by remaining what we are.</p>
      </div>
      <div className="flex flex-col gap-y-5 md:flex-row md:gap-x-5">
        <div>
          <img
            src="/images/advantages/img.png"
            alt="Sleep Photo"
            className="mb-6 rounded-lg"
          />
          <div className="flex justify-between">
            <span>Sleep</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon"
              />
            </a>
          </div>
          <p>Optimize Your Sleep Patterns.</p>
        </div>
        <div>
          <img
            src="/images/advantages/img_1.png"
            alt="Sleep Photo"
            className="mb-6 rounded-lg"
          />
          <div className="flex justify-between">
            <span>Cognitive Function</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon"
              />
            </a>
          </div>
          <p>Enhance your brain's performance and connectivity</p>
        </div>
        <div>
          <img
            src="/images/advantages/img_2.png"
            alt="Sleep Photo"
            className="mb-6 rounded-lg"
          />
          <div className="flex justify-between">
            <span>Foundational Health</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon"
              />
            </a>
          </div>
          <p>Promoting healthy, natural deep sleep day to day</p>
        </div>
        <div>
          <img
            src="/images/advantages/img_3.png"
            alt="Sleep Photo"
            className="mb-6 rounded-lg"
          />
          <div className="flex justify-between">
            <span>Athletic Performance</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon"
              />
            </a>
          </div>
          <p>Increase your healthy tissue, muscle, and energy</p>
        </div>
        <div>
          <img
            src="/images/advantages/img_4.png"
            alt="Sleep Photo"
            className="mb-6 rounded-lg"
          />
          <div className="flex justify-between">
            <span>Hormone Support</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon"
              />
            </a>
          </div>
          <p>Boost your mood, libido, and vitality</p>
        </div>
      </div>
    </section>
  );
}

function InformationSection({}: {}) {
  return (
    <section className="mx-10 my-16 py-0 text-center md:text-left">
      <h6>🧐 Why Health & Fitness</h6>
      <h2>Clean Supplements - Made For You</h2>
      <div className="flex flex-col gap-y-8	md:flex-row md:gap-x-8">
        <div>
          <span className="background-black inline-block w-12 h-12 content-center text-center rounded-full">
            <img
              src="/images/why/img.png"
              alt="We Make It Easy Icon"
              className="w-6"
            />
          </span>
          <h4>We Make It Easy</h4>
          <p>
            Personalized Solutions & Guidance Mean You Get Just What You Need
            Nothing More
          </p>
        </div>
        <div>
          <span className="background-black inline-block w-12 h-12 content-center text-center rounded-full">
            <img
              src="/images/why/img_1.png"
              alt="Clean & Effective Icon"
              className="w-6"
            />
          </span>
          <h4>Clean & Effective</h4>
          <p>
            Proven Ingredients, not Artificial, Crafted By Experts For Optimal
            Effectiveness
          </p>
        </div>
        <div>
          <span className="background-black inline-block w-12 h-12 content-center text-center rounded-full">
            <img
              src="/images/why/img_2.png"
              alt="Your Free Dietitian Icon"
              className="w-6"
            />
          </span>
          <h4>Your Free Dietitian</h4>
          <p>
            Every Gainful Subscriber Gets Free, 1:1 Access Their Own Registered
            Dietitian.
          </p>
        </div>
        <div>
          <span className="background-black inline-block w-12 h-12 content-center text-center rounded-full">
            <img
              src="/images/why/img_3.png"
              alt="Made For You Icon"
              className="w-6"
            />
          </span>
          <h4>Made For You</h4>
          <p>
            Performance is Personal. Personalized & Customizable Products For
            Your Needs, Body & Goals
          </p>
        </div>
      </div>
    </section>
  );
}
function sanitizeContentHtml(html) {
  // Reemplaza `controls="controls"` con `controls` para simplificar.
  return html.replace(/controls="controls"/g, 'controls');
}

function ScienceSection({data, blogs}) {
  return (
    <section className="background3 py-16">
      <h6 className="text-center">Trusted & Proven by Science</h6>
      <h2 className="text-center">Real People. Real Results.</h2>
      <div className="text-center">
        <a href="/blogs/podcasts">View All</a>
      </div>
      <div className="mx-10 mt-10" id="videosCarousel">
        <Slider {...videosCarouselSettings} className="overflow-hidden">
          {blogs.map((blog) =>
            blog.node.articles.edges.map((article) => (
              <div
                className="transform overflow-x-hidden"
                key={article.node.id}
              >
                <div
                  className="video-container"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeContentHtml(article.node.contentHtml),
                  }}
                />
                <GetProduct products={data.recommendedProducts} />
              </div>
            )),
          )}
        </Slider>
      </div>
    </section>
  );
}

function CustomizedProduct({}: {}) {
  return (
    <section className="background3 py-0 text-center md:text-left">
      <div className="mx-10 py-16">
        <h6 className="text-center">Simple & Effective Ingredients</h6>

        <h2 className="text-center">Customized Protein Powder</h2>

        <div className="flex flex-col background4 rounded-lg md:flex-row">
          <div className="content-evenly">
            <img src="/images/products/img.png" alt="" />
          </div>
          <hr />
          <div className="vr m-0"></div>
          <div>
            <div className="background md:rounded-tr-lg ">
              <h3 className="text-center font-bold pb-3">The Blend</h3>
              <div className="flex flex-col gap-y-5 justify-around md:flex-row md:gap-x-5">
                <div className="flex flex-col items-center gap-y-3 md:flex-row md:gap-x-3">
                  <span>
                    <img
                      src="/images/why/img_1.png"
                      alt="Clean &amp; Effective Icon"
                    />
                  </span>
                  <h6>Whey Based</h6>
                </div>
                <div className="flex flex-col items-center gap-y-3 md:flex-row md:gap-x-3">
                  <span>
                    <img
                      src="/images/why/img_1.png"
                      alt="Clean &amp; Effective Icon"
                    />
                  </span>
                  <h6>Build Muscle</h6>
                </div>
                <div className="flex flex-col items-center gap-y-3 md:flex-row md:gap-x-3">
                  <span>
                    <img
                      src="/images/why/img_1.png"
                      alt="Clean &amp; Effective Icon"
                    />
                  </span>
                  <h6>Clean Ingredients</h6>
                </div>
              </div>
            </div>
            <div className="background2">
              <h3 className="text-center font-bold pb-3">Active Ingredients</h3>
              <div className="flex flex-col justify-evenly gap-y-5 md:flex-row md:gap-x-5">
                <div>
                  <div>
                    <span>
                      <img
                        src="/images/customize/img.png"
                        alt="Clean &amp; Effective Icon"
                      />
                    </span>
                  </div>
                  <h6>Whey Protein Isolate</h6>
                  <p>
                    Low Calorie With Virtually No Fat or Lactose, Quickly
                    Absorbed To Maximize Muscle Building & Repair.
                  </p>
                </div>
                <div>
                  <div>
                    <span>
                      <img
                        src="/images/customize/img.png"
                        alt="Clean &amp; Effective Icon"
                      />
                    </span>
                  </div>
                  <h6>Whey Protein Isolate</h6>
                  <p>
                    Low Calorie With Virtually No Fat or Lactose, Quickly
                    Absorbed To Maximize Muscle Building & Repair.
                  </p>
                </div>
                <div>
                  <div>
                    <span>
                      <img
                        src="/images/customize/img.png"
                        alt="Clean &amp; Effective Icon"
                      />
                    </span>
                  </div>
                  <h6>Whey Protein Isolate</h6>
                  <p>
                    Low Calorie With Virtually No Fat or Lactose, Quickly
                    Absorbed To Maximize Muscle Building & Repair.
                  </p>
                </div>
              </div>

              <div className="text-center mt-6">
                <a href="">
                  <button className="background-blue py-3 px-6 rounded-lg cursor-pointer">
                    Customize This Blend
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InnovateEngineering({}: {}) {
  return (
    <section className="mx-10 my-16 py-0 text-center overflow-hidden">
      <div className="md:text-left" id="generation">
        <h2 className="transform2">The Next Generation is Here</h2>
        <img
          src="/images/generation/img.png"
          alt=""
          className="rounded-lg mb-5 md:mb-0 "
        />
        <div className="transform3">
          <p>
            Innovative Engineering. Intelligent Design. Meet The Plunge All-I.
          </p>
          <div className="mt-5 md:mt-10 flex flex-col md:flex-row gap-3">
            <button className="button-black button-white text-centr">
              Take The Plunge
            </button>
            <button className="button-black button-transparent text-centr">
              Dive Deeper
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImagesCollection({}: {}) {
  return (
    <section className="mx-10 py-16">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-1">
        <div className="col-span-2 background3 rounded-lg content-center text-center p-3">
          <div className="flex justify-center items-center gap-x-1 lg:gap-x-3 mb-5">
            <div className="w-14 h-14 background-blue rounded-full content-center text-center">
              Logo
            </div>
            <h3 className="font-bold">@uncmfrt.com</h3>
          </div>
          <a href="">
            <button className="button-white">Follow Us on Instagram</button>
          </a>
        </div>
        <div>
          <img
            src="/images/other-images/1.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/2.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/3.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/4.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/5.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/6.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/7.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/8.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/9.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="/images/other-images/10.jpg"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
      </div>
    </section>
  );
}

function BundlesCollection({
  products,
}: {
  products: {
    id: string;
    title: string;
    handle: string;
    priceRange: any;
    images: any[];
    variants: {nodes: {id: string; availableForSale: boolean}[]};
  }[];
}) {
  const {open} = useAside();

  if (!products || products.length === 0) return null;

  return (
    <div className="mx-10 my-16 text-center md:text-left">
      <p>📦 Goals Specific</p>
      <h2>Bundles</h2>
      <div className="bundles-grid">
        {products.map((product) => (
          <div key={product.id} className="bundle-product rounded-lg">
            <Link
              className="bundle-product-link"
              to={`/products/${product.handle}`}
            >
              <Image
                data={product.images.nodes[0]}
                aspectRatio="1/1"
                sizes="(min-width: 45em) 20vw, 50vw"
              />
              <h4>{product.title}</h4>
            </Link>
            <small>
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: product.variants.nodes[0]?.id || '',
                    quantity: 1,
                  },
                ]}
                disabled={!product.variants.nodes[0]?.availableForSale}
                onClick={() => open('cart')}
              >
                Add • <Money data={product.priceRange.minVariantPrice} />
              </AddToCartButton>
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

const BUNDLES_COLLECTION_QUERY = `#graphql
fragment ProductBundle on Product {
    id
    title
    handle
    priceRange {
        minVariantPrice {
            amount
            currencyCode
        }
    }
    images(first: 1) {
        nodes {
            id
            url
            altText
            width
            height
        }
    }
    variants(first: 1) {
        nodes {
            id
            availableForSale
        }
    }
}
query BundlesCollection($country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    collection(handle: "Sleep") {
        id
        title
        products(first: 4) {
            nodes {
                ...ProductBundle
            }
        }
    }
}
` as const;

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  const {open} = useAside();

  return (
    <div className="recommended-products text-center md:text-left">
      <div className="mx-10 py-16" id="supplements">
        <h6 className="text-center mb-8">🌟 Trending</h6>
        <h2>Supplements</h2>
        <a href="/collections">View All</a>
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={products}>
            {(response) => (
              // <div className="recommended-products-grid">
              <Slider {...trendingProductsSettings}>
                {response
                  ? response.products.nodes.map((product) => (
                      <div
                        key={product.id}
                        className="recommended-product rounded-lg"
                      >
                        <Link
                          className="recommended-product-link"
                          to={`/products/${product.handle}`}
                        >
                          <Image
                            data={product.images.nodes[0]}
                            aspectRatio="1/1"
                            sizes="(min-width: 45em) 20vw, 50vw"
                          />
                          <h4>{product.title}</h4>
                        </Link>
                        <small>
                          <AddToCartButton
                            lines={[
                              {
                                merchandiseId:
                                  product.variants.nodes[0]?.id || '',
                                quantity: 1,
                              },
                            ]}
                            disabled={
                              !product.variants.nodes[0]?.availableForSale
                            }
                            onClick={() => open('cart')}
                          >
                            Add •{' '}
                            <Money data={product.priceRange.minVariantPrice} />
                          </AddToCartButton>
                        </small>
                      </div>
                    ))
                  : null}
              </Slider>
            )}
          </Await>
        </Suspense>
        <br />
      </div>
    </div>
  );
}

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
        minVariantPrice {
            amount
            currencyCode
        }
    }
    images(first: 1) {
        nodes {
            id
            url
            altText
            width
            height
        }
    }
    variants(first: 1) {
        nodes {
            id
            availableForSale
        }
    }
}
query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
@inContext(country: $country, language: $language) {
    products(first: 100, sortKey: UPDATED_AT, reverse: true) {
        nodes {
            ...RecommendedProduct
        }
    }
}
` as const;

function GetProduct({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  const {open} = useAside();

  return (
    <div className="bg-white rounded-lg mt-4">
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => {
            const product = response.products.nodes[0];
            return product ? (
              <div
                key={product.id}
                className="flex items-center justify-between gap-x-2 p-2"
              >
                <Link
                  className="flex items-center gap-x-2 rounded-lg"
                  to={`/products/${product.handle}`}
                >
                  <div className="recommended-products rounded-lg w-16 h-16 flex justify-center items-center">
                    <Image
                      className="w-12 h-12"
                      data={product.images.nodes[0]}
                    />
                  </div>
                  <h6 className="text-center">{product.title}</h6>
                </Link>

                <AddToCartButton
                  lines={[
                    {
                      merchandiseId: product.variants.nodes[0]?.id || '',
                      quantity: 1,
                    },
                  ]}
                  disabled={!product.variants.nodes[0]?.availableForSale}
                  onClick={() => open('cart')}
                >
                  <button className="add-to-cart-button background-blue cursor-pointer text-white rounded-full w-8 h-8 flex items-center justify-center">
                    +
                  </button>
                </AddToCartButton>
              </div>
            ) : null;
          }}
        </Await>
      </Suspense>
    </div>
  );
}

function BlogsPage({blogs}) {
  return (
    <section className="mx-10 mb-16 py-0">
      <h6 className="text-center">✍️ Blogs</h6>
      <h2 className="text-center">Latest Articles</h2>
      <div className="mt-12 personalized-grid overflow-x-hidden">
        {blogs.map(({node: blog}) => (
          <div key={blog.id} className="blog-container">
            {blog.articles.edges.map(({node: article}, index) => (
              <div
                key={article.id}
                className={`article-container ${
                  index === 0 ? 'first-article' : ''
                }`}
                style={
                  index === 0 && article.image
                    ? {
                        backgroundImage: `url(${article.image.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {}
                }
              >
                <div>
                  {article.image && index !== 0 && (
                    <img
                      className="article-image h-full"
                      src={article.image.url}
                      alt={article.image.altText || article.title}
                      width="200"
                    />
                  )}
                </div>
                <div>
                  <h6 className="blog-title">{blog.title}</h6>
                  <h3 className="article-title font-bold mb-8 mt-1">
                    {article.title}
                  </h3>
                  <p className="article-author-and-date">
                    By {article.authorV2?.name || 'Unknown Author'} |{' '}
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
