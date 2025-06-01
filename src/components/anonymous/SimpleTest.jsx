/**
 * Simple Test Component
 *
 * Basic test to verify the anonymous component system is working
 */

import { useAuth } from "../../contexts/AuthContext";
import { useStorage } from "../../storage/StorageProvider";
import { useUserLimits } from "../../hooks/useUserLimits";

const SimpleTest = () => {
  // Test AuthContext
  let authData = null;
  let authError = null;
  try {
    authData = useAuth();
  } catch (error) {
    authError = error.message;
  }

  // Test StorageProvider
  let storageData = null;
  let storageError = null;
  try {
    storageData = useStorage();
  } catch (error) {
    storageError = error.message;
  }

  // Test useUserLimits
  let limitsData = null;
  let limitsError = null;
  try {
    limitsData = useUserLimits();
  } catch (error) {
    limitsError = error.message;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Anonymous System Test</h1>

      <div className="space-y-4">
        {/* Auth Test */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Auth Context Test</h2>
          {authError ? (
            <p className="text-red-600">Error: {authError}</p>
          ) : (
            <div className="space-y-1">
              <p>User: {authData?.user ? "Logged in" : "Anonymous"}</p>
              <p>Loading: {authData?.isLoading ? "Yes" : "No"}</p>
              <p>Status: ✅ Auth context working</p>
            </div>
          )}
        </div>

        {/* Storage Test */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Storage Provider Test</h2>
          {storageError ? (
            <p className="text-red-600">Error: {storageError}</p>
          ) : (
            <div className="space-y-1">
              <p>Storage Type: {storageData?.storageType || "Unknown"}</p>
              <p>Is Anonymous: {storageData?.isAnonymous ? "Yes" : "No"}</p>
              <p>Is Connected: {storageData?.isConnected() ? "Yes" : "No"}</p>
              <p>Status: ✅ Storage provider working</p>
            </div>
          )}
        </div>

        {/* Limits Test */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">User Limits Test</h2>
          {limitsError ? (
            <p className="text-red-600">Error: {limitsError}</p>
          ) : (
            <div className="space-y-1">
              <p>Is Guest: {limitsData?.isGuest ? "Yes" : "No"}</p>
              <p>Max Binders: {limitsData?.limits?.maxBinders || "N/A"}</p>
              <p>Max Cards: {limitsData?.limits?.maxCardsPerBinder || "N/A"}</p>
              <p>Status: ✅ User limits working</p>
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <p className="text-green-800 font-medium">
            ✅ Basic system test completed!
          </p>
          <p className="text-sm text-green-600 mt-1">
            Navigate to: <code>/test/simple</code> to see this test
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
