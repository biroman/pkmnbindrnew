/**
 * Anonymous Demo Component
 *
 * Demonstrates all Phase 1 anonymous user experience components.
 * This is a temporary component for testing and showcasing the functionality.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "../ui";
import {
  AnonymousLimitBanner,
  UpgradePrompt,
  FeatureLockMessage,
  StorageWarningBanner,
} from "./index";

const AnonymousDemo = () => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [promptTrigger, setPromptTrigger] = useState("onBinderLimit");

  // Mock data for demo
  const mockData = {
    binderCount: 2,
    cardCount: 35,
    totalCards: 150,
    cacheCount: 25,
  };

  const triggers = [
    { key: "onBinderLimit", label: "Binder Limit Reached" },
    { key: "onCardLimit", label: "Card Limit Reached" },
    { key: "onShareAttempt", label: "Share Attempt" },
    { key: "onExportAttempt", label: "Export Attempt" },
  ];

  const handlePromptTrigger = (trigger) => {
    setPromptTrigger(trigger);
    setShowUpgradePrompt(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Phase 1: Anonymous User Experience
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Showcasing the anonymous user limitation and upgrade components
        </p>
      </div>

      {/* Anonymous Limit Banner */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>1. Anonymous Limit Banner</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Main banner shown to anonymous users with usage stats and upgrade
              incentives
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-medium">Full Banner:</h4>
            <AnonymousLimitBanner
              currentBinderCount={mockData.binderCount}
              currentCardCount={mockData.cardCount}
            />

            <h4 className="font-medium mt-6">Compact Banner:</h4>
            <AnonymousLimitBanner
              currentBinderCount={mockData.binderCount}
              currentCardCount={mockData.cardCount}
              compact={true}
            />
          </CardContent>
        </Card>
      </section>

      {/* Storage Warning Banner */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>2. Storage Warning Banner</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Shows when local storage usage is high, promoting cloud storage
            </p>
          </CardHeader>
          <CardContent>
            <StorageWarningBanner
              binderCount={mockData.binderCount}
              totalCardCount={mockData.totalCards}
              cacheCount={mockData.cacheCount}
            />
          </CardContent>
        </Card>
      </section>

      {/* Feature Lock Messages */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>3. Feature Lock Messages</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Inline messages when users try to access locked features
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Default Variant:</h4>
              <FeatureLockMessage feature="canShare" variant="default" />
            </div>

            <div>
              <h4 className="font-medium mb-2">Bordered Variant:</h4>
              <FeatureLockMessage feature="canExport" variant="bordered" />
            </div>

            <div>
              <h4 className="font-medium mb-2">Subtle Variant:</h4>
              <FeatureLockMessage
                feature="canUseSetCompletion"
                variant="subtle"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Upgrade Prompts */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>4. Upgrade Prompts</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Modal dialogs that appear when users hit limits or try to use
              locked features
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {triggers.map((trigger) => (
                <Button
                  key={trigger.key}
                  onClick={() => handlePromptTrigger(trigger.key)}
                  variant="outline"
                  className="w-full"
                >
                  {trigger.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Usage Stats */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>5. Mock Usage Statistics</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current demo data being used
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {mockData.binderCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Binders
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {mockData.cardCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Cards in Binder
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {mockData.totalCards}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Cards
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {mockData.cacheCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Cached Items
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        trigger={promptTrigger}
      />
    </div>
  );
};

export default AnonymousDemo;
