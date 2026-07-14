import { DribbbleIconTwo, FacebookIcon, InstragramIconTwo, TwitorIcon } from "@/svg";
import Image from "next/image";
import Link from "next/link";

const PostboxDetailsAuthor = () => {
    return (
        <div className="postbox-details-author mb-30">
            <div className="sidebar-widget-author d-flex align-items-start">
                <div className="sidebar-widget-author-img">
                    <Image width={100} height={100} src="/assets/img/inner-image/blog/details/avatar-1.jpg" alt="avater" />
                </div>
                <div className="postbox-details-content">
                    <div className="sidebar-widget-author-content">
                        <span>About Author</span>
                        <h4 className="sidebar-widget-author-name">Leslie Alexander</h4>
                        <p>
                            Phasellus et ipsum justo. Aenean fringilla a fermentum mauris non venenatis. <br />
                            Praesent at nulla aliquam ligula.
                        </p>
                    </div>
                    <div className="sidebar-widget-author-social">
                        <Link href="#">
                            <span><FacebookIcon /></span>
                        </Link>
                        <Link href="#">
                            <span><TwitorIcon /></span>
                        </Link>
                        <Link href="#">
                            <span><DribbbleIconTwo /></span>
                        </Link>
                        <Link href="#">
                            <span><InstragramIconTwo /></span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostboxDetailsAuthor;