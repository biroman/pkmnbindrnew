import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  Grid3X3,
  Palette,
  Star,
  Zap,
  Heart,
  Trophy,
  Sparkles,
  Crown,
} from "lucide-react";
import { Button, Slider } from "../components/ui";
import { useAnimations } from "../contexts/AnimationContext";
import { usePageLimits } from "../hooks/usePageLimits";

const WIZARD_STEPS = [
  {
    id: "template",
    title: "Choose Template",
    description: "Pick a starting point",
  },
  { id: "basics", title: "Basic Info", description: "Name and description" },
  {
    id: "layout",
    title: "Layout & Size",
    description: "Grid and page settings",
  },
  { id: "preview", title: "Preview", description: "Review and create" },
];

const BINDER_TEMPLATES = [
  {
    id: "scratch",
    name: "Start from Scratch",
    description: "Create a completely custom binder",
    icon: Grid3X3,
    color: "from-gray-500 to-gray-600",
    popular: false,
    gridSize: "3x3",
    pageCount: 10,
  },
  {
    id: "base-set",
    name: "Base Set Collection",
    description: "Perfect for classic Pokemon Base Set cards",
    icon: Star,
    color: "from-blue-500 to-blue-600",
    popular: true,
    gridSize: "3x3",
    pageCount: 12,
  },
  {
    id: "modern-meta",
    name: "Modern Meta Cards",
    description: "Organize current competitive cards",
    icon: Zap,
    color: "from-purple-500 to-purple-600",
    popular: true,
    gridSize: "4x4",
    pageCount: 15,
  },
  {
    id: "rare-vintage",
    name: "Rare & Vintage",
    description: "Showcase your most precious cards",
    icon: Crown,
    color: "from-yellow-500 to-orange-500",
    popular: false,
    gridSize: "2x2",
    pageCount: 8,
  },
  {
    id: "favorites",
    name: "Personal Favorites",
    description: "Your most beloved Pokemon cards",
    icon: Heart,
    color: "from-pink-500 to-red-500",
    popular: false,
    gridSize: "3x4",
    pageCount: 10,
  },
  {
    id: "tournament",
    name: "Tournament Deck",
    description: "Track your competitive deck builds",
    icon: Trophy,
    color: "from-green-500 to-emerald-600",
    popular: false,
    gridSize: "3x3",
    pageCount: 6,
  },
];

const GRID_SIZES = [
  { value: "1x1", label: "1×1 Grid", cards: 1 },
  { value: "2x2", label: "2×2 Grid", cards: 4 },
  { value: "3x3", label: "3×3 Grid", cards: 9 },
  { value: "3x4", label: "3×4 Grid", cards: 12 },
  { value: "4x4", label: "4×4 Grid", cards: 16 },
];

// NEW GridPreviewCard Component (adapted from BinderPreferencesSection.jsx)
const GridPreviewCard = ({ size, isSelected, onClick, label }) => {
  const getGridLayout = (gridSize) => {
    switch (gridSize) {
      case "1x1":
        return { cols: 1, rows: 1 };
      case "2x2":
        return { cols: 2, rows: 2 };
      case "3x3":
        return { cols: 3, rows: 3 };
      case "3x4":
        return { cols: 3, rows: 4 };
      case "4x4":
        return { cols: 4, rows: 4 };
      default:
        return { cols: 3, rows: 3 }; // Default for safety
    }
  };

  const { cols, rows } = getGridLayout(size);
  const totalCells = cols * rows;

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 border-2 rounded-lg p-4 hover:shadow-md h-full flex flex-col items-center justify-center ${
        // Ensure vertical centering and full height
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800"
          : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Select ${label} grid layout`}
      aria-pressed={isSelected}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2.5 -right-2.5 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-md">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Grid preview */}
      <div className="flex flex-col items-center space-y-2.5">
        <div
          className={`grid gap-1 p-1.5 bg-white dark:bg-gray-800/50 rounded border border-gray-300 dark:border-gray-600 shadow-sm`}
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            width: "fit-content",
          }}
        >
          {Array.from({ length: totalCells }).map((_, index) => (
            <div
              key={index}
              className={`w-[10px] h-[14px] rounded-xs border ${
                // Adjusted cell size to w-[10px] h-[14px] for 5:7 ratio
                isSelected
                  ? "bg-blue-200 border-blue-400 dark:bg-blue-700 dark:border-blue-500"
                  : "bg-gray-200 border-gray-400 dark:bg-gray-600 dark:border-gray-500"
              }`}
            />
          ))}
        </div>

        {/* Label */}
        <div className="text-center mt-1">
          <p
            className={`text-sm font-semibold ${
              // Increased font weight for label
              isSelected
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {label}
          </p>
          <p
            className={`text-xs ${
              // Adjusted sub-label color
              isSelected
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {totalCells} cards/page
          </p>
        </div>
      </div>
    </div>
  );
};

const BinderCreationWizard = () => {
  const navigate = useNavigate();
  const { getTransition, shouldAnimate } = useAnimations();
  const { maxPages } = usePageLimits();

  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    template: null,
    name: "",
    description: "",
    gridSize: "3x3",
    pageCount: Math.min(10, maxPages),
    backgroundColor: "blue",
  });

  const currentStepId = WIZARD_STEPS[currentStep].id;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleCreateBinder();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCreateBinder = () => {
    // Mock creation - navigate to new binder
    console.log("Creating binder with data:", wizardData);
    navigate("/app/binder/new-12345");
  };

  const updateWizardData = (updates) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStepId) {
      case "template":
        return wizardData.template !== null;
      case "basics":
        return wizardData.name.trim().length > 0;
      case "layout":
        return wizardData.gridSize && wizardData.pageCount > 0;
      case "preview":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/app/binder")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Binders
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Binder
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your Pokemon card binder in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar steps={WIZARD_STEPS} currentStep={currentStep} />

        {/* Wizard Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepId}
              initial={shouldAnimate() ? { opacity: 0, x: 20 } : {}}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={getTransition()}
            >
              {currentStepId === "template" && (
                <TemplateStep
                  selected={wizardData.template}
                  onSelect={(template) =>
                    updateWizardData({
                      template,
                      gridSize: template.gridSize,
                      pageCount: template.pageCount,
                    })
                  }
                />
              )}

              {currentStepId === "basics" && (
                <BasicsStep data={wizardData} onChange={updateWizardData} />
              )}

              {currentStepId === "layout" && (
                <LayoutStep data={wizardData} onChange={updateWizardData} />
              )}

              {currentStepId === "preview" && <PreviewStep data={wizardData} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
          >
            {isLastStep ? "Create Binder" : "Continue"}
            {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
            {isLastStep && <Sparkles className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${
                  index <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }
              `}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="ml-3 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    index <= currentStep
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Template Selection Step
const TemplateStep = ({ selected, onSelect }) => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Template
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start with a pre-configured template or build from scratch
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BINDER_TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isSelected = selected?.id === template.id;

          return (
            <motion.div
              key={template.id}
              className={`
                relative cursor-pointer rounded-xl border-2 p-6 transition-all h-full flex flex-col
                ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-lg ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(template);
                }
              }}
            >
              {template.popular && (
                <div className="absolute -top-2.5 -right-2.5 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm z-10">
                  Popular
                </div>
              )}

              {isSelected && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center z-10">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div
                className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-lg flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <span>{template.gridSize} Grid</span>
                <span>{template.pageCount} Pages</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Basic Info Step
const BasicsStep = ({ data, onChange }) => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Give your binder a name and description
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Binder Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., My Base Set Collection"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe what you'll store in this binder..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// Layout Configuration Step
const LayoutStep = ({ data, onChange }) => {
  const { maxPages } = usePageLimits();

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Layout & Size
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your binder's grid and page count
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Grid Size Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Grid Size
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Choose how many cards fit on each page.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {GRID_SIZES.map((grid) => (
              <GridPreviewCard
                key={grid.value}
                size={grid.value}
                isSelected={data.gridSize === grid.value}
                onClick={() => onChange({ gridSize: grid.value })}
                label={grid.label}
              />
            ))}
          </div>
        </div>

        {/* Page Count */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Number of Pages
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Select the total number of pages in your binder (1-{maxPages}).
          </p>
          <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <Slider
              min={1}
              max={maxPages}
              step={1}
              value={[data.pageCount]}
              onValueChange={([val]) => onChange({ pageCount: val })}
              className="flex-1"
              aria-labelledby="page-count-label"
            />
            <div
              id="page-count-label"
              className="text-lg font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center bg-white dark:bg-gray-800 px-3 py-1 rounded-md shadow-sm border border-gray-300 dark:border-gray-500"
            >
              {data.pageCount}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Total cards:{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {data.pageCount *
                GRID_SIZES.find((g) => g.value === data.gridSize)?.cards || 0}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Preview Step
const PreviewStep = ({ data }) => {
  const selectedGrid = GRID_SIZES.find((g) => g.value === data.gridSize);
  const totalSlots = data.pageCount * (selectedGrid?.cards || 0);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review Your Binder
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Everything looks good? Let's create your binder!
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {data.name || "Untitled Binder"}
              </h3>
              {data.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {data.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Template
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {data.template?.name || "Custom"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Grid Size
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {selectedGrid?.label}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pages
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {data.pageCount}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Cards
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {totalSlots}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinderCreationWizard;
