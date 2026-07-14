import ImageHoverRevealProvider from '@/provider/ImageHoverRevealProvider';
import StartupABlogItem from './subComponents/StartupABlogItem';
import blogData from '@/data/blogData';

const StartupAgencyBlog = () => {
    return (
        <ImageHoverRevealProvider>
            <div className="sa-blog-ptb pt-150">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="sa-blog-title-box pb-50 tp_fade_anim" data-delay=".3">
                                <span className="tp-section-subtitle st-unbounded st-dot st-border">
                                    Our Blog
                                </span>
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="sa-blog-title-box pb-50 tp_fade_anim" data-delay=".4">
                                <h3 className="tp-section-title fs-42 tl-unbounded fw-500">
                                    The Art of Digital <br /> Storytelling.
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {blogData.slice(9, 12).map((post, index) => (
                            <StartupABlogItem {...post} key={index} />
                        ))}
                    </div>
                </div>
            </div>
        </ImageHoverRevealProvider>
    );
};

export default StartupAgencyBlog;
