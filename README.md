# Nottinghamshire Golf Alliance Website

Welcome to the official repository for the Nottinghamshire Golf Alliance website. This platform is designed to unite amateur and professional golfers from across Nottinghamshire, providing opportunities to play at various golf courses and participate in a seasonal league and other exciting competitions.

## Table of Contents
- [Nottinghamshire Golf Alliance Website](#nottinghamshire-golf-alliance-website)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
    - [Key Objectives](#key-objectives)
  - [Features](#features)
    - [General Features](#general-features)
    - [Page-Sepcific Features](#page-sepcific-features)
    - [Admin Features](#admin-features)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
    - [Backend Setup](#backend-setup)
  - [Technology Stack](#technology-stack)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

## About the Project

The Nottinghamshire Golf Alliance website aims to:

1. Facilitate participation in the **Order of Merit** competition, a seasonal league spanning multiple golf courses in Nottinghamshire.
2. Organize and promote a variety of other competitions throughout the year.
3. Foster connections and community spirit among amateur and professional golfers.
4. Provide an online platform for scheduling, scoring, and tracking competition results.

### Key Objectives
- Celebrate Nottinghamshire's rich golfing tradition.
- Encourage players of all skill levels to improve and enjoy the sport.
- Enhance transparency and engagement with an easy-to-use website.

## Features

### General Features
- Navigate through upcoming events and view detailed results.
- Integration with APIs like `OpenWeatherAPI` for real-time data.
- Access and interact with leaderboard standings.
- Explore information about participating golf courses.
- Fully responsive navigation bar for seamless browsing on all devices.
- An infinite-scroll banner showcasing club logos.
- Seamless calendar integration for adding events to personal calendars.
- Secure user authentication using `Auth0` for restriced sections.

### Page-Sepcific Features

**Welcome/Home Page:**
- Introduction: Explaining the mission and benefits of joining.
- Quick Links: Easy navigation to events, leaderboard, and golf club directory.
- Shortened preview sections with snippets of content from other pages.

**Tee Times Page:**
- View tee times in both table and list formats.
- A search function to easily locate golfers by name.
- Filter by golf club to view golfers and their assigned tee times.

**Results Page:**
- Dynamic, clickable links to view "further results" for each event.
- **Further Results Page:**
  - A dynamic table displaying the top Amateur, Team, and Professional players.
  - Expandable and collapsible sections for detailed results.

**Fixtures Page:**
  - Fixture cards displaying event dates, locations, and competition types.

**Courses Page:**
  - Comprehensive directory of participating golf clubs.
    - Club Photos and Logos.
    - Address and contact details.
    - Links to official websites.

**Order of Merit Page:**
  - An expandable results table showing the top 10 player scores, with the ability to view detailed performance across events.
  - Detailed Performance: Expandable rows to view player scores across events, following the alliance's scoring rules (top 10 scores counted).
  - A search function to locate specific players and view their score history.
  
  **Contact Page:**
  - Links to social media profiles, presented with `FontAwesome` icons.
  - `mailto` links for easy email communication via mobile or desktop.

  **Rules Page:**
  - Accordion-style display for easy navigation of competition rules.

  **Gallery Page:**
  - A photo gallery powered by `react-image-gallery` to showcase event highlights.

  **Not Found Page:**
  - A custom 404 error page that redirects users to the homepage with an accessible link.

### Admin Features
Authenticated administrators can manage the website through secure tools, including:

**Event Management**
- Add, update, or modify event details, including dates, locations, and competition types.
- Upload and manage competition results.
- View and download event-specific tee times.

**Leaderboard Management**
- Track and update golfer performance across events.
- Automate leaderboard standings for the Order of Merit.

**Golf Course Management**
- Maintain a directory of participating golf courses, including images, contact information, and URLs.

**CSV and Excel Tools**
- Custom Templates: Downloadable Excel templates for event data input.
- Importer: Convert Excel data to CSV format for processing.
- Previewer: View and verify CSV data before publishing it to Strapi.

**User Authentication**
- Integration with the `Auth0` system for secure admin access.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) *(preferred package manager)*
- [Strapi](https://strapi.io/) *for backend content management*

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/nottinghamshire-golf-alliance.git
    ```
2. Navigate to the project directory:
    ```bash
    cd nottinghamshire-golf-alliance
    ```
3. Install Dependencies:
    ```bash
    yarn install
    ```
4. Start the development server:
    ```bash
    yarn start
    ```
5. Run the backend: Follow the [backend setup instructions](#backend-setup) to configure Strapi.

### Backend Setup
1. Set up Strapi as the CMS.
2. Define models for:
   - Events
   - Golf Clubs
   - Golfers
   - Scores
   - Tee Times
3. Parse CSV data into Strapi using custom scripts.
4. Configure API endpoints to serve frontend data.

## Technology Stack
The Nottinghamshire Golf Alliance website utilizes the following technologies and libraries:

**Front End**
- **React:** *A JavaScript library for building user interfaces.*
- **React Router DOM:** *For client-side routing and navigation.*
- **Emotion:** *For writing CSS-in-JS styles.*
- **Material-UI (MUI):** *Components and styling for a modern and responsive design.*
- **Framer Motion:** *For creating smooth animations and transitions.*
- **React Image Gallery:** *To display photo galleries.*
- **React Icons & FontAwesome:** *For vector icons and styling.*

**Back End**
- **Strapi:** *A headless CMS for managing content and APIs.*
- **Axios:** *For handling API requests.*

**APIs and Integrations**
- **OpenWeather API:** *Displays real-time weather data for Nottinghamshire*
- **Add-to-Calendar:** *Allows users to add an event to their calendar*

**Build Tools**
- **Vite:** *A fast build tool and development server.*
- **ESLint:** *For linting and enforcing code style.*
- **TailwindCSS:** *Utility-first CSS framework for styling.*

**Authentication**
- **Auth0**


## License

This project is licensed under the MIT License.

## Acknowledgments
- Golfers and clubs participating in the Nottinghamshire Golf Alliance.
- Kaine Binch - Lead Developer
- Kaine Binch - Lead Designer
- Jacson Curtis - Creative Consultant