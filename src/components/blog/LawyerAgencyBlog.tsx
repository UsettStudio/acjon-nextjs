import LawyerABlogItem from "./subComponents/LawyerABlogItem";
import blogData from "@/data/blogData";

const LawyerAgencyBlog = () => {
    return (
        <section className="lw-blog-ptb pt-160 pb-130">
            <div className="container container-1510">
                {/* Section Title */}
                <div className="text-center mb-50">
                    <span className="lw-section-subtitle mb-15">
                        <i className="fa-light fa-gavel"></i> Our latest Blog
                    </span>
                    <h4 className="tp-section-title title-playfair tp-split-title fs-52">
                        The future of design & digital <br />
                        <span>– Read now</span>
                    </h4>
                </div>

                {/* Blog Grid */}
                <div className="row">
                    {blogData.slice(25, 28).map((item, index) => (
                        <LawyerABlogItem {...item} key={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LawyerAgencyBlog;
