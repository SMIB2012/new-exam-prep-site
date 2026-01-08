"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UsersEmptyProps {
  onAddUser: () => void;
}

export function UsersEmpty({ onAddUser }: UsersEmptyProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <p className="mb-2 text-sm font-medium text-muted-foreground">No users found</p>
        <p className="mb-4 text-xs text-muted-foreground">Try adjusting your search or filters</p>
        <Button variant="outline" size="sm" onClick={onAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </CardContent>
    </Card>
  );
}
