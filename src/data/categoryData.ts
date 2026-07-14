import { categoryDT } from "@/types/custom-dt";

// products category data
export const products_category: categoryDT[] = [
    {
        img: "/assets/img/shop/category/product-cat-1.jpg",
        title: "Call Phone &Tablets",
        status: {
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        img: "/assets/img/shop/category/product-cat-2.jpg",
        title: "Game & Video",
        status: {
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        img: "/assets/img/shop/category/product-cat-3.jpg",
        title: "Sport Watches",
        status: {
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        img: "/assets/img/shop/category/product-cat-4.jpg",
        title: "Computers & Laptop",
        status: {
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        img: "/assets/img/shop/category/product-cat-2.jpg",
        title: "Game & Video",
        status: {
            enum: ["active", "inactive"],
            default: "active",
        },
    },
];
