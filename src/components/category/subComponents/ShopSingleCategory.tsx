import { categoryDT } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ShopSingleCategory:React.FC<{ item: categoryDT }> = ({ item }) => {
    return (
        <div className="product__category-item mb-20 text-center">
            <div className="product__category-thumb w-img">
                <Link href="/shop">
                    <Image
                        className="img-fluid"
                        src={item.img}
                        alt="image"
                        width={332}
                        height={222}
                        priority
                    />
                </Link>
            </div>
            <div className="product__category-content">
                <h3 className="product__category-title">
                    <Link href="/shop">{item.title}</Link>
                </h3>
            </div>
        </div>
    );
};

export default ShopSingleCategory;
