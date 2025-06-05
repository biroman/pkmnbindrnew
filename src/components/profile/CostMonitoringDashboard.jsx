/**
 * Cost Monitoring Dashboard
 * Real-time monitoring of Firebase costs and usage for admin users
 */

import { useState, useEffect } from "react";
import { Card, Button, Alert, Badge, Separator } from "../ui";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCurrentUsage,
  disableEmergencyMode,
  resetUsageCounters,
  estimateOperationCost,
  simulateHighUsage,
  forceEmergencyMode,
  testIncrementalCosts,
  resetAllUsageData,
} from "../../services/costProtection";
import {
  AlertTriangle,
  DollarSign,
  Activity,
  Shield,
  RefreshCw,
} from "lucide-react";

export const CostMonitoringDashboard = () => {
  const { isOwner } = useAuth();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = async (useCache = true) => {
    try {
      setRefreshing(true);

      // Optimization: Use cached data if less than 5 minutes old
      const lastFetch = localStorage.getItem("cost-monitoring-last-fetch");
      const cacheTime = 5 * 60 * 1000; // 5 minutes

      if (
        useCache &&
        lastFetch &&
        Date.now() - parseInt(lastFetch) < cacheTime
      ) {
        const cachedData = localStorage.getItem("cost-monitoring-data");
        if (cachedData) {
          setUsage(JSON.parse(cachedData));
          setError(null);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      const result = await getCurrentUsage();
      if (result.success) {
        setUsage(result.data);
        setError(null);

        // Cache the data locally to reduce Firebase reads
        localStorage.setItem(
          "cost-monitoring-data",
          JSON.stringify(result.data)
        );
        localStorage.setItem(
          "cost-monitoring-last-fetch",
          Date.now().toString()
        );
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch usage data");
      console.error("Error fetching usage:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOwner()) {
      fetchUsage();
      // Optimized: Refresh every 15 minutes instead of 5 to reduce reads
      // 96 reads/day instead of 288
      const interval = setInterval(fetchUsage, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isOwner]);

  const handleDisableEmergencyMode = async () => {
    try {
      const result = await disableEmergencyMode();
      if (result.success) {
        await fetchUsage(); // Refresh data
      } else {
        setError("Failed to disable emergency mode");
      }
    } catch (err) {
      setError("Error disabling emergency mode");
      console.error("Error:", err);
    }
  };

  const handleResetCounters = async () => {
    try {
      const result = await resetUsageCounters("daily");
      if (result.success) {
        await fetchUsage(); // Refresh data
      } else {
        setError("Failed to reset counters");
      }
    } catch (err) {
      setError("Error resetting counters");
      console.error("Error:", err);
    }
  };

  // Testing functions (DEV ONLY)
  const handleSimulateHighUsage = async () => {
    try {
      const result = await simulateHighUsage();
      if (result.success) {
        await fetchUsage(); // Refresh data
        console.log(
          "High usage simulated - try creating a binder to trigger emergency mode"
        );
      } else {
        setError("Failed to simulate high usage");
      }
    } catch (err) {
      setError("Error simulating high usage");
      console.error("Error:", err);
    }
  };

  const handleForceEmergencyMode = async () => {
    try {
      const result = await forceEmergencyMode();
      if (result.success) {
        await fetchUsage(); // Refresh data
      } else {
        setError("Failed to force emergency mode");
      }
    } catch (err) {
      setError("Error forcing emergency mode");
      console.error("Error:", err);
    }
  };

  const handleTestIncrementalCosts = async () => {
    try {
      setRefreshing(true);
      await testIncrementalCosts(5); // Test with 5 operations
      await fetchUsage(); // Refresh data
    } catch (err) {
      setError("Error testing incremental costs");
      console.error("Error:", err);
    }
  };

  const handleResetAllData = async () => {
    try {
      const result = await resetAllUsageData();
      if (result.success) {
        await fetchUsage(); // Refresh data
      } else {
        setError("Failed to reset all data");
      }
    } catch (err) {
      setError("Error resetting all data");
      console.error("Error:", err);
    }
  };

  // Add manual refresh for immediate updates when needed
  const handleManualRefresh = async () => {
    await fetchUsage();
  };

  // Don't render for non-owners
  if (!isOwner()) {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading cost monitoring data...</span>
        </div>
      </Card>
    );
  }

  const formatCost = (cost) => `$${(cost || 0).toFixed(4)}`;
  const formatCount = (count) => (count || 0).toLocaleString();

  const emergencyMode = usage?.emergencyMode || false;
  const totalCost = usage?.totalCost || 0;
  const reads = usage?.reads || {};
  const writes = usage?.writes || {};
  const deletes = usage?.deletes || {};

  // Calculate cost percentages for progress bars
  const dailyBudget = 10; // $10 daily budget
  const costPercentage = Math.min((totalCost / dailyBudget) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cost Monitoring</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <h4>Error</h4>
            <p>{error}</p>
          </div>
        </Alert>
      )}

      {/* Emergency Mode Alert */}
      {emergencyMode && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <div>
            <h4>Emergency Mode Active</h4>
            <p>
              Service is operating in cost protection mode. Some operations are
              limited.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleDisableEmergencyMode}
            >
              Disable Emergency Mode
            </Button>
          </div>
        </Alert>
      )}

      {/* Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Cost (Today)
              </p>
              <p className="text-2xl font-bold">{formatCost(totalCost)}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className={`h-2 rounded-full ${
                  costPercentage > 80
                    ? "bg-red-600"
                    : costPercentage > 60
                    ? "bg-yellow-600"
                    : "bg-green-600"
                }`}
                style={{ width: `${costPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {costPercentage.toFixed(1)}% of daily budget
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Firestore Reads
              </p>
              <p className="text-2xl font-bold">{formatCount(reads.count)}</p>
              <p className="text-xs text-gray-500">{formatCost(reads.cost)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Firestore Writes
              </p>
              <p className="text-2xl font-bold">{formatCount(writes.count)}</p>
              <p className="text-xs text-gray-500">{formatCost(writes.cost)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Shield
              className={`h-5 w-5 ${
                emergencyMode ? "text-red-600" : "text-green-600"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Protection Status
              </p>
              <Badge variant={emergencyMode ? "destructive" : "default"}>
                {emergencyMode ? "Emergency Mode" : "Normal"}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Usage Breakdown</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Operation</p>
            </div>
            <div>
              <p className="font-medium">Count</p>
            </div>
            <div>
              <p className="font-medium">Cost</p>
            </div>
          </div>
          <Separator />

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>Firestore Reads</div>
            <div>{formatCount(reads.count)}</div>
            <div>{formatCost(reads.cost)}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>Firestore Writes</div>
            <div>{formatCount(writes.count)}</div>
            <div>{formatCost(writes.cost)}</div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>Firestore Deletes</div>
            <div>{formatCount(deletes.count)}</div>
            <div>{formatCost(deletes.cost)}</div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-sm font-medium">
            <div>Total</div>
            <div>-</div>
            <div>{formatCost(totalCost)}</div>
          </div>
        </div>
      </Card>

      {/* Admin Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleResetCounters}>
              Reset Daily Counters
            </Button>

            {emergencyMode && (
              <Button
                variant="destructive"
                onClick={handleDisableEmergencyMode}
              >
                Disable Emergency Mode
              </Button>
            )}
          </div>

          {/* Development Testing Section */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              🧪 Development Testing (Local Only)
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateHighUsage}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Simulate High Usage
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleForceEmergencyMode}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Force Emergency Mode
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleTestIncrementalCosts}
                disabled={refreshing}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Test Cost Tracking
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAllData}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Reset All Data
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              These buttons are for testing cost protection features. Use them
              to simulate different scenarios.
            </p>
          </div>
        </div>
      </Card>

      {/* Cost Estimates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Estimates</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Per 1K reads:</span>
            <span>
              {formatCost(estimateOperationCost("FIRESTORE_READ", 1000))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Per 1K writes:</span>
            <span>
              {formatCost(estimateOperationCost("FIRESTORE_WRITE", 1000))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Per 1K deletes:</span>
            <span>
              {formatCost(estimateOperationCost("FIRESTORE_DELETE", 1000))}
            </span>
          </div>
        </div>
      </Card>

      {/* Monitoring Cost Impact Notice */}
      <Card className="p-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              ⚠️ Incomplete Cost Tracking
            </h3>
            <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <p>
                <strong>
                  Currently tracking only ~15% of Firebase operations:
                </strong>
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-md">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    ✅ Tracked Operations:
                  </p>
                  <ul className="list-disc ml-5 mt-1 text-xs">
                    <li>addBinder() - 2 writes</li>
                    <li>getBindersForUser() - multiple reads</li>
                    <li>getBinder() - 1 read</li>
                    <li>updateBinder() - 1 write</li>
                    <li>addCardToBinder() - 2 writes</li>
                  </ul>
                </div>

                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-md">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    ❌ Untracked Operations:
                  </p>
                  <ul className="list-disc ml-5 mt-1 text-xs">
                    <li>User profile operations (~30-70 reads/day)</li>
                    <li>Card page queries (~50-200 reads/day)</li>
                    <li>Authentication checks</li>
                    <li>TanStack Query auto-refetching</li>
                    <li>Real-time listeners</li>
                    <li>Admin operations</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-md">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  🚨 Reality Check:
                </p>
                <p className="text-xs mt-1">
                  <strong>
                    This dashboard shows ~15-20% of actual Firebase costs.
                  </strong>
                  <br />
                  Real costs are likely 5-10x higher than displayed here.
                </p>
              </div>

              <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-md">
                <p className="font-medium">💡 Tracking Strategy Options:</p>
                <ul className="list-disc ml-5 mt-1 text-xs">
                  <li>
                    <strong>Complete:</strong> Add trackOperation() to all 30+
                    Firebase functions
                  </li>
                  <li>
                    <strong>Strategic:</strong> Only track high-volume
                    operations (recommended)
                  </li>
                  <li>
                    <strong>Firebase Analytics:</strong> Use built-in usage
                    monitoring (free)
                  </li>
                  <li>
                    <strong>Cloud Function:</strong> Server-side aggregation
                    from Firebase logs
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
