const BlogPost = ({ blog, images }) => {
  return (
    <main className="bg-white min-h-screen">
      <article className="max-w-4xl mx-auto px-5 py-10">
        {/* Blog Header */}
        <header className="mb-8">
          <p className="text-sm text-blue-600 font-semibold mb-2">
            Cloud Company Blog
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {blog.title}
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed">
            {blog.shortDescription}
          </p>

          <div className="mt-4 text-sm text-gray-400">
            Written by {blog.author || "Cloud Company"}
          </div>
        </header>

        {/* Cover Image */}
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-auto rounded-2xl shadow-md mb-10"
        />

        {/* Blog Content */}
        <section className="prose prose-lg max-w-none">
          <h2>Introduction</h2>

          <p>
            In today&apos;s digital world, every business needs a strong online
            presence. A professional website, creative branding, and proper
            marketing strategy can help a business grow faster and reach more
            customers.
          </p>

          <p>
            This blog explains why digital transformation is important and how
            businesses can use online tools to improve their visibility,
            customer trust, and sales performance.
          </p>

          <h2>Why Online Presence Matters</h2>

          <p>
            Customers now search online before making decisions. If your
            business does not have a clear digital presence, potential customers
            may choose your competitors instead.
          </p>

          <ul>
            <li>A website builds trust.</li>
            <li>Social media improves brand awareness.</li>
            <li>Good design creates a professional image.</li>
            <li>Digital marketing helps reach the right audience.</li>
          </ul>

          {/* Optional inner blog image */}
          {images?.[0]?.imageUrl && (
            <img
              src={images[0].imageUrl}
              alt="Blog visual"
              className="w-full rounded-xl shadow-sm my-8"
            />
          )}

          <h2>How Businesses Can Start</h2>

          <p>
            A business can start with a simple website, clear service details,
            professional graphics, and active social media pages. After that,
            search engine optimization and paid marketing can help bring more
            visitors.
          </p>

          <blockquote>
            A strong digital presence is not just about looking good. It is
            about building trust, reaching customers, and growing consistently.
          </blockquote>

          <h2>Conclusion</h2>

          <p>
            Digital solutions are now essential for business growth. With the
            right strategy, design, and development support, any business can
            create a powerful online identity.
          </p>
        </section>
      </article>
    </main>
  );
};