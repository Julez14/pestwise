# Pestwise Database Schema

This document outlines the database schema for the Pestwise application, now integrated with Supabase for authentication and user management.

## 1. Core Tables

The database consists of several core tables that manage user profiles, locations, materials, reports, and comments.

### `auth.users` (Supabase Managed)

This table is managed by Supabase Auth and serves as the single source of truth for user authentication. It stores private user data like email and hashed passwords.

### `profiles`

Stores public user information linked to the `auth.users` table.

| Column       | Type                       | Constraints                            | Description                                   |
| ------------ | -------------------------- | -------------------------------------- | --------------------------------------------- |
| `id`         | `UUID`                     | `PRIMARY KEY`, `REFERENCES auth.users` | Foreign key to the `auth.users` table.        |
| `name`       | `VARCHAR(255)`             | `NOT NULL`                             | Full name of the user.                        |
| `role`       | `VARCHAR(50)`              | `NOT NULL DEFAULT 'technician'`        | User role (e.g., 'technician', 'supervisor'). |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                        | Timestamp of profile creation.                |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT now()`                        | Timestamp of last profile update.             |

### `locations`

Manages service locations where pest control is performed.

| Column            | Type           | Constraints                 | Description                                          |
| ----------------- | -------------- | --------------------------- | ---------------------------------------------------- |
| `id`              | `SERIAL`       | `PRIMARY KEY`               | Unique identifier for the location.                  |
| `name`            | `VARCHAR(255)` | `NOT NULL`                  | Name of the location.                                |
| `address`         | `TEXT`         | `NOT NULL`                  | Physical address of the location.                    |
| `unit`            | `VARCHAR(255)` |                             | Specific unit or suite number.                       |
| `status`          | `VARCHAR(50)`  | `NOT NULL DEFAULT 'active'` | Status of the location (e.g., 'active', 'inactive'). |
| `last_inspection` | `DATE`         |                             | Date of the last inspection.                         |
| `created_at`      | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of location creation.                      |
| `updated_at`      | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of last location update.                   |

### `location_areas`

A linking table that defines specific areas within a location (e.g., kitchen, basement).

| Column        | Type           | Constraints                 | Description                                     |
| ------------- | -------------- | --------------------------- | ----------------------------------------------- |
| `id`          | `SERIAL`       | `PRIMARY KEY`               | Unique identifier for the area.                 |
| `location_id` | `INTEGER`      | `REFERENCES locations(id)`  | Foreign key to the `locations` table.           |
| `area_name`   | `VARCHAR(255)` | `NOT NULL`                  | Name of the area (e.g., 'Kitchen', 'Basement'). |
| `created_at`  | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of area creation.                     |

### `materials`

Tracks pest control materials and supplies.

| Column           | Type           | Constraints                 | Description                                       |
| ---------------- | -------------- | --------------------------- | ------------------------------------------------- |
| `id`             | `SERIAL`       | `PRIMARY KEY`               | Unique identifier for the material.               |
| `name`           | `VARCHAR(255)` | `NOT NULL`                  | Name of the material.                             |
| `description`    | `TEXT`         |                             | Description of the material.                      |
| `material_group` | `VARCHAR(255)` | `NOT NULL`                  | Group/category of the material (e.g., 'Baits').   |
| `in_stock`       | `BOOLEAN`      | `DEFAULT true`              | Whether the material is currently in stock.       |
| `usage_count`    | `INTEGER`      | `DEFAULT 0`                 | Total number of times the material has been used. |
| `last_used`      | `DATE`         |                             | Date the material was last used.                  |
| `created_at`     | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of material creation.                   |
| `updated_at`     | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of last material update.                |

### `reports`

Contains information about pest control service reports.

| Column        | Type           | Constraints                 | Description                                           |
| ------------- | -------------- | --------------------------- | ----------------------------------------------------- |
| `id`          | `SERIAL`       | `PRIMARY KEY`               | Unique identifier for the report.                     |
| `title`       | `VARCHAR(255)` | `NOT NULL`                  | Title of the report.                                  |
| `description` | `TEXT`         |                             | Detailed description of the service provided.         |
| `location_id` | `INTEGER`      | `REFERENCES locations(id)`  | Foreign key to the `locations` table.                 |
| `unit`        | `VARCHAR(255)` |                             | Specific unit serviced at the location.               |
| `author_id`   | `UUID`         | `REFERENCES auth.users(id)` | Foreign key to the `auth.users` table for the author. |
| `status`      | `VARCHAR(50)`  | `NOT NULL DEFAULT 'draft'`  | Status of the report (e.g., 'draft', 'completed').    |
| `comments`    | `TEXT`         |                             | General comments or notes for the report.             |
| `created_at`  | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of report creation.                         |
| `updated_at`  | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of last report update.                      |

### `pest_findings`

Records specific pest findings within a report.

| Column            | Type           | Constraints                 | Description                                          |
| ----------------- | -------------- | --------------------------- | ---------------------------------------------------- |
| `id`              | `SERIAL`       | `PRIMARY KEY`               | Unique identifier for the finding.                   |
| `report_id`       | `INTEGER`      | `REFERENCES reports(id)`    | Foreign key to the `reports` table.                  |
| `finding_type`    | `VARCHAR(50)`  | `NOT NULL`                  | Type of finding ('captured', 'sighted', 'evidence'). |
| `target_pest`     | `VARCHAR(255)` | `NOT NULL`                  | The pest that was found (e.g., 'Ants', 'Rodents').   |
| `location_detail` | `VARCHAR(255)` | `NOT NULL`                  | Specific location of the finding.                    |
| `notes`           | `TEXT`         |                             | Additional notes about the finding.                  |
| `created_at`      | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of finding creation.                       |

### `report_materials`

A junction table linking reports to the materials used in them.

| Column          | Type        | Constraints                 | Description                           |
| --------------- | ----------- | --------------------------- | ------------------------------------- |
| `id`            | `SERIAL`    | `PRIMARY KEY`               | Unique identifier for the link.       |
| `report_id`     | `INTEGER`   | `REFERENCES reports(id)`    | Foreign key to the `reports` table.   |
| `material_id`   | `INTEGER`   | `REFERENCES materials(id)`  | Foreign key to the `materials` table. |
| `quantity_used` | `INTEGER`   | `DEFAULT 1`                 | Quantity of the material used.        |
| `created_at`    | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of link creation.           |

### `comments`

Stores general comments, observations, and recommendations.

| Column            | Type           | Constraints                 | Description                                        |
| ----------------- | -------------- | --------------------------- | -------------------------------------------------- |
| `id`              | `SERIAL`       | `PRIMARY KEY`               | Unique identifier for the comment.                 |
| `content`         | `TEXT`         | `NOT NULL`                  | The content of the comment.                        |
| `author_id`       | `UUID`         | `REFERENCES auth.users(id)` | Foreign key to the user who wrote the comment.     |
| `category`        | `VARCHAR(255)` | `NOT NULL`                  | Category of the comment (e.g., 'Observation').     |
| `priority`        | `VARCHAR(50)`  | `NOT NULL DEFAULT 'medium'` | Priority of the comment ('low', 'medium', 'high'). |
| `location_detail` | `VARCHAR(255)` |                             | Specific location related to the comment.          |
| `report_id`       | `INTEGER`      | `REFERENCES reports(id)`    | Optional foreign key to a related report.          |
| `created_at`      | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of comment creation.                     |
| `updated_at`      | `TIMESTAMP`    | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of last comment update.                  |

## 2. Database Views

The schema includes several views to simplify querying and reporting.

- **`report_details`**: Joins `reports`, `locations`, `profiles`, and `auth.users` to provide a detailed view of each report, including location name, author name, and a count of pest findings.
- **`location_summary`**: Aggregates data from `locations`, `location_areas`, `reports`, and `pest_findings` to provide a summary for each location, including area count, total reports, and reports with findings.
- **`material_usage_stats`**: Summarizes material usage from the `materials` and `report_materials` tables, showing how many reports each material was used in and the total quantity used.
- **`pest_findings_summary`**: Aggregates pest findings data to show occurrence counts, number of affected reports and locations, and the last occurrence date for each pest and finding type.

## 3. Automation

The database uses triggers and functions to automate certain data management tasks.

- **`handle_new_user()` function**: A PL/pgSQL function that automatically creates a new row in the `public.profiles` table when a new user signs up in `auth.users`.
- **`on_auth_user_created` trigger**: An `AFTER INSERT` trigger on the `auth.users` table that executes the `handle_new_user()` function.
- **`update_material_usage()` function**: A PL/pgSQL function that updates the `usage_count` and `last_used` date in the `materials` table.
- **`trigger_update_material_usage` trigger**: An `AFTER INSERT` trigger on the `report_materials` table that executes the `update_material_usage()` function, ensuring material statistics are always up-to-date when a material is used in a report.

This well-structured schema provides a robust foundation for the Pestwise application, enabling efficient data management and powerful reporting capabilities.
