import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useInfiniteRestaurants, useRestaurantsPage } from "@/data/restaurants"
import { useCities, useCuisines, useDistricts } from "@/hooks/api/useCatalog"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import RestaurantListItem from "@/components/restaurant/RestaurantListItem"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TIME_SLOT_OPTIONS } from "@/lib/constants"
import { unsplashUrl } from "@/lib/format"
import { selectItems } from "@/lib/utils"
import GridViewIcon from "@/components/icons/GridViewIcon"
import ListViewIcon from "@/components/icons/ListViewIcon"
import MapIcon from "@/components/icons/MapIcon"
import RestaurantIcon from "@/components/icons/RestaurantIcon"

const SHOW_VIEW_TOGGLE = false

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const keep = new Set([1, total, current - 1, current, current + 1])
  const pages = [...keep].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | "ellipsis")[] = []
  let prev = 0
  for (const p of pages) {
    if (prev && p - prev > 1) result.push("ellipsis")
    result.push(p)
    prev = p
  }
  return result
}

export default function SearchResults() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [selectedCuisine, setSelectedCuisine] = useState(
    searchParams.get("cuisine_id") ?? "",
  )
  const [selectedCityId, setSelectedCityId] = useState(
    searchParams.get("city_id") ?? "",
  )
  const [selectedDistrictId, setSelectedDistrictId] = useState(
    searchParams.get("district_id") ?? "",
  )
  const [maxPrice, setMaxPrice] = useState(4)
  const [minRating, setMinRating] = useState(0)
  const [openNow, setOpenNow] = useState(false)
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "price">(
    "relevance",
  )
  const [date, setDate] = useState(searchParams.get("date") ?? "")
  const [time, setTime] = useState(searchParams.get("time") ?? "")
  const [page, setPage] = useState(1)

  const { data: citiesData } = useCities()
  const apiCities = citiesData?.cities ?? []
  const { data: districtsData } = useDistricts(selectedCityId || undefined)
  const apiDistricts = districtsData?.districts ?? []
  const { data: cuisinesData } = useCuisines()
  const apiCuisines = cuisinesData?.cuisines ?? []

  const isDesktop = useMediaQuery("(min-width: 640px)")
  const restaurantFilters = {
    cityId: selectedCityId,
    districtId: selectedDistrictId,
    cuisineId: selectedCuisine,
  }
  const pageSize = 20

  useEffect(() => {
    setPage(1)
  }, [selectedCityId, selectedDistrictId, selectedCuisine])

  // city_id/district_id/cuisine_id are filtered server-side; price/rating/openNow below are not.
  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteRestaurants(restaurantFilters, pageSize, { enabled: !isDesktop })

  const {
    data: pageData,
    isLoading: isPageLoading,
  } = useRestaurantsPage(restaurantFilters, page, pageSize, { enabled: isDesktop })

  const isResultsLoading = isDesktop ? isPageLoading : isInfiniteLoading
  const totalPages = pageData ? Math.max(1, Math.ceil(pageData.total / pageData.limit)) : 1

  const pagedRestaurants = isDesktop
    ? pageData?.restaurants ?? []
    : infiniteData?.pages.flatMap((p) => p.restaurants) ?? []

  const pagedFiltered = pagedRestaurants
    .filter((r) => {
      if (r.priceLevel > maxPrice) return false
      if (r.rating < minRating) return false
      if (openNow && !r.openNow) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "price") return a.priceLevel - b.priceLevel
      return (
        b.rating * Math.log(b.reviewCount) - a.rating * Math.log(a.reviewCount)
      )
    })

  const sentinelRef = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  })

  const selectedCityName =
    apiCities.find((c) => c.city_id === selectedCityId)?.name ?? ""
  const selectedDistrictName =
    apiDistricts.find((d) => d.district_id === selectedDistrictId)?.name ?? ""
  const selectedCuisineName =
    apiCuisines.find((c) => c.cuisine_id === selectedCuisine)?.name ?? ""

  const hasActiveFilters =
    !!selectedCuisine ||
    !!selectedCityId ||
    !!selectedDistrictId ||
    maxPrice !== 4 ||
    minRating !== 0 ||
    openNow ||
    !!date ||
    !!time

  const clearAllFilters = () => {
    setSelectedCuisine("")
    setSelectedCityId("")
    setSelectedDistrictId("")
    setMaxPrice(4)
    setMinRating(0)
    setOpenNow(false)
    setDate("")
    setTime("")
  }

  const activeTriggerClass = (active: boolean) =>
    active ? "border-terra text-terra bg-terra/5" : ""

  const cuisineSelect = (
    <Select
      items={{
        all: t("search.allCuisines"),
        ...Object.fromEntries(apiCuisines.map((c) => [c.cuisine_id, c.name])),
      }}
      value={selectedCuisine || "all"}
      onValueChange={(v) => setSelectedCuisine(v === "all" || !v ? "" : v)}
    >
      <SelectTrigger
        className={`bg-white shrink-0 ${activeTriggerClass(!!selectedCuisine)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("search.allCuisines")}</SelectItem>
        {apiCuisines.map((c) => (
          <SelectItem key={c.cuisine_id} value={c.cuisine_id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const citySelect = (
    <Select
      items={{
        all: t("search.allCities"),
        ...Object.fromEntries(apiCities.map((c) => [c.city_id, c.name])),
      }}
      value={selectedCityId || "all"}
      onValueChange={(v) => {
        const cityId = v === "all" || !v ? "" : v
        setSelectedCityId(cityId)
        setSelectedDistrictId("")
      }}
    >
      <SelectTrigger
        className={`bg-white shrink-0 ${activeTriggerClass(!!selectedCityId)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("search.allCities")}</SelectItem>
        {apiCities.map((c) => (
          <SelectItem key={c.city_id} value={c.city_id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const districtSelect = (
    <Select
      items={{
        all: t("search.allDistricts"),
        ...Object.fromEntries(
          apiDistricts.map((d) => [d.district_id, d.name]),
        ),
      }}
      value={selectedDistrictId || "all"}
      onValueChange={(v) => setSelectedDistrictId(v === "all" || !v ? "" : v)}
    >
      <SelectTrigger
        className={`bg-white shrink-0 ${activeTriggerClass(!!selectedDistrictId)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("search.allDistricts")}</SelectItem>
        {apiDistricts.map((d) => (
          <SelectItem key={d.district_id} value={d.district_id}>
            {d.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const priceSelect = (
    <Select
      items={{ "1": "$", "2": "$$", "3": "$$$", "4": "$$$$" }}
      value={String(maxPrice)}
      onValueChange={(v) => setMaxPrice(Number(v))}
    >
      <SelectTrigger
        className={`bg-white shrink-0 ${activeTriggerClass(maxPrice !== 4)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">$</SelectItem>
        <SelectItem value="2">$$</SelectItem>
        <SelectItem value="3">$$$</SelectItem>
        <SelectItem value="4">$$$$</SelectItem>
      </SelectContent>
    </Select>
  )

  const openNowButton = (
    <button
      onClick={() => setOpenNow(!openNow)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all shrink-0 ${
        openNow
          ? "bg-terra text-white border-terra"
          : "border-border text-ink-muted hover:border-terra"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {t("search.openNow")}
    </button>
  )

  const datePickerControl = (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder={t("search.anyDate")}
      className={`bg-white w-36 shrink-0 ${activeTriggerClass(!!date)}`}
    />
  )

  const timeSelect = (
    <Select
      items={selectItems([...TIME_SLOT_OPTIONS], ["any", t("search.anyTime")])}
      value={time || "any"}
      onValueChange={(v) => setTime(v === "any" || !v ? "" : v)}
    >
      <SelectTrigger
        className={`bg-white shrink-0 ${activeTriggerClass(!!time)}`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{t("search.anyTime")}</SelectItem>
        {TIME_SLOT_OPTIONS.map((slot) => (
          <SelectItem key={slot} value={slot}>
            {slot}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const sortSelect = (
    <Select
      items={{
        relevance: t("search.sortRelevance"),
        rating: t("search.sortRating"),
        price: t("search.sortPrice"),
      }}
      value={sortBy}
      onValueChange={(v) => setSortBy((v || "relevance") as typeof sortBy)}
    >
      <SelectTrigger className="bg-white shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">{t("search.sortRelevance")}</SelectItem>
        <SelectItem value="rating">{t("search.sortRating")}</SelectItem>
        <SelectItem value="price">{t("search.sortPrice")}</SelectItem>
      </SelectContent>
    </Select>
  )

  const clearFiltersChip = hasActiveFilters && (
    <button
      onClick={clearAllFilters}
      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-terra hover:bg-terra/5 transition-all shrink-0"
    >
      {t("search.clearFilters")}
    </button>
  )

  const viewToggle = SHOW_VIEW_TOGGLE && (
    <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
      <button
        onClick={() => setViewMode("list")}
        className={`px-3 py-2 text-sm transition-all ${
          viewMode === "list"
            ? "bg-terra text-white"
            : "bg-white text-ink-muted hover:bg-cream"
        }`}
        title={t("search.listView")}
      >
        <ListViewIcon className="size-4" />
      </button>
      <button
        onClick={() => setViewMode("map")}
        className={`px-3 py-2 text-sm transition-all ${
          viewMode === "map"
            ? "bg-terra text-white"
            : "bg-white text-ink-muted hover:bg-cream"
        }`}
        title={t("search.mapView")}
      >
        <GridViewIcon className="size-4" />
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream">
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-40 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          {/* Mobile: single horizontal-scroll row; Open now gets its own line below */}
          <div className="sm:hidden">
            <div className="relative">
              <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {cuisineSelect}
                {citySelect}
                {districtSelect}
                {priceSelect}
                {sortSelect}
                {timeSelect}
                {datePickerControl}
                {clearFiltersChip}
                {viewToggle}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-cream to-transparent" />
            </div>
            <div className="flex items-center gap-2 mt-2">{openNowButton}</div>
          </div>

          {/* Desktop: wraps, filters on the left, toggles on the right */}
          <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {cuisineSelect}
              {citySelect}
              {districtSelect}
              {priceSelect}
              {sortSelect}
              {timeSelect}
              {datePickerControl}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {openNowButton}
              {clearFiltersChip}
              {viewToggle}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ink-muted">
            {/* {t("search.resultsFound", { count: pagedFiltered.length })} */}
            {(selectedDistrictName || selectedCityName) && (
              <span>
                {" "}
                {t("search.inLocation")}{" "}
                <span className="text-terra font-medium">
                  {[selectedDistrictName, selectedCityName]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </span>
            )}
            {selectedCuisine && (
              <span>
                {" "}
                ·{" "}
                <span className="text-terra font-medium">
                  {selectedCuisineName}
                </span>
              </span>
            )}
          </p>
        </div>

        {viewMode === "list" ? (
          isResultsLoading ? (
            <p className="text-sm text-ink-muted text-center py-24">
              {t("common.loading")}
            </p>
          ) : pagedFiltered.length === 0 ? (
            <div className="text-center py-24">
              <RestaurantIcon
                className="w-12 h-12 mx-auto mb-4 text-ink-faint"
                strokeWidth={1.5}
              />
              <h3 className="font-display text-xl font-semibold text-ink mb-2">
                {t("search.noResultsTitle")}
              </h3>
              <p className="text-ink-muted text-sm mb-6">
                {t("search.noResultsSubtitle")}
              </p>
              <Button
                onClick={() => {
                  setSelectedCuisine("")
                  setSelectedCityId("")
                  setSelectedDistrictId("")
                  setOpenNow(false)
                  setMaxPrice(4)
                }}
              >
                {t("search.clearFilters")}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {pagedFiltered.map((r) => (
                  <RestaurantListItem key={r.id} restaurant={r} />
                ))}
              </div>
              {isDesktop ? (
                totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 py-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-ink-muted transition-all hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      {t("search.previousPage")}
                    </button>
                    {getPageNumbers(page, totalPages).map((p, i) =>
                      p === "ellipsis" ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-2 text-sm text-ink-faint"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            p === page
                              ? "bg-terra text-white"
                              : "text-ink-muted hover:bg-white"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-ink-muted transition-all hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      {t("search.nextPage")}
                    </button>
                  </div>
                )
              ) : (
                hasNextPage && (
                  <div ref={sentinelRef} className="py-6 text-center">
                    {isFetchingNextPage && (
                      <p className="text-sm text-ink-muted">
                        {t("common.loading")}
                      </p>
                    )}
                  </div>
                )
              )}
            </>
          )
        ) : (
          <div
            className="relative rounded-2xl overflow-hidden bg-sage-light border border-border"
            style={{ height: 500 }}
          >
            <img
              src={unsplashUrl("photo-1533929736458-ca588d08c8be", {
                width: 1200,
                height: 600,
              })}
              alt="Restaurant map"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-xs">
                <MapIcon className="size-8 text-terra mx-auto mb-2" />
                <h3 className="font-display font-semibold text-ink mb-1">
                  {t("search.mapTitle")}
                </h3>
                <p className="text-sm text-ink-muted">
                  {t("search.mapComingSoon", { count: pagedFiltered.length })}
                </p>
              </div>
            </div>
            {[
              { top: "35%", left: "42%", label: "Malis" },
              { top: "28%", left: "55%", label: "Topaz" },
              { top: "50%", left: "38%", label: "Bassac Lane" },
              { top: "22%", left: "65%", label: "Riverside" },
            ].map((pin) => (
              <div
                key={pin.label}
                className="absolute flex flex-col items-center"
                style={{ top: pin.top, left: pin.left }}
              >
                <div className="bg-terra text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-md mb-0.5 whitespace-nowrap">
                  {pin.label}
                </div>
                <div className="w-2 h-2 bg-terra rounded-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
