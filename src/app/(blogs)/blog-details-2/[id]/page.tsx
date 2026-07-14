import BlogDetailsTwoMain from '@/components/blog/BlogDetailsTwoMain';
import { PageParamsProps } from '@/types/custom-dt';
import blogData from '@/data/blogData';

export async function generateMetadata(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const blog = blogData.find((item) => item.id == Number(id));
    return {
        title: blog?.title ? blog.title : "Blog Details 2",
    };
}

export default async function BlogDetails(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    return (
        <main>
            <BlogDetailsTwoMain id={id} />
        </main>
    );
}