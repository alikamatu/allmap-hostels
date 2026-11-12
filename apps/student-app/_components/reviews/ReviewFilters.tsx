import { ReviewFilterDto as ReviewFiltersType } from "@repo/types";
import { CustomSelect } from "@repo/ui";

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFiltersChange: (filters: Partial<ReviewFiltersType>) => void;
  totalReviews: number;
}

export const ReviewFilters = ({
  filters,
  onFiltersChange,
  totalReviews,
}: ReviewFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-black">
          Reviews ({totalReviews})
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="w-full sm:w-44">
          <CustomSelect
            variant="pill"
            placeholder="All Ratings"
            value={filters.minRating ? String(filters.minRating) : ""}
            onChange={(val) =>
              onFiltersChange({
                minRating: val ? Number(val) : undefined,
              })
            }
            options={[
              { value: "", label: "All Ratings" },
              { value: "5", label: "5 Stars Only" },
              { value: "4", label: "4+ Stars" },
              { value: "3", label: "3+ Stars" },
              { value: "2", label: "2+ Stars" },
              { value: "1", label: "1+ Stars" },
            ]}
          />
        </div>

        <div className="w-full sm:w-48">
          <CustomSelect
            variant="pill"
            placeholder="Sort by"
            value={`${filters.sortBy || "createdAt"}-${filters.sortOrder || "DESC"}`}
            onChange={(val) => {
              const [sortBy, sortOrder] = val.split("-") as [
                typeof filters.sortBy,
                typeof filters.sortOrder,
              ];
              onFiltersChange({ sortBy, sortOrder });
            }}
            options={[
              { value: "createdAt-DESC", label: "Newest First" },
              { value: "createdAt-ASC", label: "Oldest First" },
              { value: "rating-DESC", label: "Highest Rated" },
              { value: "rating-ASC", label: "Lowest Rated" },
              { value: "helpfulCount-DESC", label: "Most Helpful" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
