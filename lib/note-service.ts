import { browserClient } from './supabase-client';
import { toast } from 'sonner';

// Helper function to check if user is authenticated
export async function getAuthenticatedUser() {
  try {
    // Get the current session directly - this is the most reliable approach
    const { data: { session } } = await browserClient.auth.getSession();
    
    if (session?.user) {
      console.log('Found authenticated user:', session.user.email);
      return session.user;
    }
    
    console.log('No authenticated user found in current session');
    
    // If we're on a protected route, this is unexpected
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
      console.warn('Authentication failed on protected route - this should not happen!');
      // The middleware should have redirected already, but just in case
      toast.error('Authentication required. Please sign in.');
    }
    
    return null;
  } catch (err) {
    console.error('Unexpected error checking authentication status:', err);
    return null;
  }
}

// Function to check if the notes table exists
async function checkNotesTableExists(): Promise<boolean> {
  try {
    // Check if the table exists by querying it
    const { error } = await browserClient
      .from('notes')
      .select('id')
      .limit(1);
    
    // If there's no error or the error is not about the table not existing,
    // we can assume the table exists or there's a different issue
    if (!error || error.code !== '42P01') {
      return true;
    }
    
    // If we get here, the table doesn't exist
    return false;
  } catch (err) {
    console.error('Error checking if notes table exists:', err);
    // Assume the table exists to avoid further errors
    return true;
  }
}

export type Note = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type CreateNoteInput = {
  title: string;
  content: string;
  summary?: string;
};

export type UpdateNoteInput = {
  title?: string;
  content?: string;
  summary?: string;
};

/**
 * Get all notes for the current user
 */
export async function getNotes(): Promise<Note[]> {
  try {
    // Get the authenticated user with multiple attempts
    for (let attempt = 1; attempt <= 3; attempt++) {
      const user = await getAuthenticatedUser();
      
      if (user) {
        console.log(`Got authenticated user on attempt ${attempt}:`, user.email);
        
        // Check if the notes table exists
        const tableExists = await checkNotesTableExists();
        
        // If the table doesn't exist, return an empty array immediately
        if (!tableExists) {
          console.log('Notes table does not exist yet. This is normal for new users.');
          return [];
        }
        
        // Table exists and we have a user, so fetch the notes
        // IMPORTANT: Use browserClient consistently for all database operations
        const { data, error } = await browserClient
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          // If we get a table doesn't exist error (which shouldn't happen at this point), return empty array
          if (error.code === '42P01') { 
            console.warn('Notes table does not exist yet, returning empty array');
            return [];
          }
          console.error('Error fetching notes:', error);
          // Don't throw errors to avoid breaking the UI
          return [];
        }

        return data || [];
      }
      
      // If not authenticated, wait a bit before retrying
      if (attempt < 3) {
        console.log(`Auth attempt ${attempt} failed, retrying in ${attempt * 300}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 300));
      }
    }
    
    // After all retries, still no authenticated user
    console.warn('Failed to get authenticated user after multiple attempts');
    return [];
  } catch (err) {
    console.error('Unexpected error in getNotes:', err);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}

/**
 * Get a single note by ID
 */
export async function getNoteById(id: string): Promise<Note | null> {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser();
    
    if (!user) {
      console.log('No authenticated user found when fetching note by ID');
      
      // As a fallback for development, try to fetch without user filter
      // Remove this in production!
      console.log('DEVELOPMENT FALLBACK: Attempting to fetch note without user filter');
      const { data: fallbackData, error: fallbackError } = await browserClient
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (!fallbackError && fallbackData) {
        console.log('Fallback note fetch succeeded:', fallbackData.id);
        return fallbackData;
      }
      
      return null;
    }
    
    // IMPORTANT: Use browserClient consistently for all database operations
    const { data, error } = await browserClient
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error(`Error fetching note with ID ${id}:`, error);
      throw new Error('Failed to fetch note');
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching note';
    console.error(`Error in getNoteById for ID ${id}:`, errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Create a new note
 */
// In note-service.ts
export async function createNote(note: CreateNoteInput) {
  console.log('Starting note creation process');
  
  // Get the current user session
  const { data: { session } } = await browserClient.auth.getSession();
  
  if (!session?.user) {
    throw new Error('User must be authenticated to create notes');
  }
  
  const userId = session.user.id;
  console.log(`Creating note for authenticated user: ${session.user.email}`);
  
  try {
    console.log('Attempting to create note');
    const { data, error } = await browserClient
      .from('notes')
      .insert({
        user_id: userId, // Be sure this matches your table column name exactly
        title: note.title,
        content: note.content,
        summary: note.summary || null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating note:', error);
      throw new Error(`Permission denied when creating note - ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

  


/**
 * Update an existing note
 */
export async function updateNote(id: string, updates: UpdateNoteInput): Promise<Note> {
  try {
    // Get the current session directly
    const { data: { session } } = await browserClient.auth.getSession();
    
    if (!session || !session.user) {
      console.error('No active session found when updating note');
      toast.error('You must be signed in to update notes');
      throw new Error('Authentication required');
    }
    
    // Log the authenticated user for debugging
    console.log('Updating note for authenticated user:', session.user.email);
    
    // Create the updated note object
    const updatedNote = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Use browserClient to ensure the auth context is properly passed
    // RLS will automatically restrict to the current user's notes
    const { data, error } = await browserClient
      .from('notes')
      .update(updatedNote)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating note with ID ${id}:`, error);
      throw new Error('Failed to update note');
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error updating note';
    console.error(`Error in updateNote for ID ${id}:`, errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<void> {
  try {
    // Get the current session directly
    const { data: { session } } = await browserClient.auth.getSession();
    
    if (!session || !session.user) {
      console.error('No active session found when deleting note');
      toast.error('You must be signed in to delete notes');
      throw new Error('Authentication required');
    }
    
    // Log the authenticated user for debugging
    console.log('Deleting note for authenticated user:', session.user.email);
    
    // Use browserClient to ensure the auth context is properly passed
    // RLS will automatically restrict to the current user's notes
    const { error } = await browserClient
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting note with ID ${id}:`, error);
      throw new Error('Failed to delete note');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting note';
    console.error(`Error in deleteNote for ID ${id}:`, errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Generate AI summary for a note
 */
export async function generateNoteSummary(content: string): Promise<string> {
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}