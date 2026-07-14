import AnimatedCounterTwo from '@/components/shared/Counter/AnimatedCounterTwo';
import React from 'react';

interface funfactProps {
    value: number
    suffix: string;
    label: string;
}
const LwAgencyFunfactItem: React.FC<funfactProps> = ({ value, suffix, label }) => {
    return (
        <div className="col-sm-6">
            <div className="lw-funfact-item text-center">
                <h4>
                    <AnimatedCounterTwo min={0} max={value} />
                    {suffix}
                </h4>
                <span>{label}</span>
            </div>
        </div>
    );
};

export default LwAgencyFunfactItem;