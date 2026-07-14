import ServiceDetailsMain from '@/components/service/ServiceDetailsMain';
import { PageParamsProps } from '@/types/custom-dt';
import servicesData from "@/data/serviceData";

export async function generateMetadata(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const service = servicesData.find((item) => item.id == Number(id));
    return {
        title: service?.title ? service.title : "Service Details",
    };
}

export default async function ServiceDetails(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    return (
        <ServiceDetailsMain id={id} />
    );
}