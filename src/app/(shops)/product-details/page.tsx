
import ProductDetailsMain from "@/components/product/ProductDetailsMain";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Product Details - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <ProductDetailsMain id={1} />
    );
};

export default page;