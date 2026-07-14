import ShopBreadcrumb from "@/components/breadcrumb/ShopBreadcrumb";
import ShopContentArea from "@/components/shop/ShopContentArea";
import ShopCtaArea from "@/components/cta/ShopCtaArea";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shop - Digital Agency & Creative Portfolio",
};

const page = () => {
    return (
        <main>
            <ShopBreadcrumb />
            <ShopContentArea />
            <ShopCtaArea />
        </main>
    );
};

export default page;