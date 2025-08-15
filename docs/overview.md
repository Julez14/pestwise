_last updated 08/15/2025_

# Codebase Overview

This document provides a high-level overview of the Pestwise application codebase.

## 1. Project Purpose

Pestwise appears to be a web application for managing pest control reports. Based on the database schema and application structure, it allows users to:

- Manage reports of pest sightings.
- Track different locations.
- Manage materials used.
- Add comments to reports.
- View a dashboard with an overview of the data.

The name "Image Analysis" in the `README.md` suggests that the application might have functionality related to analyzing images, possibly of pests or affected areas, although this is not explicitly clear from the current file structure.

## 2. Tech Stack

The project is a modern web application built with the following technologies:

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (indicated by Radix UI, `cva`, `clsx`, etc.)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/) for charts.

## 3. Project Structure

The codebase is organized into several key directories:

- `app/`: This is the main directory for the Next.js application using the App Router. Each folder inside represents a route in the application (e.g., `/dashboard`, `/reports`).
- `components/`: Contains all the React components. It's further divided into:
  - `ui/`: Generic, reusable UI components from shadcn/ui (e.g., `Button`, `Card`, `Input`).
  - `layout/`: Components related to the overall page structure, like the `header`, `sidebar`, and main `dashboard-layout`.
  - Feature-specific directories (`auth/`, `comments/`, `dashboard/`, `locations/`, `materials/`, `reports/`) which contain components related to a specific domain of the application.
- `lib/`: Contains utility functions and library code.
  - `database.ts`: Likely contains database connection logic.
  - `utils.ts`: General utility functions.
  - `mock-data.ts`: Contains mock data for development and testing.
- `scripts/`: Holds SQL scripts for database management. These are numbered and seem to be intended to be run in order to set up the database schema and seed it with initial data.
- `public/`: Stores static assets like images and logos.
- `docs/`: For documentation related to the project.

## 4. Database

The application uses a relational database. The `scripts/` directory contains SQL files that define the schema and initial data. The main tables seem to be:

- `users`
- `locations`
- `materials`
- `reports`
- `comments`
- `report_materials` (a linking table)

There are also scripts to create views (`08_create_views.sql`) and update statistics (`09_update_statistics.sql`), suggesting some data processing and reporting capabilities.

## 5. Key Features & Functionality

Based on the file and component names, the application likely includes the following features:

- **Authentication**: A `login-form.tsx` component suggests a user authentication system.
- **Dashboard**: A central dashboard (`dashboard-overview.tsx`) to display key information and statistics.
- **Reports Management**: Users can view (`reports-overview.tsx`) and add (`add-report-form.tsx`) reports.
- **Locations Management**: Users can view (`locations-overview.tsx`) and add (`add-location-dialog.tsx`) locations.
- **Materials Management**: Users can view (`materials-overview.tsx`) and add (`add-material-dialog.tsx`) materials.
- **Comments**: Users can view (`comments-overview.tsx`) and add (`add-comment-dialog.tsx`) comments, likely on reports.

This overview should provide a solid starting point for understanding the Pestwise application.
