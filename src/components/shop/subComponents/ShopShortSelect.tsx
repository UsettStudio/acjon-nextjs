"use client";
import NiceSelect from "@/ui/NiceSelect";

export function ShopShortSelect() {
    const selectHandler = () => { };

    return (
        <div className="shop__sort-item">
            <NiceSelect
                options={[
                    { value: "latest", text: "Sort by latest" },
                    { value: "best-selling", text: "Sort by best selling" },
                    { value: "top-week", text: "Sort by top week" },
                ]}
                defaultCurrent={0}
                onChange={selectHandler}
                name="sort"
            />
        </div>
    );
}
