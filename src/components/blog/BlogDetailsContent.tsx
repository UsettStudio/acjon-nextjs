import PostboxDetailsAuthor from "./subComponents/PostboxDetailsAuthor";
import BlogCommentItem from "./subComponents/BlogCommentItem";
import PostCommentForm from "../form/PostCommentForm";
import { BlogGridIcon } from "@/svg/blogIcons";
import Image from "next/image";
import Link from "next/link";
import { QuoteIconSeven } from "@/svg/QuoteIcons";

const BlogDetailsContent = () => {
    return (
        <>
            <div className="postbox-content mb-50">
                <h3 className="postbox-title fs-28 mb-15">News description</h3>
                <p className="mb-25">We love to bring designs to life as a developer, and I aim to do this using whatever front end tools are necessary. My
                    preferred tools more modern javascript libraries like React.js but I like to use whatever is best for the websites needs.
                    There are several reasons why a business would consider a rebrand and it doesnt necessarily mean the business
                    has been unsuccessful.</p>
                <p className="mb-45">But in order that you may see whence all this born error of those who accuse pleasure and praise pain, I will open the
                    whole matter, and explain the very things which were said by that discoverer of truth and, as it were, the architect of a
                    happy life.</p>
                <h3 className="postbox-title fs-28 mb-15">Top Investment strategies</h3>
                <p>We love to bring designs to life as a developer, and I aim to do this using whatever front end tools are necessary. My
                    preferred tools more modern javascript libraries like React.js but I like to use whatever is best for the websites needs.
                    There are several reasons why a business would consider a rebrand and it doesn&apos;t necessarily mean the business
                    has been unsuccessful.</p>
            </div>
            <div className="postbox-details-thumb mb-25">
                <Image width={983} height={469} className="img-fluid w-100" src="/assets/img/inner-image/blog/details/thumb-2.jpg" alt="thumb" />
            </div>
            <div className="row">
                <div className="col-lg-6 col-md-6">
                    <div className="postbox-details-thumb mb-25">
                        <Image width={479} height={333} className="img-fluid w-100" src="/assets/img/inner-image/blog/details/thumb-sm.jpg" alt="thumb" />
                    </div>
                </div>
                <div className="col-lg-6 col-md-6">
                    <div className="postbox-details-thumb mb-25">
                        <Image width={479} height={333} className="img-fluid w-100" src="/assets/img/inner-image/blog/details/thumb-sm-2.jpg" alt="thumb" />
                    </div>
                </div>
            </div>
            <div className="postbox-content pt-25 mb-45">
                <p>We love to bring designs to life as a developer, and I aim to do this using whatever front end tools are necessary. My
                    preferred tools more modern javascript libraries like React.js but I like to use whatever is best for the websites needs.
                    There are several reasons why a business would consider a rebrand and it doesn&apos;t necessarily mean the business
                    has been unsuccessful.</p>
            </div>
            <div className="postbox-blockquote-2 mb-45">
                <blockquote>
                    <div className="postbox-blockquote-post d-sm-flex">
                        <div className="postbox-blockquote-icon mr-30 mt-5">
                            <QuoteIconSeven />
                        </div>
                        <div className="postbox-blockquote-des">
                            <p className="mb-10 fs-38">“Success is the result of perfection,<br />
                                hard work, learning from failure, loyalty, &<br />
                                persistence”</p>
                            <span>Phil Martinez</span>
                        </div>
                    </div>
                </blockquote>
            </div>
            <div className="postbox-content mb-25">
                <p className="mb-45">We love to bring designs to life as a developer, and I aim to do this using whatever front end tools are necessary. My
                    preferred tools more modern javascript libraries like React.js but I like to use whatever is best for the websites needs.
                    There are several reasons why a business would consider a rebrand and it doesn&apos;t necessarily mean the business
                    has been unsuccessful.</p>
                <h3 className="postbox-title fs-28 mb-15">On the specificity of selectors</h3>
                <p>We love to bring designs to life as a <b className="text-black">developer,</b> and I aim to do this using whatever front end tools are necessary. My
                    preferred tools more modern javascript libraries like React.js but I like to use whatever is best for the websites.</p>
            </div>
            <div className="postbox-content mb-55">
                <p className="mb-30 fw-500 text-black">
                    The simple <span>selector that</span> : <span>not()</span> takes as an argument can be any of the following:
                </p>
                <div className="postbox-details-list">
                    <ul>
                        <li>Type selector (e.g p, span, etc.)</li>
                        <li>Class selector (e.g .element, .sidebar, etc.)</li>
                        <li>ID selector (e. #header)</li>
                        <li>Pseudo-class selector e.g :first-child, :last-of-type</li>
                    </ul>
                </div>
            </div>
            <div className="postbox-details-code mb-55">
                <pre
                    dangerouslySetInnerHTML={{
                        __html: `
li:not(.old)::after {
  content: "New!";
  color: deepPink;
}
      `,
                    }}
                />
            </div>
            <div className="postbox-content mb-50">
                <p>The specificity of the : not() pseudo-class is the specificity of its argument. The :not() pseudo-class<br /> does not add to the selector specificity, unlike other pseudo-classes.</p>
            </div>
            <div className="postbox-details-tag-2 d-xl-flex align-items-center mb-50">
                <span>Tagged with :</span>
                <div className="tagcloud">
                    <Link href="#">Blog</Link>
                    <Link href="#">Creative</Link>
                    <Link href="#">Portfolio</Link>
                    <Link href="#">Theme</Link>
                    <Link href="#">WordPress</Link>
                </div>
            </div>
            {/* postbox details author */}
            <PostboxDetailsAuthor />

            <div className="postbox-details-navigation d-flex justify-content-between align-items-center">
                <Link className="postbox-details-prev" href="/blog-details">
                    <i className="fa-sharp fa-regular fa-arrow-left"></i>
                    <span>Prev</span>
                </Link>
                <Link href="#">
                    <span><BlogGridIcon /></span>
                </Link>
                <Link className="postbox-details-next" href="/blog-details">
                    <span>Next</span>
                    <i className="fa-sharp fa-regular fa-arrow-right"></i>
                </Link>
            </div>
            <div className="postbox__comment pt-115 pb-30">
                <h3 className="postbox__comment-title">Comments(02)</h3>
                <BlogCommentItem />
            </div>
            <div className="postbox-details-form">
                <h3 className="postbox-details-form-title">Leave a Reply</h3>
                <p>Your email address will not be published. Required fields are marked *</p>
                <div className="postbox-details-form-wrapper">
                    <div className="postbox-details-form-inner">
                        <PostCommentForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogDetailsContent;