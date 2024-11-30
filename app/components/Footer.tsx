export function Footer({}: {}) {
  return (
      <footer className="text-center md:text-left">
        <div className="flex flex-col justify-between mx-10 my-16 md:flex-row">
          <div className="mb-8 md:mb-0">
            <div className="mb-8 max-w-96 md:text-left">
              <h3 className="font-bold mb-4">Be a Part of Our Journey</h3>
              <p>Welcome to UNCMFRT. Sign up for exclusive content and we'll send you 10% off.</p>
            </div>

            <form action="" method="POST" className="flex flex-col md:flex-row">
              <label htmlFor="email"></label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="Email Address"/>
              <button type="submit" className="button-black rounded-l-none roundd text-centr">Subscribe</button>
            </form>
          </div>
          <div className="flex flex-col gap-y-5 md:flex-row gap-x-5">
            <div>
              <h6 className="font-bold mb-6">About Us</h6>
              <div className="flex flex-col gap-y-4">
                <a href="/blogs/balance-diet">Blog</a>
                <a href="">Product Reviews</a>
                <a href="">Our Story</a>
                <a href="">Delivery</a>
              </div>
            </div>
            <div>
              <h6 className="font-bold mb-6">Support</h6>
              <div className="flex flex-col gap-y-4">
                <a href="">Order Status</a>
                <a href="">Help Center</a>
                <a href="">Contact Us</a>
                <a href="">Returns</a>
              </div>
            </div>
            <div>
              <h6 className="font-bold mb-6">Important Link</h6>
              <div className="flex flex-col gap-y-4">
                <a href="">Maintenance</a>
                <a href="">Warranty</a>
                <a href="">Canadian Customers</a>
                <a href="">Setup</a>
              </div>
            </div>
            <div>
              <h6 className="font-bold mb-6">Legal</h6>
              <div className="flex flex-col gap-y-4">
                <a href="/policies/privacy-policy">Privacy Policy</a>
                <a href="/policies/terms-of-service">Terms of Service</a>
                <a href="/policies/afiliate-program">Affiliate Program</a>
                <a href="/policies/articles">Articles</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-8">
            <div>
              <h6 className="font-bold">Contact Us</h6>
            </div>
            <div>
              <p>Let Us Help You</p>
              <a href="tel:8888600572"><h3>(888) 860-0572</h3></a>
            </div>
            <h6>Connect With Us</h6>
            <div>
              <a href=""><img src="/images/social-media/img.png" alt="" className="inline h-5"/></a>
              <a href=""><img src="/images/social-media/img_1.png" alt="" className="inline h-5"/></a>
              <a href=""><img src="/images/social-media/img_2.png" alt="" className="inline h-5"/></a>
              <a href=""><img src="/images/social-media/img_3.png" alt="" className="inline h-5"/></a>
            </div>
          </div>
        </div>

        <hr className="md:!block"/>

        <div className="flex justify-between mx-10 mt-3 mb-2 flex-col gap-y-3 md:flex-row">
          <a href=""><p>© uncmfrt.com. All right reserved.</p></a>
          <p>Made with
            <img src="/images/other-icons/img.png" alt="" className="inline"/> and
            <img src="/images/other-icons/img_1.png" alt="" className="inline"/> by Arctic Grey
          </p>
        </div>
      </footer>
  );
}
