# NoteGenius - AI-Powered Notes App

![NoteGenius Logo](public/notegenius-logo.svg)

NoteGenius is a modern, AI-powered notes application built with Next.js, TypeScript, TailwindCSS, and Supabase. It allows users to create, edit, and organize their notes with the added benefit of AI-generated summaries powered by the Groq API.

[View Demo](https://github.com/shivansh193/1811LabsAssignment) | [Report Bug](https://github.com/shivansh193/1811LabsAssignment/issues) | [Request Feature](https://github.com/shivansh193/1811LabsAssignment/issues)

## Features

- **User Authentication**: 
  - Secure sign-up and login with email/password
  - Google OAuth integration
  - Protected routes with middleware
  - Persistent sessions

- **Note Management**: 
  - Create, edit, and delete notes
  - Rich text editing capabilities
  - Automatic timestamps for creation and updates
  - Optimistic UI updates for a smooth user experience

- **AI Summarization**: 
  - Generate concise summaries of your notes using Groq API
  - One-click summary generation
  - Toggle between note content and AI summary

- **Responsive Design**: 
  - Works seamlessly on desktop, tablet, and mobile devices
  - Adaptive layouts for different screen sizes
  - Touch-friendly interface

- **Modern UI**: 
  - Built with Shadcn UI components and TailwindCSS
  - Smooth animations with Framer Motion
  - Dark mode support
  - Clean and intuitive interface

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: TailwindCSS and Shadcn UI components
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **Form Handling**: React Hook Form with Zod validation

### Backend & Data
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: Supabase PostgreSQL for structured data storage
- **State Management**: React Query (TanStack Query) for server state
- **API Routes**: Next.js API routes for backend functionality

### AI Integration
- **Summarization**: Groq API for generating concise note summaries
- **Natural Language Processing**: Advanced AI models for understanding note content

### DevOps
- **Version Control**: Git and GitHub
- **Linting**: ESLint for code quality
- **Type Checking**: TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for authentication and database)
- Groq API key (for AI summarization)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/shivansh193/1811LabsAssignment.git
   cd 1811LabsAssignment
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. Set up your Supabase project:
   - Create a new project in Supabase
   - Enable email/password and Google authentication
   - Create a `notes` table with the following schema:
     ```sql
     CREATE TABLE notes (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       title TEXT NOT NULL,
       content TEXT NOT NULL,
       summary TEXT,
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );

     -- Enable RLS (Row Level Security)
     ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

     -- Create policy for users to only see their own notes
     CREATE POLICY "Users can only access their own notes" ON notes
       FOR ALL USING (auth.uid() = user_id);
     ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project can be deployed on Vercel, Netlify, or any other Next.js-compatible hosting platform.

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add the environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
4. Deploy!

### Environment Variables

Make sure to set up the following environment variables in your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

## Project Structure

```
├── app/                 # Next.js App Router
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/          # React components
│   ├── auth/            # Authentication components
│   ├── notes/           # Note-related components
│   └── ui/              # UI components (Shadcn)
├── lib/                 # Utility functions and services
│   ├── hooks/           # Custom React hooks
│   ├── ai-service.ts    # AI summarization service
│   ├── auth-context.tsx # Authentication context
│   ├── note-service.ts  # Note CRUD operations
│   ├── providers.tsx    # React Query and Auth providers
│   ├── supabase-client.ts # Supabase client
│   └── utils.ts         # Utility functions
├── public/              # Static assets
└── ...                  # Configuration files
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features when applicable
- Keep pull requests focused on a single feature or bug fix
- Document your code and any API changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Shivansh - [GitHub Profile](https://github.com/shivansh193)

Project Link: [https://github.com/shivansh193/1811LabsAssignment](https://github.com/shivansh193/1811LabsAssignment)

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.io/) - The open source Firebase alternative
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind
- [React Query](https://tanstack.com/query/) - Powerful asynchronous state management
- [Groq](https://groq.com/) - Advanced AI models and API
- [Framer Motion](https://www.framer.com/motion/) - Production-ready animation library
- [React Hook Form](https://react-hook-form.com/) - Performant form validation
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [date-fns](https://date-fns.org/) - Modern JavaScript date utility library

## Screenshots

<details>
<summary>Click to expand screenshots</summary>

### Authentication Page
The authentication page provides options for users to sign in or sign up with email/password or Google.

### Dashboard
The main dashboard displays all user notes in a clean, card-based layout with options to create, edit, and delete notes.

### Note Editor
The note editor provides a clean interface for creating and editing notes with an option to generate AI summaries.

### Mobile View
The application is fully responsive and works seamlessly on mobile devices.

</details>

## Roadmap

- [ ] Add note categories and tags
- [ ] Implement note sharing functionality
- [ ] Add rich text editing with markdown support
- [ ] Implement note search and filtering
- [ ] Add offline support with local storage
- [ ] Implement user preferences (themes, layout options)
- [ ] Add collaborative editing features

---

<p align="center">Built with ❤️ by <a href="https://github.com/shivansh193">Shivansh</a></p>
