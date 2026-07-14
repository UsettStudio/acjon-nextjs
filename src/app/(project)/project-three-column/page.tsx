import ProjectAreaThreeColumn from "@/components/project/ProjectAreaThreeColumn";
import ProjectBreadcrumb from "@/components/breadcrumb/ProjectBreadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Prosjekter – Usett 3D Studio",
};

const page = () => {
    return (
        <main>
            <ProjectBreadcrumb
                headingPrimary="Utvalgte"
                headingSecondary="prosjekter"
                breadcrumbLabel="Portefølje"
                description="Et utvalg av våre 3D-visualiseringer – eksteriør og interiør for bolig- og næringsprosjekter."
            />
            <ProjectAreaThreeColumn />
        </main>
    );
};

export default page;
