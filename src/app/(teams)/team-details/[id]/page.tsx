import TeamDetailsMain from '@/components/team/TeamDetailsMain';
import { PageParamsProps } from '@/types/custom-dt';
import teamMembers from '@/data/teamData';

export async function generateMetadata(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const team = teamMembers.find((item) => item.id == Number(id));
    return {
        title: team?.name ? team.name : "Team Details",
    };
}

export default async function TeamDetails(props: PageParamsProps) {
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    return (
        <TeamDetailsMain id={id} />
    );
}