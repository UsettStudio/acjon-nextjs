import ShopCategoryArea from "@/components/category/ShopCategory";
import ShopHeroBanner from "@/components/hero/ShopHeroBanner";
import ShopProducts from "@/components/product/ShopProducts";
import ShopFeature from "@/components/feature/ShopFeature";
import ShopBanner from "@/components/banner/ShopBanner";
import ShopCtaArea from "@/components/cta/ShopCtaArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop Modern - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <ShopHeroBanner />
            <ShopCategoryArea />
            <ShopProducts />
            <ShopBanner />
            <ShopFeature />
            <ShopCtaArea />
        </main>
    );
};

export default page;