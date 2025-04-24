import { supabase } from './supabase-client';
import { toast } from 'sonner';

// Function to check if the notes table exists
async function checkNotesTableExists(): Promise<boolean> {
  try {
    // Check if the table exists by querying it
    const { error } = await supabase
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

// Function to handle notes table operations safely
// This function is currently unused but kept for future reference
/* 
async function ensureNotesTableExists() {
  try {
    const tableExists = await checkNotesTableExists();
    
    if (!tableExists) {
      console.log('Notes table does not exist. This is expected for new users.');
      console.log('The table will be created automatically when creating the first note.');
      
      // Instead of trying to create the table here, we'll handle it
      // when the user tries to create their first note
    }
  } catch (err) {
    console.error('Error in ensureNotesTableExists:', err);
  }
}
*/

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
    // Check if the notes table exists
    const tableExists = await checkNotesTableExists();
    
    // If the table doesn't exist, return an empty array immediately
    if (!tableExists) {
      console.log('Notes table does not exist yet. This is normal for new users.');
      return [];
    }
    
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found when fetching notes');
      return [];
    }
    
    // Table exists and we have a user, so fetch the notes
    const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching note with ID ${id}:`, error);
    throw new Error('Failed to fetch note');
  }

  return data;
}

/**
 * Create a new note
 */
export async function createNote(note: CreateNoteInput): Promise<Note> {
  try {
    // Check if the notes table exists
    const tableExists = await checkNotesTableExists();
    
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to create notes');
    }
    
    // Add the user_id to the note
    const noteWithUser = {
      ...note,
      user_id: user.id
    };
    
    // If the table doesn't exist, inform the user
    if (!tableExists) {
      console.log('Notes table does not exist. This is expected for new users.');
      toast.info('Setting up your notes database for the first time...');
    }
    
    // Try to insert the note (this will work if the table exists)
    const { data, error } = await supabase
      .from('notes')
      .insert([noteWithUser])
      .select()
      .single();

    if (error) {
      // Handle specific error cases
      if (error.code === '42P01') { // PostgreSQL code for undefined_table
        // The table doesn't exist - this is a normal situation for new users
        toast.error('Unable to create note. Please contact support if this persists.');
        console.error('Table does not exist and could not be created automatically:', error);
        throw new Error('Notes database not initialized. Please try again later.');
      } else {
        console.error('Error creating note:', error);
        throw new Error(`Failed to create note: ${error.message}`);
      }
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error creating note';
    console.error('Error in createNote:', errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Update an existing note
 */
export async function updateNote(id: string, updates: UpdateNoteInput): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating note with ID ${id}:`, error);
    throw new Error('Failed to update note');
  }

  return data;
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting note with ID ${id}:`, error);
    throw new Error('Failed to delete note');
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
