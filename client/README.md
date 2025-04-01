# Frontend Client for AI Chat Interface (Next.js)

This is the frontend application for the AI Chat Interface, built with [Next.js](https://nextjs.org), React, Tailwind CSS, and shadcn/ui. It communicates with the backend server to interact with the OpenAI Assistant API.

## Features

- **Modern UI:** Built with Next.js App Router, styled using Tailwind CSS and [shadcn/ui](https://ui.shadcn.com/) components for a polished, themeable look.
- **Real-time Streaming:** Assistant responses are displayed token-by-token using Server-Sent Events (SSE) fetched from the backend.
- **Chat History Sidebar:**
  - Displays a list of previous chat sessions.
  - Persists the chat list in browser `localStorage`.
  - Allows starting new chats and deleting all history.
  - Loads message history from the backend when selecting a previous chat.
- **Message Display:**
  - Distinguishes between User and Assistant messages using icons and styling based on shadcn/ui theme variables.
  - Renders Assistant messages as Markdown using `react-markdown` and `remark-gfm`.
  - Shows a blinking cursor for actively streaming messages.
- **Enhanced UX:**
  - Press `Enter` to send messages.
  - Auto-focus on the input field.
  - Displays chat starter prompts with icons ([lucide-react](https://lucide.dev/)) when the chat history is empty.
- **Component-Based:** UI is broken down into reusable components like `Sidebar` and `ChatMessage`.

## Getting Started

**Prerequisites:**

- Node.js (v18 or later recommended)
- npm or yarn
- The [Backend Server](../server/README.md) must be running.

**Setup:**

1.  **Navigate to the `client` directory:**
    ```bash
    cd /path/to/your/project/client
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **(Optional) Add shadcn/ui Components:** If you haven't initialized shadcn or need more components:

    ```bash
    # Initialize (if not done already)
    # npx shadcn@latest init

    # Add components
    # npx shadcn@latest add button input scroll-area # etc.
    ```

**Running the Development Server:**

First, ensure the backend server is running (see `../server/README.md`). Then, run the frontend development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) with your browser to see the result.

The page auto-updates as you edit files like `app/page.tsx`.

---

## Learn More (Next.js Boilerplate)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel (Next.js Boilerplate)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. (Note: You will also need to deploy the backend server separately).
