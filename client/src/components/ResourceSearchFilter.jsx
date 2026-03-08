import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";

function ResourceSearchFilter({
  search,
  onSearchChange,
  filters,
  onFilterChange,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-3">
      {}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search facility by name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="icon"
          onClick={() => setShowFilters((p) => !p)}
          title={showFilters ? "Hide Filters" : "Show Filters"}
        >
          {showFilters ? (
            <X className="h-4 w-4" />
          ) : (
            <SlidersHorizontal className="h-4 w-4" />
          )}
        </Button>
      </div>

      {}
      {showFilters && (
        <div className="grid gap-3 rounded-lg border bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Input
              placeholder="Classroom, Lab…"
              value={filters.type}
              onChange={(e) =>
                onFilterChange("type", e.target.value.toUpperCase())
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Min Capacity</Label>
            <Input
              type="number"
              value={filters.min_capacity}
              onChange={(e) => onFilterChange("min_capacity", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => onFilterChange("date", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Start Time</Label>
            <Input
              type="time"
              value={filters.start_time}
              onChange={(e) => onFilterChange("start_time", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">End Time</Label>
            <Input
              type="time"
              value={filters.end_time}
              onChange={(e) => onFilterChange("end_time", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceSearchFilter;
