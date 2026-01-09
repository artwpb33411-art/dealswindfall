import type { AdminRole } from "./adminAuth";

const ALL_TABS = [
  "deals",
  "publishing",
  "analytics",
  "autopublish",
  "settings",
  "events",
  "blog",
  "admins",
] as const;

export const ROLE_PERMISSIONS: Record<AdminRole, readonly string[]> = {
  owner: ALL_TABS,

  super_admin: ALL_TABS,

  admin: [
    "deals",
    "publishing",
    "autopublish",
    "settings",
    "events",
    "blog",
  ],

  content_admin: [
    "deals",
    "publishing",
    "events",
    "blog",
  ],

  analytics_admin: [
    "analytics",
  ],
};
