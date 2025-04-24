"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '@/lib/note-service';
import { useCreateNote, useUpdateNote, useGenerateSummary } from '@/lib/hooks/use-notes';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
});

type FormValues = z.infer<typeof formSchema>;

interface NoteEditorProps {
  note?: Note;
  onComplete?: () => void;
}

export function NoteEditor({ note, onComplete }: NoteEditorProps) {
  const { mutate: createNote, isPending: isCreating } = useCreateNote();
  const { mutate: updateNote, isPending: isUpdating } = useUpdateNote();
  const { mutate: generateSummary, isPending: isGeneratingSummary } = useGenerateSummary();
  const [summary, setSummary] = useState<string | undefined>(note?.summary);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (note) {
      // Update existing note
      updateNote(
        { 
          id: note.id, 
          updates: { 
            ...values, 
            summary 
          } 
        },
        {
          onSuccess: () => {
            if (onComplete) onComplete();
          },
        }
      );
    } else {
      // Create new note
      createNote(
        { 
          ...values, 
          summary 
        },
        {
          onSuccess: () => {
            form.reset();
            setSummary(undefined);
            if (onComplete) onComplete();
          },
        }
      );
    }
  };

  const handleGenerateSummary = () => {
    const content = form.getValues('content');
    
    if (!content) {
      form.setError('content', { 
        type: 'manual', 
        message: 'Please add content before generating a summary' 
      });
      return;
    }

    generateSummary(content, {
      onSuccess: (data) => {
        setSummary(data);
      },
    });
  };

  const isPending = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Note title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your note here..." 
                  className="min-h-[200px] resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {summary && (
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              AI Summary
            </h3>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            className="gap-2"
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
          >
            {isGeneratingSummary && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
          </Button>
          <Button type="submit" className="gap-2" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {note ? 'Update Note' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
