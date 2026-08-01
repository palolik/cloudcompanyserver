import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import SeoHead from "../../Seohead";
import { base_url } from "../../config/config";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${base_url}/publicblogs`)
      .then((res) => res.json())
      .then((data) => setBlogs(Array.isArray(data) ? data : data.blogs || []))
      .catch((error) => console.error("Error fetching blogs:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SeoHead
        title="Blog"
        description="Read Cloud Company's latest articles, guides, and insights on web development, app development, design, and digital marketing."
        canonical="/blog"
      />
      <Navber />

      <section className="text-center px-6 py-24"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)" }}>
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs tracking-[2.5px] uppercase px-5 py-2 rounded-full mb-6 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> Cloud Company Blog
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-semibold text-blue-50 leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Latest <em className="italic text-blue-400">Articles & Updates</em>
        </h1>
        <p className="text-blue-300/60 font-light text-base max-w-md mx-auto leading-relaxed">
          Guides, updates, and digital business insights from our team.
        </p>
      </section>

      <div className="max-w-6xl mx-auto w-full px-6 py-16 flex-1">
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-light text-sm">Loading articles...</p>
          </div>
        )}

        {!loading && blogs.length === 0 && (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl font-semibold text-gray-700 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>No articles yet</h3>
            <p className="text-gray-400 font-light">Check back soon for new posts.</p>
          </div>
        )}

        {!loading && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog._id} to={`/blog/${blog.slug}`}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 block"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

                <div className="h-52 overflow-hidden bg-gray-100">
                  <img src={blog.coverImage} alt={blog.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                      {blog.author || "Cloud Company"}
                    </span>
                    <span className="text-xs text-gray-400">{blog.views || 0} views</span>
                  </div>
                  <h2 className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-gray-400 font-light leading-relaxed line-clamp-2 mb-4">
                    {blog.shortDescription}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-500 font-medium">Read More</span>
                    <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-500 flex items-center justify-center text-blue-500 group-hover:text-white text-xs transition-all duration-200">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogList;
