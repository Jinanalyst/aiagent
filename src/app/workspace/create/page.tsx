import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function CreateWorkspacePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
            <Heart className="h-12 w-12 mx-auto text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Create a Workspace</h1>
        <p className="text-muted-foreground mb-8">
          Create a new place to make projects or collaborate with others.
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="workspace-name" className="sr-only">
              Workspace Name
            </label>
            <Input
              id="workspace-name"
              type="text"
              placeholder="Enter workspace name"
              className="w-full"
            />
          </div>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
                <Link href="/">Go Back</Link>
            </Button>
            <Button type="submit">
              Continue to Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 