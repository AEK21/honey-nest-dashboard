CREATE TABLE `tameio_entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `entry_date` text NOT NULL,
  `cash` real NOT NULL DEFAULT 0,
  `card` real NOT NULL DEFAULT 0,
  `a_value` real NOT NULL DEFAULT 0,
  `last_day_cash` real NOT NULL DEFAULT 0,
  `exoda` real NOT NULL DEFAULT 0,
  `cash_se_king` real NOT NULL DEFAULT 0,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX `tameio_entries_date` ON `tameio_entries` (`entry_date`);
