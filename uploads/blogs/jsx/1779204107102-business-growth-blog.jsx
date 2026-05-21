const BlogPost = ({ blog, images }) => {
  return (
    <main className="min-h-screen bg-[#f8fbff]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-blue-300 text-sm uppercase tracking-[4px] font-semibold mb-4">
            Cloud Company Blog
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl">
            {blog.title}
          </h1>

          <p className="text-blue-100/80 text-lg mt-6 max-w-2xl leading-relaxed">
            {blog.shortDescription}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-blue-200/80">
            <span>Written by {blog.author || "Cloud Company"}</span>
            <span className="w-1 h-1 rounded-full bg-blue-300" />
            <span>{blog.views || 0} views</span>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="max-w-6xl mx-auto px-6 -mt-14 relative z-10">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full max-h-[520px] object-cover rounded-3xl shadow-2xl border border-white"
        />
      </section>

      {/* Blog Body */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-blue-100 p-6 md:p-10">
          <section className="prose prose-lg max-w-none">
            <h2>Introduction</h2>

            <p>
              In the modern business world, having a strong digital presence is
              no longer optional. Customers now search, compare, and decide
              online before buying a product or service.
            </p>

            <p>
              A business with a professional website, clear branding, useful
              content, and smart digital marketing can build trust faster and
              reach more people.
            </p>

            <h2>Why Digital Growth Matters</h2>

            <p>
              Digital growth helps a business become more visible, more
              reliable, and more competitive. It allows customers to understand
              your services, contact you easily, and trust your brand.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-8">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h3 className="text-blue-700 font-bold text-xl mb-2">
                  Better Brand Trust
                </h3>
                <p className="text-gray-600">
                  A professional online presence makes your business look more
                  reliable and serious.
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <h3 className="text-indigo-700 font-bold text-xl mb-2">
                  More Customer Reach
                </h3>
                <p className="text-gray-600">
                  Digital platforms help you reach customers beyond your local
                  area.
                </p>
              </div>
            </div>

            <h2>Important Parts of Online Growth</h2>

            <ul>
              <li>A fast and professional website</li>
              <li>Clear service or product information</li>
              <li>Strong visual branding and design</li>
              <li>Search engine optimization</li>
              <li>Social media presence</li>
              <li>Consistent content and marketing</li>
            </ul>

            {images?.[0]?.imageUrl && (
              <img
                src={images[0].imageUrl}
                alt="Business growth visual"
                className="rounded-2xl shadow-md my-10"
              />
            )}

            <h2>How to Start</h2>

            <p>
              The best way to start is by creating a simple but professional
              website. After that, businesses can add social media marketing,
              SEO, branding, and customer communication systems.
            </p>

            <blockquote>
              Digital growth is not only about technology. It is about making
              your business easier to find, easier to trust, and easier to buy
              from.
            </blockquote>

            <h2>Final Thoughts</h2>

            <p>
              Every business can grow online with the right strategy. A good
              digital foundation helps businesses attract customers, improve
              brand value, and increase sales over time.
            </p>

            <p>
              Cloud Company helps businesses build this foundation through web
              development, app development, design, marketing, and complete
              digital solutions.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
};