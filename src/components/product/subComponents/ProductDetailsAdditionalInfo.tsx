import React from "react";
interface ProductAdditionalInfoItem {
    label: string;
    value: string;
};

const additionalInfo: ProductAdditionalInfoItem[] = [
    { label: "Brand", value: "Apple" },
    { label: "Style", value: "GPS" },
    { label: "Screen Size", value: "41 Millimeters" },
    {
        label: "Color",
        value: "Green Aluminum Case with Clover Sport Band",
    },
    { label: "Compatible Devices", value: "Smartphone" },
    {
        label: "Special Feature",
        value:
            "Activity Tracker, Heart Rate Monitor, Sleep Monitor, Blood Oxygen",
    },
    { label: "Capacity", value: "32GB" },
];

const ProductDetailsAdditionalInfo: React.FC = () => {
    return (
        <table>
            <tbody>
                {additionalInfo.map(({ label, value }) => (
                    <tr key={label}>
                        <th scope="row">{label}:</th>
                        <td>{value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default ProductDetailsAdditionalInfo;
