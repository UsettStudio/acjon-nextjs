import Link from "next/link";
import BlogSearchForm from "../form/BlogSearchForm";
import blogData from "@/data/blogData";
import Image from "next/image";

/* ---------- Types ---------- */
type Category = {
    name: string;
    count: number;
    href: string;
};

type Author = {
    name: string;
    role: string;
    image: string;
    bio: string;
    socials: { label: string; href: string }[];
};

/* ---------- Data ---------- */
const categories: Category[] = [
    { name: "Articles", count: 8, href: "/blog" },
    { name: "Business", count: 4, href: "/blog" },
    { name: "Family & Divorce", count: 12, href: "/blog" },
    { name: "Web Design", count: 16, href: "/blog" },
];


const author: Author = {
    name: "Marco Smit",
    role: "Content writer at Kanik",
    image: "/assets/img/inner-image/blog/standard/blog-av-1.jpg",
    bio:
        "Insights, and Inspiration for Forward-Thinkers\nStay ahead with fresh perspectives,\nexpert tips, and behind.",
    socials: [
        { label: "FB.", href: "#" },
        { label: "TW.", href: "#" },
        { label: "LN.", href: "#" },
        { label: "YT.", href: "#" },
    ],
};

const tags = ["Creative", "Design Trends", "Development", "Lifestyle", "Acjon"];

/* ---------- Component ---------- */
const BlogSidebar = () => {
    //display latest post data
    const displayLastestPostData = blogData.slice(57, 60);

    return (
        <div className="sidebar-wrapper mb-40">
            {/* Search */}
            <div className="sidebar-widget mb-40">
                <div className="sidebar-search">
                    <BlogSearchForm />
                </div>
            </div>

            {/* Author */}
            <div className="sidebar-widget mb-40">
                <div
                    className="sidebar-widget-author text-center include-bg"
                    style={{ backgroundColor: "#C9F31D" }}
                >
                    <div className="sidebar-widget-author-img">
                        <Image width={120} height={120} src={author.image} alt={author.name} />
                    </div>

                    <div className="sidebar-widget-author-content">
                        <h4 className="sidebar-widget-author-name">{author.name}</h4>
                        <span>{author.role}</span>
                        <p>
                            {author.bio.split("\n").map((line, i) => (
                                <span key={i}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>

                    <div className="sidebar-widget-author-social">
                        {author.socials.map((item) => (
                            <Link key={item.label} href={item.href}>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Widgets */}
            <div className="sidebar-widget-main">
                {/* Categories */}
                <div className="sidebar-widget">
                    <h3 className="sidebar-widget-title">Category</h3>
                    <div className="sidebar-widget-category">
                        <ul>
                            {categories.map((cat) => (
                                <li key={cat.name}>
                                    <Link
                                        href={cat.href}
                                        className="d-flex align-items-center justify-content-between"
                                    >
                                        {cat.name}
                                        <span>{cat.count}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Latest Posts */}
                <div className="sidebar-widget">
                    <h3 className="sidebar-widget-title">Latest Posts</h3>
                    <div className="rc-post-wrap">
                        {displayLastestPostData.map((post) => (
                            <div key={post.id} className="rc-post d-flex align-items-center">
                                <div className="rc-post-thumb">
                                    <Link href={`/blog-details/${post.id}`}>
                                        <Image width={140} height={140} src={post.image} alt={post.title} />
                                    </Link>
                                </div>

                                <div className="rc-post-content">
                                    <div className="rc-post-category">
                                        <Link href="#">{post.category}</Link>
                                    </div>
                                    <h3 className="rc-post-title">
                                        <Link className="tp-line-black" href={`/blog-details/${post.id}`}>
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <div className="rc-post-meta">
                                        <span>{post.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div className="sidebar-widget">
                    <h3 className="sidebar-widget-title">Tags</h3>
                    <div className="sidebar-widget-content">
                        <div className="tagcloud">
                            {tags.map((tag) => (
                                <Link key={tag} href="#">
                                    {tag}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogSidebar;
