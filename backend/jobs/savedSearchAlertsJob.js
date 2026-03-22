import SavedSearch from "../models/SavedSearch.js";
import Property from "../models/Property.js";
import Notification from "../models/Notification.js";
import { buildPublicPropertyFilterFromQuery, _internalForJobs } from "../controllers/savedSearchController.js";

const { computeNextRunAt, buildPropertiesUrlQuery } = _internalForJobs();

function shouldRunNow(search, now) {
  if (!search.active) return false;
  if (!search.nextRunAt) return true;
  return search.nextRunAt <= now;
}

export function startSavedSearchAlertsJob({ intervalMs = 60_000 } = {}) {
  // In multi-instance deployments, we rely on atomic findOneAndUpdate to "claim" a search.
  // Each search has nextRunAt, and only one worker can update it at a time.

  const timer = setInterval(async () => {
    const now = new Date();

    try {
      // claim one due search
      const claimed = await SavedSearch.findOneAndUpdate(
        {
          active: true,
          $or: [{ nextRunAt: { $lte: now } }, { nextRunAt: { $exists: false } }],
        },
        {
          $set: {
            lastRunAt: now,
            nextRunAt: computeNextRunAt(now, "instant"),
          },
        },
        {
          sort: { nextRunAt: 1, createdAt: 1 },
          new: true,
        }
      );

      if (!claimed) return;

      // Recompute nextRunAt based on actual frequency (we set a short claim delay above)
      claimed.nextRunAt = computeNextRunAt(now, claimed.frequency);

      const since = claimed.lastNotifiedAt || claimed.createdAt || new Date(0);
      const filter = buildPublicPropertyFilterFromQuery(claimed.query || {});

      const matches = await Property.find({
        $and: [filter, { createdAt: { $gt: since } }],
      })
        .select("_id title price location createdAt")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      if (matches.length > 0) {
        const urlQuery = buildPropertiesUrlQuery(claimed.query);
        await Notification.create({
          user: claimed.user,
          type: "saved_search_match",
          title: `Saved search: ${claimed.name}`,
          message: `${matches.length} new property(ies) match your saved search.`,
          data: {
            meta: {
              savedSearchId: claimed._id,
              count: matches.length,
              url: `/properties${urlQuery}`,
              sample: matches.slice(0, 3),
            },
          },
        });
        claimed.lastNotifiedAt = now;
      }

      await claimed.save();
    } catch (err) {
      console.error("SavedSearch alerts job error:", err?.message || err);
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
