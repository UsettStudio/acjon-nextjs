import { ArrowIconFourteen } from "@/svg/ArrowIcon";
import Image from "next/image";
import Link from "next/link";

/* ---------- Types ---------- */
type Comment = {
    id: number;
    name: string;
    avatar: string;
    date: string;
    message: string;
    children?: Comment[];
};

/* ---------- Icons ---------- */


/* ---------- Single Comment ---------- */
const CommentItem = ({ comment, isChild = false }: { comment: Comment; isChild?: boolean }) => {
    return (
        <li className={isChild ? "children" : ""}>
            <div className="postbox__comment-box d-flex">
                <div className="postbox__comment-info">
                    <div className="postbox__comment-avater mr-30">
                        <Image width={70} height={70} src={comment.avatar} alt={comment.name} />
                    </div>
                </div>

                <div className="postbox__comment-text">
                    <div className="postbox__comment-name d-flex justify-content-between align-items-center">
                        <h5>{comment.name}</h5>
                        <span className="post-meta">{comment.date}</span>
                    </div>

                    <p>{comment.message}</p>

                    <div className="postbox__comment-reply">
                        <Link href="#">
                            Reply <span><ArrowIconFourteen /></span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Nested Replies */}
            {comment.children && (
                <ul>
                    {comment.children.map(child => (
                        <CommentItem key={child.id} comment={child} isChild />
                    ))}
                </ul>
            )}
        </li>
    );
};

/* ---------- Main Component ---------- */
const BlogCommentItem = () => {
    const comments: Comment[] = [
        {
            id: 1,
            name: "Guy Hawkins",
            avatar: "/assets/img/inner-image/blog/details/avatar-2.jpg",
            date: "January 2, 2025",
            message:
                "I love this theme. Sometimes it’s difficult to work with some themes, because even if they are created with Elementor, you can’t edit all the things with Elementor.",
            children: [
                {
                    id: 2,
                    name: "Savannah Nguyen",
                    avatar: "/assets/img/inner-image/blog/details/avatar-3.jpg",
                    date: "January 2, 2025",
                    message:
                        "They have really taken their time to work on the appearance of the theme. Their client assistance service is also very interactive!",
                },
            ],
        },
    ];

    return (
        <ul>
            {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </ul>
    );
};

export default BlogCommentItem;
