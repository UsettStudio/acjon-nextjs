import HomeBlogItem from './subComponents/HomeBlogItem';
import blogData from '@/data/blogData';

const HomeBlogArea = () => {
    return (
        <div className="tp-blog-area pt-115 pb-70" style={{ backgroundColor: '#F5F7F5' }}>
            <div className="container container-1510">
                <div className="row justify-content-center">
                    <div className="col-xl-6">
                        <div className="tp-blog-title-box text-center mb-45">
                            <span className="tp-section-subtitle tp-split-title">{`// Our Blog`}</span>
                            <h3 className="tp-section-title mb-0 tp-split-title">Our Latest News</h3>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {blogData.slice(0, 3).map((item, index) => (
                        <div key={index} className="col-xl-4 col-md-6">
                            <HomeBlogItem blog={item} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeBlogArea;
