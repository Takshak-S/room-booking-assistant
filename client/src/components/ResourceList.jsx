import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

function ResourceList({ resources, onSelect, selectedId }) {
  if (resources.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No facilities found matching your criteria.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => {
        const selected = selectedId === r._id;
        return (
          <Card
            key={r._id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(r)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(r)}
            className={`cursor-pointer border-zinc-800 bg-zinc-950/60 transition-all hover:border-zinc-600 ${
              selected ? "border-primary ring-1 ring-primary" : ""
            }`}
          >
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{r.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.type}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {r.capacity}
                </div>
              </div>

              {r.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.amenities.map((a) => (
                    <Badge
                      key={a}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {a}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                size="sm"
                variant={selected ? "default" : "outline"}
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(r);
                }}
              >
                {selected ? "Selected" : "Reserve"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default ResourceList;
