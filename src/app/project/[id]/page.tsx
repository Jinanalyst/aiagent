"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types";
import { GeneratorWorkspace } from "@/components/ai/GeneratorWorkspace";
import { Navigation } from "@/components/ui/navigation";

export default function ProjectPage() {
    const params = useParams();
    const { getProject } = useProjects();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            const loadedProject = getProject(params.id as string);
            if (loadedProject) {
                setProject(loadedProject);
            }
        }
        setLoading(false);
    }, [params.id, getProject]);

    if (loading) {
        return (
            <>
                <Navigation />
                <div className="flex justify-center items-center h-screen">
                    <p>Loading project...</p>
                </div>
            </>
        )
    }

    if (!project) {
        return (
            <>
                <Navigation />
                <div className="flex justify-center items-center h-screen">
                    <p>Project not found.</p>
                </div>
            </>
        )
    }

    return (
        <GeneratorWorkspace
            initialProject={project}
        />
    )
} 