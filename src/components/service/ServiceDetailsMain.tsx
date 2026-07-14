import ServiceDetailsBreadcrumb from '@/components/breadcrumb/ServiceDetailsBreadcrumb';
import ServiceDetailsStepArea from '@/components/step/ServiceDetailsStepArea';
import ServiceDetailsBanner from '@/components/banner/ServiceDetailsBanner';
import ServiceDetailsArea from '@/components/service/ServiceDetailsArea';
import ServiceDetailsFaq from '@/components/faq/ServiceDetailsFaq';
import servicesData from '@/data/serviceData';
import { IdProps } from '@/types/custom-dt';

const ServiceDetailsMain = ({ id }: IdProps) => {
    // Find the service that matches the given ID
    const service = servicesData.find((service) => service.id == id);

    return (
        <main>
            <ServiceDetailsBreadcrumb title={service?.title} />
            <ServiceDetailsBanner />
            <ServiceDetailsStepArea />
            <ServiceDetailsArea />
            <ServiceDetailsFaq />
        </main>
    );
};

export default ServiceDetailsMain;