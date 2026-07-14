import { ArrowIconTwo } from "@/svg";
import { blogDt } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

interface blogProps {
    item: blogDt;
}

const BlogSingleItem: React.FC<blogProps> = ({ item }) => {
    return (
        <div className="col-xl-6">
            <div className="cr-blog-item p-relative mb-50">
                <div className="cr-blog-thumb tp-clip-anim">
                    <Image
                        width={581}
                        height={667}
                        className="tp-anim-img"
                        data-animate="true"
                        src={item.image}
                        alt="blog image"
                    />
                </div>

                <div className="cr-blog-content">
                    <div className="dgm-blog-meta">
                        <span>- {item.category}</span>
                        <span>{item.date}</span>
                    </div>
                    <h4 className="dgm-blog-title" >
                        <Link className="tp-line-black" href={`/blog-details-2/${item.id}`}
                            dangerouslySetInnerHTML={{ __html: item.title }}
                        />
                    </h4>
                    <div className="cr-blog-link">
                        <Link className="tp-btn-anim tp-doubble-effect" href={`/blog-details-2/${item.id}`}>
                            <div className="tp-btn-text">View Details</div>
                            <i>
                                <ArrowIconTwo />
                                <ArrowIconTwo />
                            </i>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogSingleItem;
