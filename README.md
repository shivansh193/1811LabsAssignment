# NoteGenius - AI-Powered Notes App

NoteGenius is a modern, AI-powered notes application built with Next.js, TypeScript, TailwindCSS, and Supabase. It allows users to create, edit, and organize their notes with the added benefit of AI-generated summaries.

## Features

- **User Authentication**: Secure sign-up and login with email/password and Google authentication
- **Note Management**: Create, edit, and delete notes with a beautiful interface
- **AI Summarization**: Generate concise summaries of your notes using advanced AI technology
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Shadcn UI components and TailwindCSS for a polished look

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and App Router
- **Styling**: TailwindCSS and Shadcn UI components
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **State Management**: React Query (TanStack Query)
- **AI Integration**: Groq API for summarization
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for authentication and database)
- Groq API key (for AI summarization)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/notegenius.git
   cd notegenius
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

This project is deployed on Vercel. To deploy your own version:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy!

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

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/)
- [Groq](https://groq.com/)
- [Framer Motion](https://www.framer.com/motion/)
