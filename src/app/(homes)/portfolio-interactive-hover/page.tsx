
import PortfolioHover from '@/components/portfolio/PortfolioHover';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Portfolio interactive hover - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            <PortfolioHover />
        </main>
    );
};

export default page;