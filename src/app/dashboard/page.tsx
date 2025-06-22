"use client";

import { Button } from "@/components/ui/button";
import { Plus, Zap, Code2 } from "lucide-react";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types";
import { format } from 'date-fns';
import { Navigation } from "@/components/ui/navigation";
import { ProfileSidebar } from "@/components/ui/profile-sidebar";
import { RenewalReminder } from "@/components/ui/renewal-reminder";

function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <p className="text-gray-500 mb-4">
                Created on {format(new Date(project.createdAt), 'PPP')}
            </p>
            <Link href={`/project/${project.id}`} passHref>
                 <Button variant="outline">Open Project</Button>
            </Link>
        </div>
    )
}


export default function DashboardPage() {
    const { projects, loading } = useProjects();

    return (
        <>
            <ProfileSidebar />
            <div className="flex flex-col min-h-screen bg-gray-100">
                <Navigation />
                <div className="flex-1 container mx-auto p-8">
                    <RenewalReminder />
                    <header className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <Link href="/generate" passHref>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Project
                            </Button>
                        </Link>
                    </header>

                    {/* Featured Tool */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-6 w-6" />
                                        <h2 className="text-2xl font-bold">AI Code Generator</h2>
                                        <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">UPDATED</span>
                                    </div>
                                    <p className="text-blue-100 mb-4">
                                        Chat with AI to generate complete web applications. Modern bolt.new-style interface with live code editor, preview, and one-click deployment.
                                    </p>
                                    <div className="flex gap-2 text-sm text-blue-100">
                                        <span className="flex items-center gap-1">
                                            <Code2 className="h-4 w-4" />
                                            Chat-based generation
                                        </span>
                                        <span>•</span>
                                        <span>Live code editor</span>
                                        <span>•</span>
                                        <span>Instant deployment</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <Link href="/generate">
                                        <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                                            <Zap className="mr-2 h-4 w-4" />
                                            Start Building
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <main>
                        {loading ? (
                            <div className="text-center">
                                <p>Loading projects...</p>
                            </div>
                        ) : projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {projects.map(project => (
                                   <ProjectCard key={project.id} project={project} />
                               ))}
                            </div>
                        ) : (
                            <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                                <h2 className="text-2xl font-semibold mb-2">Welcome to your Dashboard!</h2>
                                <p className="text-gray-500 mb-6">You don&apos;t have any projects yet.</p>
                                <Link href="/generate" passHref>
                                     <Button variant="default">Start your first project</Button>
                                </Link>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    )
} 