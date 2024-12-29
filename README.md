# Nottinghamshire Golf Alliance Website

Welcome to the official repository for the Nottinghamshire Golf Alliance website. This platform is designed to unite amateur and professional golfers from across Nottinghamshire, providing opportunities to play at various golf courses and participate in a seasonal league and other exciting competitions.

## Table of Contents
- [Nottinghamshire Golf Alliance Website](#nottinghamshire-golf-alliance-website)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
    - [Key Objectives](#key-objectives)
  - [Features](#features)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
    - [Backend Setup](#backend-setup)
  - [Usage](#usage)
    - [Welcome Page](#welcome-page)
    - [Frontend Features](#frontend-features)
    - [Admin Features](#admin-features)
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

- **Event Management:**
  - Display upcoming events, their dates, and locations.
  - Allow users to view and download tee times.
- **Order of Merit Leaderboard:**
  - Track golfer performance across events and update standings automatically.
- **Results Pages:**
  - Provide detailed results for individual competitions.
- **Golf Course Directory:**
  - Showcase participating golf clubs with their details, including images, contact information, and URLs.
- **Calendar Integration:**
  - Enable users to add events directly to their personal calendars.
- **User Authentication:**
  - Secure sections of the site using Auth0 for administrative management.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) (preferred package manager)
- [Strapi](https://strapi.io/) for backend content management

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

## Usage

### Welcome Page
The homepage introduces the Nottinghamshire Golf Alliance and provides a warm invitation to golfers of all levels. Key sections include:
- Introduction: Explaining the mission and benefits of joining.
- Quick Links: Easy navigation to events, leaderboard, and golf club directory.

### Frontend Features
- Navigate through upcoming events and view detailed results.
- Access and interact with leaderboard standings.
- Explore information about participating golf courses.
- **Additional Frontend Features**:
  - Fully responsive navigation bar for seamless browsing on all devices.
  - Integration with the OpenWeather API to display real-time weather data.
  - An infinite-scroll banner showcasing club logos.

**Start Times Page:**
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
  - Detailed information about participating golf courses, including images, logos, contact information, and direct links to their websites.

**Order of Merit Page:**
  - An expandable results table showing the top 10 player scores, with the ability to view detailed performance across events.
  - A search function to locate specific players and view their score history.
  
  **Contact Page:**
  - Links to social media profiles, presented with FontAwesome icons.
  - mailto links for easy email communication via mobile or desktop.

  **Rules Page:**
  - Accordion-style display for easy navigation of competition rules.

  **Gallery Page:**
  - A photo gallery powered by react-image-gallery to showcase event highlights.

  **Not Found Page:**
  - A custom 404 error page that redirects users to the homepage with an accessible link.

### Admin Features
Authenticated administrators have the ability to:
- Upload and manage competition results.
- Add, update, or modify event details.
- Maintain and update golfer and leaderboard information.
- **Additional Admin Features**
  - Integration with the UseAuth0 authentication system for secure access.
  - Custom Excel event sheet template, available for download.
  - A bespoke Excel importer that converts event data into CSV format.
  - A CSV previewer for reviewing data before it is parsed and published to Strapi.

## License

This project is licensed under the MIT License.

## Acknowledgments
- Golfers and clubs participating in the Nottinghamshire Golf Alliance.
- Kaine Binch - Lead Developer
- Kaine Binch - Lead Designer
- Jacson Curtis - Creative Consultant