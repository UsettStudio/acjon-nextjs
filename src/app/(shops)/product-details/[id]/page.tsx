import ProductDetailsMain from '@/components/product/ProductDetailsMain';
import { PageParamsProps } from '@/types/custom-dt';
import projectData from '@/data/projectData';

export async function generateMetadata(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const product = projectData.find((item) => item.id == Number(id));
    return {
        title: product?.title ? product.title : "Product Details - Digital Agency & Creative Portfolio",
    };
}

export default async function ProductDetails(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    return (
        <ProductDetailsMain id={id} />
    );
}
