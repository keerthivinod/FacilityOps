# FacilityOps

FacilityOps is a comprehensive, production-ready web-based facility management application. It is designed to handle ticketing, asset tracking, preventive maintenance scheduling, staff allocation, vendor management, inventory tracking, incident reporting, document storage, project management, and utility tracking.

Additionally, FacilityOps integrates an **AI Brain** to help facility managers quickly analyze trends, prioritize incidents, evaluate staff performance, and optimize maintenance costs.

## Key Features

- **Dashboard & Analytics:** Get a bird's-eye view of open tickets, critical incidents, and pending tasks.
- **Ticketing System:** Report, assign, track, and resolve facility issues efficiently.
- **Asset Management:** Track critical infrastructure, monitor service schedules, and manage AMC renewals.
- **Staff & Vendor Management:** Monitor team performance and manage vendor contracts.
- **Preventive Maintenance:** Schedule and track regular maintenance tasks.
- **AI Brain Module:** A built-in AI assistant that uses OpenAI to analyze facility data and provide actionable recommendations.
- **Progressive Web App (PWA):** Installable on mobile devices with offline capabilities and native-like experiences.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend/API:** Netlify Functions (`/.netlify/functions/*`)
- **Database:** Local SQLite database using `sql.js`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- `npm`

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd facilityops
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Initialize the Database (Important!):**
   The application uses a local SQLite database file (`facilityops.db`). To create the schema and populate it with the default login accounts, run the following scripts:
   \`\`\`bash
   npm run db:migrate-saas
   npm run db:seed
   \`\`\`

   **Default Accounts:**
   - Facility Manager: `keerthi` / `facility123`
   - Technician: `rajan` / `electrician123`
   - Management: `management` / `admin123`
   - Platform Admin: `admin` / `admin` (must change password on first login)

4. **Run the Development Server:**
   FacilityOps relies on Netlify Functions for its backend API. You must use the Netlify CLI to run both the Next.js frontend and the functions simultaneously:
   \`\`\`bash
   npx netlify dev
   \`\`\`
   Open the Local server URL (typically `http://localhost:8888`) in your browser to view the application.

## AI Brain Configuration

The AI Brain uses the OpenAI API to analyze data. For the module to work, you must provide your own OpenAI API Key.

**How to set up the AI Brain:**
1. Log in to the application as an Administrator or Facility Manager (e.g., using the `keerthi` account).
2. Navigate to the **Settings** module from the sidebar.
3. Click on the **AI Brain** tab.
4. Enter your OpenAI API Key (`sk-...`) in the provided input field.
5. Click **Save AI Key**.

The key is securely stored in the server's tenant settings database and will be used by the backend functions to process all AI queries securely. It is not exposed to the client browser.

## Deployment

FacilityOps is optimized to be deployed on [Netlify](https://www.netlify.com/).

1. Connect your GitHub repository to Netlify.
2. Netlify will automatically detect the Next.js framework and configure the build settings.
3. Ensure the Build Command is set to `npm run build` and the Publish Directory is set to `.next`.
4. Deploy the site!

*(Note: In a production environment, you may want to migrate from the local SQLite file to a managed PostgreSQL database by updating the database connection logic in `netlify/functions/lib/db.js`.)*

## Support

If you encounter any issues, please refer to the documentation or contact support. Default password support is provided as `facility123`.
