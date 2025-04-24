import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getNotes, 
  getNoteById, 
  createNote, 
  updateNote, 
  deleteNote, 
  generateNoteSummary,
  type CreateNoteInput,
  type UpdateNoteInput
} from '../note-service';
import { toast } from 'sonner';

// Query keys
export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: string) => [...noteKeys.lists(), { filters }] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
};

// Get all notes
export function useNotes() {
  return useQuery({
    queryKey: noteKeys.lists(),
    queryFn: getNotes,
    // Retry failed requests a few times - helpful for auth timing issues
    retry: 3,
    retryDelay: 1000,
    // Don't refetch on window focus - prevents unnecessary auth checks
    refetchOnWindowFocus: false,
  });
}

// Get a single note
export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => getNoteById(id),
    enabled: !!id,
  });
}

// Create a new note
export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (note: CreateNoteInput) => createNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success('Note created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create note');
    },
  });
}

// Update a note
export function useUpdateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateNoteInput }) => 
      updateNote(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success('Note updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update note');
    },
  });
}

// Delete a note
export function useDeleteNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });
      toast.success('Note deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete note');
    },
  });
}

// Generate AI summary
export function useGenerateSummary() {
  return useMutation({
    mutationFn: (content: string) => generateNoteSummary(content),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate summary');
    },
  });
}
