/**
 * Migration Manager
 *
 * Handles seamless data migration from IndexedDB (anonymous) to Firebase (registered users).
 * This will be fully implemented in Phase 4, but the foundation is set up now.
 */

import React from "react";
import { indexedDBAdapter } from "../adapters/indexedDBAdapter";
import { firebaseAdapter } from "../adapters/firebaseAdapter";
import {
  StorageError,
  STORAGE_ERROR_CODES,
} from "../adapters/storageInterface";

class MigrationManager {
  constructor() {
    this.isMigrating = false;
    this.migrationProgress = null;
    this.migrationCallbacks = new Set();
  }

  /**
   * Add callback for migration progress updates
   */
  onMigrationProgress(callback) {
    this.migrationCallbacks.add(callback);
    return () => this.migrationCallbacks.delete(callback);
  }

  /**
   * Notify all callbacks of migration progress
   */
  notifyProgress(progress) {
    this.migrationProgress = progress;
    this.migrationCallbacks.forEach((callback) => {
      try {
        callback(progress);
      } catch (error) {
        console.error("Migration progress callback error:", error);
      }
    });
  }

  /**
   * Check if user has local data that needs migration
   */
  async hasLocalDataToMigrate() {
    try {
      await indexedDBAdapter.init();
      const localData = await indexedDBAdapter.getAllData();

      return {
        hasData: localData.binders.length > 0 || localData.cards.length > 0,
        binderCount: localData.binders.length,
        cardCount: localData.cards.length,
        estimatedTime: this.estimateMigrationTime(localData),
      };
    } catch (error) {
      console.error("Error checking local data:", error);
      return { hasData: false, binderCount: 0, cardCount: 0, estimatedTime: 0 };
    }
  }

  /**
   * Estimate migration time based on data size
   */
  estimateMigrationTime(data) {
    // Rough estimates: 100ms per binder, 50ms per card
    const binderTime = data.binders.length * 100;
    const cardTime = data.cards.length * 50;
    const settingsTime = Object.keys(data.settings).length * 10;

    return Math.max(1000, binderTime + cardTime + settingsTime); // Minimum 1 second
  }

  /**
   * Main migration function
   * This is a placeholder for Phase 4 implementation
   */
  async migrateAnonymousData(userId) {
    if (this.isMigrating) {
      throw new StorageError(
        "Migration already in progress",
        STORAGE_ERROR_CODES.OPERATION_FAILED
      );
    }

    this.isMigrating = true;

    try {
      this.notifyProgress({
        stage: "initializing",
        progress: 0,
        message: "Preparing migration...",
      });

      // Phase 4 implementation will go here
      // For now, return a placeholder result

      const result = await this.performMigrationPlaceholder(userId);

      this.notifyProgress({
        stage: "complete",
        progress: 100,
        message: "Migration completed successfully!",
      });

      return result;
    } catch (error) {
      this.notifyProgress({
        stage: "error",
        progress: 0,
        message: error.message || "Migration failed",
      });

      throw new StorageError(
        "Migration failed",
        STORAGE_ERROR_CODES.OPERATION_FAILED,
        error
      );
    } finally {
      this.isMigrating = false;
    }
  }

  /**
   * Placeholder migration implementation for Phase 4
   */
  async performMigrationPlaceholder(userId) {
    // Simulate migration steps
    await this.delay(500);
    this.notifyProgress({
      stage: "reading",
      progress: 25,
      message: "Reading local data...",
    });

    await this.delay(500);
    this.notifyProgress({
      stage: "uploading",
      progress: 50,
      message: "Uploading to cloud...",
    });

    await this.delay(500);
    this.notifyProgress({
      stage: "verifying",
      progress: 75,
      message: "Verifying migration...",
    });

    await this.delay(500);
    this.notifyProgress({
      stage: "cleanup",
      progress: 90,
      message: "Cleaning up local data...",
    });

    return {
      success: true,
      migratedBinders: 0,
      migratedCards: 0,
      migratedSettings: 0,
      message: "Migration will be implemented in Phase 4",
    };
  }

  /**
   * Actual migration implementation (to be completed in Phase 4)
   */
  async performActualMigration(userId) {
    // Step 1: Read all local data
    this.notifyProgress({
      stage: "reading",
      progress: 10,
      message: "Reading local data...",
    });

    const localData = await indexedDBAdapter.getAllData();

    if (!localData.binders.length && !localData.cards.length) {
      return {
        success: true,
        migratedBinders: 0,
        migratedCards: 0,
        migratedSettings: 0,
        message: "No data to migrate",
      };
    }

    // Step 2: Set up Firebase adapter
    firebaseAdapter.setUserId(userId);

    // Step 3: Migrate binders
    this.notifyProgress({
      stage: "migrating_binders",
      progress: 30,
      message: `Migrating ${localData.binders.length} binders...`,
    });

    const migratedBinders = [];
    for (const [index, binder] of localData.binders.entries()) {
      try {
        const migratedBinder = await firebaseAdapter.createBinder({
          name: binder.name,
          description: binder.description,
          createdAt: binder.createdAt,
          // Map other binder properties as needed
        });

        migratedBinders.push({
          oldId: binder.id,
          newId: migratedBinder.id,
          binder: migratedBinder,
        });

        this.notifyProgress({
          stage: "migrating_binders",
          progress: 30 + ((index + 1) / localData.binders.length) * 20,
          message: `Migrated binder: ${binder.name}`,
        });
      } catch (error) {
        console.error(`Failed to migrate binder ${binder.name}:`, error);
        throw error;
      }
    }

    // Step 4: Migrate cards
    this.notifyProgress({
      stage: "migrating_cards",
      progress: 50,
      message: `Migrating ${localData.cards.length} cards...`,
    });

    let migratedCardsCount = 0;
    const binderIdMap = new Map(migratedBinders.map((b) => [b.oldId, b.newId]));

    for (const [index, card] of localData.cards.entries()) {
      try {
        const newBinderId = binderIdMap.get(card.binderId);
        if (newBinderId) {
          await firebaseAdapter.addCardToBinder(newBinderId, {
            id: card.cardId,
            name: card.name,
            // Map other card properties as needed
          });
          migratedCardsCount++;
        }

        this.notifyProgress({
          stage: "migrating_cards",
          progress: 50 + ((index + 1) / localData.cards.length) * 30,
          message: `Migrated ${migratedCardsCount} cards...`,
        });
      } catch (error) {
        console.error(`Failed to migrate card ${card.cardId}:`, error);
        // Continue with other cards
      }
    }

    // Step 5: Migrate settings
    this.notifyProgress({
      stage: "migrating_settings",
      progress: 80,
      message: "Migrating user settings...",
    });

    let migratedSettingsCount = 0;
    if (Object.keys(localData.settings).length > 0) {
      try {
        await firebaseAdapter.updateUserSettings(localData.settings);
        migratedSettingsCount = Object.keys(localData.settings).length;
      } catch (error) {
        console.error("Failed to migrate settings:", error);
        // Non-critical, continue
      }
    }

    // Step 6: Verify migration
    this.notifyProgress({
      stage: "verifying",
      progress: 90,
      message: "Verifying migration...",
    });

    // Verify that data was migrated correctly
    const verificationResults = await this.verifyMigration(
      migratedBinders,
      migratedCardsCount
    );

    if (!verificationResults.success) {
      throw new StorageError(
        "Migration verification failed",
        STORAGE_ERROR_CODES.OPERATION_FAILED
      );
    }

    // Step 7: Clean up local data
    this.notifyProgress({
      stage: "cleanup",
      progress: 95,
      message: "Cleaning up local data...",
    });

    await indexedDBAdapter.clearAllData();

    return {
      success: true,
      migratedBinders: migratedBinders.length,
      migratedCards: migratedCardsCount,
      migratedSettings: migratedSettingsCount,
      binderIdMap: Object.fromEntries(binderIdMap),
    };
  }

  /**
   * Verify that migration was successful
   */
  async verifyMigration(migratedBinders, expectedCardCount) {
    try {
      // Check that binders exist in Firebase
      const cloudBinders = await firebaseAdapter.getBinders();

      if (cloudBinders.length < migratedBinders.length) {
        return {
          success: false,
          error: "Not all binders were migrated successfully",
        };
      }

      // Check card counts
      let totalCloudCards = 0;
      for (const binder of cloudBinders) {
        const cards = await firebaseAdapter.getBinderCards(binder.id);
        totalCloudCards += cards.length;
      }

      if (totalCloudCards < expectedCardCount) {
        return {
          success: false,
          error: "Not all cards were migrated successfully",
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Rollback migration in case of failure
   */
  async rollbackMigration(userId, migratedBinders = []) {
    try {
      firebaseAdapter.setUserId(userId);

      // Delete any binders that were created during failed migration
      for (const migratedBinder of migratedBinders) {
        try {
          await firebaseAdapter.deleteBinder(migratedBinder.newId);
        } catch (error) {
          console.error(
            `Failed to rollback binder ${migratedBinder.newId}:`,
            error
          );
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Rollback failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get migration status
   */
  getMigrationStatus() {
    return {
      isMigrating: this.isMigrating,
      progress: this.migrationProgress,
    };
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const migrationManager = new MigrationManager();

/**
 * React hook for migration status
 */
export const useMigrationStatus = () => {
  const [status, setStatus] = React.useState(
    migrationManager.getMigrationStatus()
  );

  React.useEffect(() => {
    const unsubscribe = migrationManager.onMigrationProgress((progress) => {
      setStatus({
        isMigrating: migrationManager.isMigrating,
        progress,
      });
    });

    return unsubscribe;
  }, []);

  return status;
};

export default migrationManager;
