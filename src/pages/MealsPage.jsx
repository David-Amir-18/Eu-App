import { useState, useEffect } from "react";
import { Button } from "../components/atoms/Button.jsx";
import { cn } from "../components/utils.js";
import { DefinedField } from "../components/molecules/DefinedField.jsx";
import { getMeals, getFilterOptions, getMeal } from "../api/mealsService.js";

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);

  // New States for API integration
  const [meals, setMeals] = useState([]);
  const [tags, setTags] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [useProfile, setUseProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const pageSize = 12;

  // Plans / Add-to-Plan State
  const [userPlans, setUserPlans] = useState([]);
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [mealToAddToPlan, setMealToAddToPlan] = useState(null);
  const [targetPlanId, setTargetPlanId] = useState("");
  const [targetSlot, setTargetSlot] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Load plans and filters on component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user_plans");
      const parsed = stored ? JSON.parse(stored) : [];
      const dietPlans = parsed.filter((p) => p.defaultTab === "Diet");
      setUserPlans(dietPlans);
      if (dietPlans.length > 0) {
        setTargetPlanId(dietPlans[0].id);
        const slots = dietPlans[0].mealSlots ||
          dietPlans[0].rawMealSlots || [
            "Breakfast",
            "Lunch",
            "Dinner",
            "Snacks",
          ];
        setTargetSlot(slots[0]);
      }
    } catch (e) {
      console.error(e);
    }

    // Fetch tags
    const fetchTags = async () => {
      try {
        const res = await getFilterOptions();
        setTags(res.tags || []);
      } catch (err) {
        console.error("Failed to fetch tags", err);
      }
    };
    fetchTags();
  }, []);

  // Fetch meals when filters or page change
  useEffect(() => {
    const fetchMeals = async () => {
      setIsLoading(true);
      try {
        const res = await getMeals({
          page: currentPage,
          page_size: pageSize,
          search: searchQuery,
          tag: activeTab,
          use_profile: useProfile,
        });
        
        setMeals(res.results || []);
        setTotalRecords(res.total || 0);
      } catch (err) {
        console.error("Failed to fetch meals", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      fetchMeals();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [currentPage, searchQuery, activeTab, useProfile]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, useProfile]);

  // Fetch detailed meal
  const handleMealClick = async (mealItem) => {
    setIsDetailLoading(true);
    // Optimistically open modal with list-level data
    setSelectedMeal({ ...mealItem, isFetchingDetail: true });

    try {
      const detail = await getMeal(mealItem.id);
      setSelectedMeal(detail);
    } catch (err) {
      console.error("Failed to fetch meal details", err);
      // fallback to basic info if detail fails
      setSelectedMeal({
        ...mealItem,
        instructions: [],
        ingredients: [],
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Dynamic slot updating when plan selection changes
  const handlePlanChange = (planId) => {
    setTargetPlanId(planId);
    const selectedPlan = userPlans.find((p) => p.id === planId);
    if (selectedPlan) {
      const slots = selectedPlan.mealSlots ||
        selectedPlan.rawMealSlots || ["Breakfast", "Lunch", "Dinner", "Snacks"];
      setTargetSlot(slots[0]);
    }
  };

  // Add meal to selected plan & slot in LocalStorage
  const handleAddMealToPlan = () => {
    if (!targetPlanId || !targetSlot || !mealToAddToPlan) return;

    try {
      const stored = localStorage.getItem("user_plans");
      const parsed = stored ? JSON.parse(stored) : [];

      const updatedPlans = parsed.map((plan) => {
        if (plan.id === targetPlanId) {
          if (!plan.slots) {
            const slotsToUse = plan.mealSlots ||
              plan.rawMealSlots || ["Breakfast", "Lunch", "Dinner", "Snacks"];
            plan.slots = slotsToUse.map((label) => ({
              id: label.toLowerCase(),
              label: label,
              time:
                label === "Breakfast"
                  ? "7:00 AM"
                  : label === "Lunch"
                    ? "12:30 PM"
                    : "7:00 PM",
              meals: [],
              selectedMealId: null,
              taken: false,
            }));
          }

          plan.slots = plan.slots.map((s) => {
            if (s.label.toLowerCase() === targetSlot.toLowerCase()) {
              const exists = s.meals.some((m) => m.id === mealToAddToPlan.id);
              if (!exists) {
                s.meals.push({
                  id: mealToAddToPlan.id,
                  name: mealToAddToPlan.title, // Backend uses title
                  calories: mealToAddToPlan.nutrition?.calories_cal || 0,
                  protein: mealToAddToPlan.nutrition?.protein_g || 0,
                  carbs: mealToAddToPlan.nutrition?.carbohydrates_g || 0,
                  fat: mealToAddToPlan.nutrition?.total_fat_g || 0,
                  image: mealToAddToPlan.image_url,
                  warning: null,
                });
              }
              s.selectedMealId = mealToAddToPlan.id;
            }
            return s;
          });
        }
        return plan;
      });

      localStorage.setItem("user_plans", JSON.stringify(updatedPlans));

      const planName =
        userPlans.find((p) => p.id === targetPlanId)?.name || "Plan";
      setToastMessage(
        `"${mealToAddToPlan.title}" added to ${targetSlot} in "${planName}"!`,
      );
      setShowAddToPlanModal(false);

      setTimeout(() => setToastMessage(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 relative">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-success-500 text-neutral-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-down border border-success-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-body-md font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── Header Area ── */}
      <div className="shrink-0 bg-surface-primary border-b border-border-primary pt-12 pb-8 px-8 md:px-12 relative overflow-hidden animate-fade-in">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-meals-prim rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 bg-meals-sec rounded-full opacity-25 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-heading-h3 font-bold text-text-headings">
              All Meals
            </h1>
            <p className="text-body-lg text-text-disabled max-w-xl">
              Discover and select rich, nutritious recipes to customize your
              personalized diet plans.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto shrink-0">
            {/* Profile Recommendation Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-neutral-100 px-4 py-2.5 rounded-xl border border-border-primary hover:border-meals-prim transition-colors">
              <input
                type="checkbox"
                checked={useProfile}
                onChange={(e) => setUseProfile(e.target.checked)}
                className="w-4 h-4 text-meals-prim bg-neutral-100 border-border-primary rounded focus:ring-meals-prim"
              />
              <span className="text-body-sm font-semibold text-text-body">
                Recommended for Me
              </span>
            </label>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-primary border border-border-primary rounded-xl pl-11 pr-4 py-2.5 text-body-md text-text-body focus:outline-none focus:border-meals-prim shadow-sm transition-all"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-text-disabled absolute left-4 top-1/2 -translate-y-1/2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Filters */}
        <div className="flex flex-wrap gap-2 mt-8 bg-neutral-100 p-1.5 rounded-xl border border-border-primary w-fit relative z-10">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-body-sm font-semibold transition-all capitalize",
              activeTab === "all"
                ? "bg-surface-primary text-meals-prim shadow-sm border border-border-primary"
                : "text-text-disabled hover:text-text-headings",
            )}
          >
            All
          </button>
          {tags.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-body-sm font-semibold transition-all capitalize",
                activeTab === tab
                  ? "bg-surface-primary text-meals-prim shadow-sm border border-border-primary"
                  : "text-text-disabled hover:text-text-headings",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid List Content ── */}
      <div
        className="flex-1 flex flex-col px-8 py-8 md:px-12 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-meals-prim border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : meals.length > 0 ? (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 mb-8">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="break-inside-avoid mb-6 group flex flex-col rounded-2xl border border-border-primary bg-surface-primary overflow-hidden shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                  onClick={() => handleMealClick(meal)}
                >
                  {/* Meal Cover Photo */}
                  <div className="relative h-44 overflow-hidden shrink-0">
                    <img
                      src={
                        meal.image_url ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={meal.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/60 to-transparent" />
                  </div>

                  {/* Card Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                      <h3
                        className="text-body-lg font-bold text-text-headings leading-snug line-clamp-1 group-hover:line-clamp-none transition-all duration-300text-body-lg font-bold text-text-headings leading-snug line-clamp-1 group-hover:line-clamp-none transition-all duration-300"
                        title={meal.title}
                      >
                        {meal.title}
                      </h3>
                      <p className="text-body-xs text-text-disabled">
                        {meal.prep_time ? `${meal.prep_time} prep` : ""}
                        {meal.servings ? ` ${meal.servings} servings` : ""}
                      </p>
                      {meal.tags?.[0] && (
                        <div className="text-center mt-1 mb-2 w-fit rounded-round shadow-sm capitalize font-bold bg-meals-sec-100 px-2.5 py-1 text-meals-prim text-body-xs">
                          {meal.tags[0]}
                        </div>
                      )}

                      {meal.tags?.length > 1 && (
                        <p className="text-body-xs text-text-disabled max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-300">
                          {meal.tags.slice(1).map((tag, i) => (
                            <span
                              key={tag}
                              className="text-meals-prim font-regular inline-block px-1"
                            >
                              {tag}
                              {i !== meal.tags.length - 2 && ","}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                    {/* `` */}
                    {/* Macros Row */}
                    <div className="grid grid-cols-4 gap-2 bg-neutral-100 p-2.5 rounded-xl border border-border-primary text-center">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-extrabold text-meals-prim">
                          {meal.nutrition?.calories_cal || 0}
                        </span>
                        <span className="text-[10px] text-text-disabled uppercase font-medium">
                          kcal
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-body-sm font-extrabold text-text-headings">
                          {meal.nutrition?.protein_g || 0}g
                        </span>
                        <span className="text-[10px] text-text-disabled uppercase font-medium">
                          prot
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-body-sm font-extrabold text-text-headings">
                          {meal.nutrition?.carbohydrates_g || 0}g
                        </span>
                        <span className="text-[10px] text-text-disabled uppercase font-medium">
                          carb
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-body-sm font-extrabold text-text-headings">
                          {meal.nutrition?.total_fat_g || 0}g
                        </span>
                        <span className="text-[10px] text-text-disabled uppercase font-medium">
                          fat
                        </span>
                      </div>
                    </div>

                    {/* Add to Plan Button */}
                    <Button
                      variant="meals-primary"
                      size="sm"
                      className="w-full font-bold shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMealToAddToPlan(meal);
                        setShowAddToPlanModal(true);
                      }}
                    >
                      + Add to Plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-auto pt-4 border-t border-border-primary">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-body-sm font-semibold text-text-body">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 flex-1 flex flex-col items-center justify-center text-center border border-border-primary border-dashed rounded-2xl bg-surface-primary opacity-80 max-w-xl mx-auto w-full">
            <p className="text-body-lg font-semibold text-text-disabled mb-2">
              No meals found matching your criteria.
            </p>
            <p className="text-body-md text-text-disabled">
              Try resetting the filters or searching for another keyword.
            </p>
          </div>
        )}
      </div>

      {/* ── Meal Detail Modal ── */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs"
            onClick={() => !isDetailLoading && setSelectedMeal(null)}
          />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up border border-border-primary">
            {isDetailLoading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-12 h-12 border-4 border-meals-prim border-t-transparent rounded-full animate-spin"></div>
                <p className="text-body-md text-text-disabled font-medium">
                  Loading recipe details...
                </p>
              </div>
            ) : (
              <>
                {/* Header / Banner */}
                <div className="relative h-64 shrink-0 overflow-hidden">
                  <img
                    src={
                      selectedMeal.image_url ||
                      "https://via.placeholder.com/800x400?text=No+Image"
                    }
                    alt={selectedMeal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/80 via-neutral-black/20 to-transparent" />
                  <button
                    onClick={() => setSelectedMeal(null)}
                    className="absolute top-4 right-4 bg-neutral-black/40 hover:bg-neutral-black/60 text-neutral-white p-2 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  <div className="absolute bottom-6 left-6 right-6">
                    {selectedMeal.tags && selectedMeal.tags.length > 0 && (
                      <span className="bg-meals-prim text-neutral-white text-body-xs font-bold px-3 py-1 rounded-full shadow-md uppercase capitalize tracking-wide">
                        {selectedMeal.tags[0]}
                      </span>
                    )}
                    <h2 className="text-heading-h4 font-bold text-neutral-white mt-2 leading-tight">
                      {selectedMeal.title}
                    </h2>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">
                  {/* Macros Panel */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-body-md font-bold text-text-headings">
                      Nutrition Information
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-meals-prim-100/50 p-4 rounded-2xl border border-meals-prim-100 text-center flex flex-col justify-center">
                        <p className="text-heading-h5 font-extrabold text-meals-prim leading-none">
                          {selectedMeal.nutrition?.calories_cal || 0}
                        </p>
                        <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">
                          Calories
                        </p>
                      </div>
                      <div className="bg-neutral-100 p-4 rounded-2xl border border-border-primary text-center flex flex-col justify-center">
                        <p className="text-heading-h5 font-extrabold text-text-headings leading-none">
                          {selectedMeal.nutrition?.protein_g || 0}g
                        </p>
                        <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">
                          Protein
                        </p>
                      </div>
                      <div className="bg-neutral-100 p-4 rounded-2xl border border-border-primary text-center flex flex-col justify-center">
                        <p className="text-heading-h5 font-extrabold text-text-headings leading-none">
                          {selectedMeal.nutrition?.carbohydrates_g || 0}g
                        </p>
                        <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">
                          Carbs
                        </p>
                      </div>
                      <div className="bg-neutral-100 p-4 rounded-2xl border border-border-primary text-center flex flex-col justify-center">
                        <p className="text-heading-h5 font-extrabold text-text-headings leading-none">
                          {selectedMeal.nutrition?.total_fat_g || 0}g
                        </p>
                        <p className="text-body-xs text-text-disabled font-medium mt-1 uppercase">
                          Fats
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="flex flex-col gap-3 border-t border-border-primary pt-6">
                    <h3 className="text-body-md font-bold text-text-headings">
                      Ingredients Needed
                    </h3>
                    {selectedMeal.ingredients &&
                    selectedMeal.ingredients.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {selectedMeal.ingredients.map((ing, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-body-md text-text-body"
                          >
                            <div className="w-5 h-5 mt-0.5 rounded-md border border-meals-prim bg-meals-prim-100/30 flex items-center justify-center shrink-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3.5 h-3.5 text-meals-prim"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <span className="flex-1">{ing}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-text-disabled italic text-body-md">
                        No ingredients listed.
                      </p>
                    )}
                  </div>

                  {/* Cooking Instructions */}
                  <div className="flex flex-col gap-3 border-t border-border-primary pt-6">
                    <h3 className="text-body-md font-bold text-text-headings">
                      Cooking Instructions
                    </h3>
                    {selectedMeal.instructions &&
                    selectedMeal.instructions.length > 0 ? (
                      <ol className="flex flex-col gap-3.5">
                        {selectedMeal.instructions.map((step, idx) => (
                          <li
                            key={idx}
                            className="flex gap-4 text-body-md text-text-body items-start"
                          >
                            <span className="w-6 h-6 rounded-full bg-meals-prim-100 text-meals-prim flex items-center justify-center shrink-0 font-bold text-body-sm mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="flex-1 pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-text-disabled italic text-body-md">
                        No instructions listed.
                      </p>
                    )}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="border-t border-border-primary px-8 py-5 shrink-0 flex gap-4 bg-neutral-100">
                  <Button
                    variant="meals-outline"
                    className="flex-1 font-bold"
                    onClick={() => setSelectedMeal(null)}
                  >
                    Close Details
                  </Button>
                  <Button
                    variant="meals-primary"
                    className="flex-1 font-bold shadow-md"
                    onClick={() => {
                      setMealToAddToPlan(selectedMeal);
                      setSelectedMeal(null);
                      setShowAddToPlanModal(true);
                    }}
                  >
                    Add to Diet Plan
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Add to Plan Selection Modal ── */}
      {showAddToPlanModal && mealToAddToPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-black/50 backdrop-blur-xs"
            onClick={() => setShowAddToPlanModal(false)}
          />
          <div className="relative bg-surface-primary rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-scale-up border border-border-primary">
            <div className="px-6 py-5 border-b border-border-primary flex items-center justify-between rounded-t-3xl">
              <h3 className="text-heading-h6 font-bold text-text-headings">
                Add to Plan
              </h3>
              <button
                onClick={() => setShowAddToPlanModal(false)}
                className="text-text-disabled hover:text-text-headings transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <p className="text-body-sm text-text-disabled">
                Select which customized diet plan and meal slot you would like
                to add <strong>"{mealToAddToPlan.title}"</strong> to.
              </p>

              {userPlans.length > 0 ? (
                <>
                  <DefinedField
                    id="target-plan-select"
                    label="Target Diet Plan"
                    value={targetPlanId}
                    onChange={handlePlanChange}
                    options={userPlans.map((plan) => ({
                      value: plan.id,
                      label: plan.name,
                    }))}
                    className="mb-4"
                  />

                  <DefinedField
                    id="target-slot-select"
                    label="Meal Slot"
                    value={targetSlot}
                    onChange={setTargetSlot}
                    options={(
                      userPlans.find((p) => p.id === targetPlanId)?.mealSlots ||
                      userPlans.find((p) => p.id === targetPlanId)
                        ?.rawMealSlots || [
                        "Breakfast",
                        "Lunch",
                        "Dinner",
                        "Snacks",
                      ]
                    ).map((slot) => ({ value: slot, label: slot }))}
                  />
                </>
              ) : (
                <div className="py-6 text-center border border-border-primary border-dashed rounded-xl bg-neutral-100">
                  <p className="text-body-md font-semibold text-text-disabled mb-1">
                    No Active Diet Plans Found
                  </p>
                  <p className="text-body-sm text-text-disabled">
                    Please create a new diet plan in the Plans page first!
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-border-primary px-6 py-4 flex gap-3 bg-neutral-100 shrink-0 rounded-b-3xl">
              <Button
                variant="meals-outline"
                className="flex-1 font-bold"
                onClick={() => setShowAddToPlanModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="meals-primary"
                className="flex-1 font-bold shadow-md"
                disabled={userPlans.length === 0}
                onClick={handleAddMealToPlan}
              >
                Confirm Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
