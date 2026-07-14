
import ProjectDetailsMain from '@/components/project/ProjectDetailsMain';
import { PageParamsProps } from '@/types/custom-dt';
import projectData from '@/data/projectData';

export async function generateMetadata(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const project = projectData.find((item) => item.id == Number(id));
    return {
        title: project?.title ? project.title : "Project Details - Digital Agency & Creative Portfolio",
    };
}

export default async function ProjectDetails(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    return (
        <ProjectDetailsMain id={id} />
    );
}