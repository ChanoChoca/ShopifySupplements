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
import {OkendoReviews, OkendoStarRating} from '@okendo/shopify-hydrogen';

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
        src="https://s3-figma-videos-production-sig.figma.com/video/1120774264148255568/TEAM/ee58/89dd/-f1d3-45a4-a2a8-c462f7e5812d?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=OHF-2GFMU4ultN8LBQDutGcV2EelyZCoV-hJnz9ctCdbR2-7B5Vtkhxcnkxo04Lbc~CWo0uFw0Lpl3Q5xP8fEulwNXGqZ4r5XonW09gN~QdRf7Mz~4Beis7FcjjOqwr1-mjL3g-JiwH5HcNuDhUP5gsT16nMybX~UStqUhvZ6B4ThNkrS8PGMRfg30o4X1Bk~6Byx0GAmksJchq8zt0nA-8AmTyOgeIiImgFCRmAM5Equw0uuG02PyeZ2xgr3gydzfD7yj2qO3U5y1lFT5BG~~50sAon1sxixjQeNcjtl1C5Ifyl-hBp502P7L-~KSSSXiUHUsE6tgce0NDoGEVT2Q__"
        autoPlay={true}
        className="hero-image"
      ></video>
      <div className="hero-content">
        <h2 className="hero-title">
          Great things never came from comfort zones
        </h2>
        <a href="/collections">
          <button className="hero-button">Shop Now</button>
        </a>
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
      <div className="flex flex-col gap-y-5 md:flex-row md:gap-x-5 justify-center">
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/d75b/273b/997c2aa242084a92c3cfd8674927555e?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=DE4mUbL32RP2KcvpCz5XHDRxy8VjylcRQHuy8cxfJecDLvtUBwJoRBRzNQl~uq3A5gltxhfW3RfW~IoToOp5mxvIFGJthPnMAl9M6RK2Rh6mJyLDQ9DMQ5e9q7Ccw~yz-rU7f91LTsdjEDdBKm~OB3Otk2T3IhAYNbPwi~-FfFHEHWhz1zFFBJ1jy7e4Tr1jqs8XKroYw8M5XFrAUPRdHq-8tM2Y9wQOjQRcEK7EYfF~0LX-DtKWbWOGVXewtvMxkU9IaPHXCieqGAMg-YIehlaFxxLAKbVY~c-tY1nbv3-JVElEAJiYz-3IqNg6MG-nl6vHGcnzoUKAiU9ayD0V7Q__"
            alt="Sleep Photo"
            className="mb-6 rounded-lg w-full h-48 object-cover"
          />
          <div className="flex justify-between">
            <span>Sleep</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon w-6 h-6"
              />
            </a>
          </div>
          <p>Optimize Your Sleep Patterns.</p>
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/89a4/0eb1/1adce8ff03d61d72ebd773237c7c9dd6?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=RWi2vf97pMtmeCSwhascc-Klz1RdvF~ptwyj9d2QdSe4cj4rNuOEpGPYCxThaakPv1b-~w7DcbVXsec3yRVr9BY1Eol3VKUHZbB2uKnAijU7VNJeAV7ZQ5DmqH7w7m4P4JITvLQS2cx4aIRpbC3i-JaRSrlsvN-R2eep7Y1l4dLF1TOgL~Q3G4~lFaoQ7DblSPqL4lhkYJYaH6ygn-wkmhw8lzfHqTjD5VahqNwsd1lq3rSTRPuNe~N7nQt6GomWKd3u09hDBBzAghvQoUWFYbl0FylLDVUp1QBA-aX43abI-v10K7aCg2quUCYwyIpRguKqumznyhia~ZegMyJUJw__"
            alt="Sleep Photo"
            className="mb-6 rounded-lg w-full h-48 object-cover"
          />
          <div className="flex justify-between">
            <span>Cognitive Function</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon w-6 h-6"
              />
            </a>
          </div>
          <p>Enhance your brain's performance and connectivity</p>
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/7589/b818/7e6d5afa14d53ff0b6d598e9793856ab?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=EuQruEwpfgfVSECCd5ZiadAba4V5TeilYNUuX6VyJzd-CtjV5kypQNB3yCAWRTg2Q1JcJ0rBRJpzkz0KhnXpc~H8La~otK6~Ogy7lNulwLrh~8Zr-EKjDOJslQybB3tT-jCQFIYEbHFxxfOIM0vK7gaaQmhZSp~lLLMU4R8Z9SuU-rXGfsF9p3QVOdown6UP9pkzxwc4b3ug1U6bBSOz5EQtdqkab4iMrKpeEofHx6ZifxCLZ-I1MCtSX2EA40FRgVG1Ywy18JgN4DHLdwgfI7ojHrDQfqyEPLTXZ9lslyTheap5vGDDGdqWI38iKzx2pYEnM0DHYHz6f5N6JZvokQ__"
            alt="Sleep Photo"
            className="mb-6 rounded-lg w-full h-48 object-cover"
          />
          <div className="flex justify-between">
            <span>Foundational Health</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon w-6 h-6"
              />
            </a>
          </div>
          <p>Promoting healthy, natural deep sleep day to day</p>
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/74ee/d5b4/643a37948ecd36462f2e21db2ee9ea09?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=AyRw2jym~Wa~QK6G~5TTlCSPkWZnAf30atz~8scNHZ4gjTe9ZfC2UZRHfFxRDoaBOSSW6UbrW21rFqOvLjI5rKMBp7txclYFLEM~NBPRVSV70Pn5PrMPUzNZCKAv7uaUfE8KdDnkKaaDpsefOS5m~RZrtLtdqRWW~j~R6cL69K95857Alx0AA6L4MITby8fUp7CplmbH1KBttBylr~rVibwt2BMoYTKxKdLXeJvKzVGeV8GsbMSCs09CnNhhCsKBErVhCv4fsCRu73SWbeTYxKU3qhoU1-SgGvPWYuWpXU1vfEKg2rPWD7Vwu3DNeR4n-NA~js2-OFcJkyXAPNupWA__"
            alt="Sleep Photo"
            className="mb-6 rounded-lg w-full h-48 object-cover"
          />
          <div className="flex justify-between">
            <span>Athletic Performance</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon w-6 h-6"
              />
            </a>
          </div>
          <p>Increase your healthy tissue, muscle, and energy</p>
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/1ee8/c305/7977a300e076716720c993cfe604a189?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=J-xDMily-r0TLdEcO18sorPBVVYuKtSavcV4ZXp1UVhR3O3EO4tZpexVQpqCHQ8XdaAxoB5d5vQTASStQih4VtfIyl3ghYucnx4YJtlaDFXAj1tdPgD-heqFlOu-eazg1kOz7WW2R6oSOLJNaGR2eXH~nnoK8BSpRbY7Nb7OMFPqsK5SeT4DrDZMYDUiy2OMewNeRiPQ6LaFCZjbkQvNImCIixMpWE6RRi3OKF-Zilb~QyC6xiFk3l9~4ip6LDCDttbRWAK4BCWG2HbY~ED2Ts1m3EzqTkV699HYPselWBxzpt6dizg~z0LwjCBw5DoR5irUJteVawXVBFVQvC9wHg__"
            alt="Sleep Photo"
            className="mb-6 rounded-lg w-full h-48 object-cover"
          />
          <div className="flex justify-between">
            <span>Diet & Nutrition</span>
            <a href="/blogs/podcasts">
              <img
                src="/images/advantages/img_5.png"
                alt="Sleep Photo"
                className="advantages-icon w-6 h-6"
              />
            </a>
          </div>
          <p>Get a better diet plan and healthy meals.</p>
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
              src="/images/why-health-fitness/img.png"
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
              src="/images/why-health-fitness/img_1.png"
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
              src="/images/why-health-fitness/img_2.png"
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
              src="/images/why-health-fitness/img_3.png"
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
            <img
              src="https://s3-alpha-sig.figma.com/img/e5a1/02e9/df072f0e343b93032e98806a0ee9f5b4?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=H19bBrXVmZtq~Dgrcl86m4w-qlVTaPwz1q30UhaqBXzqBpwJB5Z-yZv2gp49ZPB5s0kIvNAyFSJbRqZ4rkMFq7QO8LekoosuBu5SrpNBH6Sy~B-5icR0XwXHJM-T~GaobivupOkkppwgAVIqFoQJcVpLsQ8r342LVJNctN-w-8GCWonqqOG0CVROIAc~b6a-AFujlgxlDGoVcOkkU2geBehYVQ82bH0LDowPjqlbKXsh42Cn6d4Ug8TLJE58aRgaDZnuILh2tEH~rN-4nDAcM9CWMYYXoFDucIS-bsnfun0OVUw5fnHVs4FwoK36wZ8ilC4T-OG5h6aL80IYUobp~w__"
              alt=""
            />
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
                      src="/images/why-health-fitness/img_1.png"
                      alt="Clean &amp; Effective Icon"
                    />
                  </span>
                  <h6>Whey Based</h6>
                </div>
                <div className="flex flex-col items-center gap-y-3 md:flex-row md:gap-x-3">
                  <span>
                    <img
                      src="/images/why-health-fitness/img_1.png"
                      alt="Clean &amp; Effective Icon"
                    />
                  </span>
                  <h6>Build Muscle</h6>
                </div>
                <div className="flex flex-col items-center gap-y-3 md:flex-row md:gap-x-3">
                  <span>
                    <img
                      src="/images/why-health-fitness/img_1.png"
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
          src="https://s3-alpha-sig.figma.com/img/9f58/16f4/e4c9683702294b62e03a4063cd120030?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Mpb49rQ8BRYWQJHKv3i51GbMzsnYXRuUi6~gynilVtG~C4CzXUyM-59y9Jz6qCjLyij6n6tqmrrz0MZzRTjKT3VCRydvftnmBrJ~SFmv2CMY738crcpYItIGVxvwW2EZZtKzJpw2Qt71yisLFDDhCAz1~o91E784B~F6Rt2I7CUajSitwHVwbG52o-9oG1kDbl8VlPzdBxc-uYwRdq9Ld-x1rDIj~Y8IxtnsO60olM0REgROi3-bOokunYMm374Y52Q02NVJEVzYCrakzJZmLHb7RPzvcypX9CX51FOnRBcfHRE0vmqf56PblS6BOb0MabUmUo1l3ruyfuT2FhWkgg__"
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
            src="https://s3-alpha-sig.figma.com/img/134d/3f4c/1eedbeee8e2ac3ae1779c55abddedda1?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=PpTeKIWGAvo9MdUzcGoTsl9v8fte6mOeLosD6ZTWZhajuE5rdDXinyjIdVA8kX85QqrtMIrnrNN28HSKflNrACZjBPv8kXN-PwHPy2vmL6IZpVnhZlm6B3OlAxVukge7EaFLEXUCARJXYSSrzMUi1kNaafNJ3rCAMhf7ShUpcTaQGb9gt0H2woHYCb~bvj074JsLb2RXecXZAMNQTJ2rymkUskdozZbixGdt2kHL0~HzIDFlxMQguDM-lLB~40pogN9qD1vwsQJvHpIUDqdRPTSPpLHaGgCY93s7MvTwBD7K9TNRak4wj79l~JBqCSlrdcJpa2Rxc-xrH0-Gs4oL8Q__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/644e/6a0c/8685771e8012fc7315b4da64384c03b2?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Diu91x241utLjY73SOUlkSKGkMDg1uufajnz~WYZA9D96-zddXHgiPk~2V9IvL80vbFS2S2lP8vOo4Tk4uOpajCb~EhjQjG2Hf8JdPTTnyMlMeMTOO2RMGkKZpT2ksZ9GfHPRlWEIaw~baf-z-YJNUcRLjpHhaC7m3v5EnjS19FS8Wa9AnphJjGKC518hvrDtJeJDJcLvuN2FKPtexrMjCXA6rOlPpXbhnYCg49x6vRn9oTaPMvTtuiID4CYQQ-d-2ICrItiqc5CG6yX4cwkM81WoWyYKRjM6qiV7Z638G1scDvvU~XHDpdUMzroFGPzubZ0pQlNfe2jtq75oLydnA__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/0701/0e1a/eda489af3bb195329ed761744130f2c5?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=HCKz~J3vlwKznpYz1I0h4-oV5CUKbZ9vZTTEjYI1WoklyN1aKzpOAa7bwjyKVHcSIgGJ4lCR3EBkSJ7zaTaXhEDtorYnOq3I4ZzLNAgI6x9HdnPpn2cYNSHy5QHU0xjfuLyPSOC5PxU1f5f192PGVOpGPvfjIR5cp-poS~Lk1TV1bCYmFS5wdu0ADmoMNsJfgn6AGlgptM4lyIosXECKcAO81M7VqLG3gqJhiXIzBEe2Q89pm700mDt0T3oSR8qb5YXpMRYrDNU-2HDp46ztN81BrGsslXj4hLCTBbgbVPhShwk3BHj8FrewqbIpSDKDnvpGmM7-zdgli0n1hLa8WA__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/102b/3c01/73629a9dc2bc50aff25b6f4866ea3f74?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=d4qjFSdsLHJTcbqJskWDgVBA~RRUi-9xOkXJwe~66aaSQM~svxzXf~qQ8d-iPX4B~fCtVgUgIXFZ9LWgusUiZlhgF0reU4zzh9IWbc0BG-qet3BJW-0ZA0-3DUtgsSN2Dg5XhCIJLT0G6hDts7k1QX-ALyzm3aMHkWsye23VRC2f4XOTqvFYIPkCBeCvi-4qGKRLFIL2YnhnVjOlx2iAE1WQDucLgdJ-WPK9KOTx-TdOcjJJaIBN7E7cHc6~qZZFxFuXijhtl3ppU8cvY27ojXdDZGRXbihCS62j3y5eQvT7A-HZ9lhUm2839fd3gJvFJWhsawGa3OShzXxWPz9U5g__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/db09/feba/3cb844d67636c6a0e73fcd9f7eddd115?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=L3qLCCsYFGliTh1BfTgZn-~zyqwfG8clRKp6yh3PPyxkpLJRIP6XYS8JjYw0Z-GSwupYGoK42NZVDmocED5mq9WrvjLNajZfvOqqS1ZKx41S9-n8RkHUlfl4~uTf0jr8XXPI6VN51FmX3Og~mvwbhdZ2suOU0Tfzx7ZV34N4qd-5cyxXnPPYVJEia0~eY~NkHzicTSmUROYzi2HN7AYvDqg874Rdjp~pVOimtVtlVRcqTI~V2ENy8we6DsGDvLZl4LegfPNKaHy7~FEeG76HIHYgLDktsFh9FYBiDWx~kCEV49wnRai-QRrkq61Y3y~x9203iJ3T1q9naUotGoLUzw__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/4a7e/e6ca/d1710e3e2619cd92705069a29344b165?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=BqkNiWyCulsOaxOv7M9pm9MN-~pfPcr5wfrWWoSxVrRGn2qrOZp4D1Rvmtilt47p0RAoI-StQI~k~II5zbYEKiTtrE4uzpGdbvTpv4s0Yx~cBSM7U6osoZsT9SoTJKCLKZw-20xtt3OhMa652zkrbrUShBdCYUq6Cy54UmS6rhajq8o4Cpokx1T6dF1uy3C~GSBZZih~LIuAgKw5wTjFumfxnIjGXAag~F04NIaPU9jMmWM9QAmGJ6uQk~FpRiw2~ybFRlXyozz6-KJqyo1ttn8CPl8RRr~kmLT8groUT6x8215Gy-FzA4j5WW9BnEUzmP53fmG4B9qoXaICx2oNFQ__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/1edd/015d/dc5e791d0bb0db166122db283583bb7d?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=koFV5Mtqaw5rNQDUU-rmZGfoxn31BGYffYhD5nMiEEDp~NL9BqAi6KxxKbofdqa2fDnywRxKIrLow9TS8Xuy1znT~ddljtBkWlQ-swyZqie5h~6Xrf8d9xmwQT5sKxovMq-Y7u1KsbdNpJH--6~QsypdrEESMh5IdZMIMGWF9ca3aXMzlxPt7RnspPn5Iu6iAIo6M68Jkk6fDrwLj7SHr38ylO4B3-JWMm4IL1AABamnad5yVVpA236De2~~bY6Nagd3Xenf2hSmKANoSfPxWypYEuapJaglSALNuG-MC~FQaivxfCQIMCf5iN90yl0TTWYt8E2RdjxUhx~zK7nB8w__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/c3c5/58af/a6ad1f78192d8dbbe42072501f0fb2bd?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=hdrSUfiGYh4vJUh4nfhV9ptFu2zF7pUGI3f5giODi1FD07vnd~Ac7CgeHjr0IVcVjXURjwBH~6J7F13ptSmTXK0qT66lt7ZrG-7aRvWs5ixlh62v3DYjs4MU~lcFM31p-2ZagExQDSd-xUlM5nbWaBLeH3w9sX0jpFCDyOLEVwJMQsDwdR9Bw4RU1CVrZg8AUJApbS4izIYEzPLHFwXk570~el8N-EykZ8Z7om~WuOWExUHP1Tbauku14u32yBlOdDFVeNEr3eo54JhOMFbgVpkCqxiRJH0gbuqJBo8DwupEdX9X-zF5dSN-Njs79bbK5VbtqwccCvyuDLmwKMS-XQ__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/125b/c343/06ce7cb040ca34b34e18b85f563739cd?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=fUoHTProOp35C3WWrwxmaztvOazCHbviGO5looa62de-WTMiHgVjMmKdpVou9qE5kYre7FSx0vXpW8Bit~4tP9rKWgTy3FGnQeQeL~gN4uuFuXBgLSqdwsabVts9QVGEwFPvHpxD18oW9G6W6uS63quLP2VAC3YpmOjERunXpKl380~q6CoTKnJ7dDDcb63Bw6O4VFCv~Koz~cD~uu3wqIZLt-qMXLGjfaOHD7kcSaRkbhXDhrsEa2QMJPBXsnONea2FfqX4MKbs4mccPfMN3juV3Cy9hB00p71p2~vZWrP7nukehe4vBOj5qQQNccWo6u8FIc7i6bSfdVw5uiqTIw__"
            className="rounded-lg aspect-square"
            alt=""
          />
        </div>
        <div>
          <img
            src="https://s3-alpha-sig.figma.com/img/577a/6878/f2f45c899583bd02757bcf4cf63bb0a0?Expires=1733702400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=H6dyCjkXzBR3wU9OeRzysZcU1KvnPRhn-AuZDm1LxCg3FbO8KxK-IZzaLoWS0f382rWs-V61-zdGzl0Re3yVBeT0o1f-Ao9YGsSXo9mDUnto3DVpoKdN1uG5LMatJe2vS9YgK8R4eBp9jf4Mqa9nqdoXW2N-33JW372btwKhHlkyzoXyWQhuUYnDRD3SOaKBO0RPbikGdiSe7uw~-MOeQ0mUH3vw0WlzHEFU970q~gyoYFcuPSVCIsN~ukUKVYglWe~~QE6ykcfRDOLMnpiZmHNqTIGdPReR3~6BtCdcHzJD9rGzzuFlI4Z1NZ4PvK2V9OrNfWBEjWxOnamLZv9AoA__"
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
    okendoStarRatingSnippet: { value: string }; // Agrega esta propiedad
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
                <small className="block flex justify-center sm:gap-3">
                  <OkendoStarRating
                      productId={product.id}
                      okendoStarRatingSnippet={product.okendoStarRatingSnippet}
                  />
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
  okendoStarRatingSnippet: metafield(
    namespace: "$app:reviews"
    key: "star_rating_snippet"
  ) {
    value
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
  const { open } = useAside();

  return (
      <div className="recommended-products text-center md:text-left">
        <div className="mx-10 py-16" id="supplements">
          <h6 className="text-center mb-8">🌟 Trending</h6>
          <h2>Supplements</h2>
          <a href="/collections">View All</a>
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={products}>
              {(response) => (
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
                              <small className="block flex justify-center sm:gap-3">
                                <OkendoStarRating
                                    productId={product.id}
                                    okendoStarRatingSnippet={product.okendoStarRatingSnippet}
                                />
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
  okendoStarRatingSnippet: metafield(
    namespace: "$app:reviews"
    key: "star_rating_snippet"
  ) {
    value
  }
}
query RecommendedProducts($country: CountryCode, $language: LanguageCode)
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
