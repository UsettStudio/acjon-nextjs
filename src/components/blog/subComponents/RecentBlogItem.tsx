import { blogDt } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

interface blogProps {
    item: blogDt;
}

const RecentBlogItem: React.FC<blogProps> = ({ item }) => {
    return (
        <div className="ma-blog-item mb-5">
            <div className="row align-items-center">
                <div className="col-xl-5">
                    <div className="ma-blog-thumb mb-20">
                        <Link href={`/blog-details/${item.id}`}>
                            <Image width={238} height={159} className="w-100" src={item.image} alt="blog thumb" />
                        </Link>
                    </div>
                </div>

                <div className="col-xl-7">
                    <div className="ma-blog-content">
                        <div className="ma-blog-meta">
                            <span>By {typeof item.author === 'string' ? item.author : item.author?.name}</span>
                            <span>{item.date}</span>
                        </div>
                        <h4 className="ma-blog-title">
                            <Link className="tp-line-black" href={`/blog-details/${item.id}`}>
                                {item.title}
                            </Link>
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecentBlogItem;
