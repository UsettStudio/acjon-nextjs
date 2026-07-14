"use client";

import { useState } from "react";
import productData from "@/data/productData";
import { MinusIcon } from "@/svg/ShopIcons";
import { PlusIcon } from "@/svg";
import Image from "next/image";
import Link from "next/link";

const CartItem = () => {
    // cart state
    const [cartItems, setCartItems] = useState(
        productData.slice(0, 3).map((item) => ({
            ...item,
            cartQty: 1, // initial cart quantity
        }))
    );

    // increment
    const handleIncrease = (id: number) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        cartQty:
                            item.cartQty < item.quantity
                                ? item.cartQty + 1
                                : item.cartQty,
                    }
                    : item
            )
        );
    };

    // decrement
    const handleDecrease = (id: number) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        cartQty: item.cartQty > 1 ? item.cartQty - 1 : 1,
                    }
                    : item
            )
        );
    };

    return (
        <>
            {cartItems.map((item) => (
                <tr key={item.id}>
                    <td className="product-thumbnail">
                        <Link href="/product-details">
                            <Image
                                width={125}
                                height={148}
                                src={item.image}
                                alt={item.title}
                            />
                        </Link>
                    </td>

                    <td className="product-name">
                        <Link href="/product-details">{item.title}</Link>
                    </td>

                    <td className="product-price">
                        <span className="amount">
                            ${Number(item.price).toFixed(2)}
                        </span>
                    </td>

                    <td className="product-quantity">
                        <div className="tp-product-quantity mt-10 mb-10">
                            <span
                                className="tp-cart-minus"
                                onClick={() => handleDecrease(item.id)}
                            >
                                <MinusIcon />
                            </span>

                            <input
                                className="tp-cart-input"
                                type="text"
                                defaultValue={item.cartQty}
                                readOnly
                            />

                            <span
                                className="tp-cart-plus"
                                onClick={() => handleIncrease(item.id)}
                            >
                                <PlusIcon />
                            </span>
                        </div>
                    </td>

                    <td className="product-subtotal">
                        <span className="amount">
                            ${(Number(item.price) * item.cartQty).toFixed(2)}
                        </span>
                    </td>

                    <td className="product-remove">
                        <button type="button">
                            <i className="fa fa-times"></i>
                        </button>
                    </td>
                </tr>
            ))}
        </>
    );
};

export default CartItem;
