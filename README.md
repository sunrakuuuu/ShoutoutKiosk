# CCS Valentine Shoutout App

Welcome to the CCS Valentine Shoutout application! This is a fun, interactive web app designed for a Valentine's Day event booth. It allows users to create and display personalized "shoutouts" to their friends, loved ones, and colleagues.

##  Features

This application is packed with features to make sending and viewing shoutouts a delightful experience.

- **Shoutout Feed:** The main page displays shoutouts one at a time in a large, visually appealing format. Users can navigate through all the submitted shoutouts using left and right arrow buttons on the screen or their keyboard.
- **Create Shoutouts:** A dedicated page with an easy-to-use form for crafting new shoutouts. Users can specify their name (or remain "Anonymous"), the recipient, a message, and an optional image.
- **AI-Powered Message Stylizer:** To add a spark of creativity, the message field has an AI-powered assistant! With the click of a button, you can get help rewriting your message to be more "poetic" or "witty".
- **Image Uploads:** Users can upload a photo to go along with their message, making their shoutout even more personal.
- **Customizable Frames:** Choose from several decorative frames to give your shoutout a unique look and feel.
- **Light & Dark Mode:** The application includes a theme toggle in the header, allowing users to switch between a light and a dark visual theme for their viewing comfort.
- **Local Storage Persistence:** Shoutouts are saved directly in your browser's local storage. They are automatically cleared after one hour to ensure privacy and keep the feed fresh.

##  Tech Stack

This project is built with a modern and powerful set of technologies, perfect for creating fast and interactive web applications.

- **Framework:** [**Next.js**](https://nextjs.org/) - A popular React framework that enables features like server-side rendering and static site generation, leading to better performance and SEO. We use the **App Router** for modern, flexible routing.
- **Language:** [**TypeScript**](https://www.typescriptlang.org/) - A superset of JavaScript that adds static types, helping to prevent bugs and improve code quality.
- **Styling:** [**Tailwind CSS**](https://tailwindcss.com/) - A utility-first CSS framework that allows for rapid UI development without writing custom CSS.
- **UI Components:** [**ShadCN UI**](https://ui.shadcn.com/) - A collection of beautifully designed and accessible UI components (like buttons, cards, and forms) that are built on top of Tailwind CSS.
- **AI Integration:** [**Genkit**](https://firebase.google.com/docs/genkit) - A framework from Google for building AI-powered features. We use it to connect to the Gemini model, which powers our "Message Stylizer" feature.
- **Icons:** [**Lucide React**](https://lucide.dev/) - A clean and consistent icon library.
- **State Management:** **React Hooks** (`useState`, `useEffect`) are used for managing the application's state. A custom hook (`useShoutouts`) was created to handle all the logic for adding, deleting, and storing shoutouts in the browser's local storage.

##  Project Structure & Flow

The application is organized into a few key directories:

1.  **/src/app/**: This is the heart of the Next.js application.
    -   `page.tsx`: The main shoutout display feed.
    -   `create/page.tsx`: The page containing the form to create a new shoutout.
    -   `layout.tsx`: The main layout for the entire application, which includes the header and theme provider.
2.  **/src/components/**: Contains all the reusable React components.
    -   `header.tsx`: The navigation header at the top of the pages.
    -   `shoutout-display.tsx`: The component that displays the main, featured shoutout.
    -   `shoutout-form.tsx`: The form used for creating and submitting new shoutouts.
    -   `shoutout-card.tsx`: The card component used to display shoutouts in the management list.
3.  **/src/hooks/**: Houses custom React hooks.
    -   `useShoutouts.ts`: A crucial hook that manages all the logic for shoutout data, including saving to and retrieving from the browser's local storage.
4.  **/src/ai/**: This directory contains the AI-related code.
    -   `flows/stylize-message-flow.ts`: Defines the Genkit flow that takes a user's message and a style, and returns the AI-stylized version.
5.  **/src/lib/**: Contains utility functions, type definitions, and other shared logic.
    -   `types.ts`: Defines the data structures for `Shoutout` and `ShoutoutFrame`.
    -   `utils.ts`: Helper functions, like `cn` for combining CSS classes.

## ⚙️ Getting Started

To run this project locally, follow these steps:

1.  **Install Dependencies:** Open your terminal in the project directory and run the following command to install all the necessary packages.
    ```bash
    npm install
    ```

2.  **Run the Development Server:** Once the installation is complete, start the local development server.
    ```bash
    npm run dev
    ```

3.  **View the App:** Open your web browser and navigate to [http://localhost:9002](http://localhost:9002). You should now see the application running!

---

