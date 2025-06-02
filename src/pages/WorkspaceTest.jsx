import { WorkspaceLayout, BottomToolbar } from "../components/workspace";

/**
 * WorkspaceTest - Simple test page to verify workspace layout functionality
 */
const WorkspaceTest = () => {
  return (
    <WorkspaceLayout
      sidebar={
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Test Sidebar
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This is a test of the workspace sidebar. It should appear on
              desktop and be collapsible on mobile.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              Test Item 1
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              Test Item 2
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              Test Item 3
            </div>
          </div>
        </div>
      }
      bottomToolbar={
        <BottomToolbar
          onUndo={() => console.log("Test Undo")}
          onRedo={() => console.log("Test Redo")}
          onAddCards={() => console.log("Test Add Cards")}
          canUndo={true}
          canRedo={false}
          gridSize="3x3"
          pageNavigation={
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Test Navigation
            </div>
          }
        />
      }
    >
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Workspace Layout Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            This is the main content area. On desktop, you should see a sidebar
            on the left. On mobile, the sidebar should be collapsible via a menu
            button.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="aspect-square bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-800 dark:text-blue-200 font-semibold"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};

export default WorkspaceTest;
