"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/note-service';
import { useDeleteNote } from '@/lib/hooks/use-notes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NoteEditor } from './note-editor';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Trash2, Edit, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const { mutate: deleteNote } = useDeleteNote();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(note.updated_at), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="line-clamp-1 text-xl">{note.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {note.summary && (
                  <DropdownMenuItem onClick={() => setShowSummary(!showSummary)}>
                    <FileText className="mr-2 h-4 w-4" />
                    {showSummary ? 'Hide Summary' : 'Show Summary'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>{timeAgo}</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {showSummary && note.summary ? (
            <div className="bg-muted p-3 rounded-md mb-3">
              <h4 className="text-sm font-medium mb-1">AI Summary</h4>
              <p className="text-sm text-muted-foreground">{note.summary}</p>
            </div>
          ) : (
            <p className="text-sm line-clamp-3">{note.content}</p>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            {note.summary && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSummary(!showSummary)}
              >
                {showSummary ? 'Hide Summary' : 'Show Summary'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <NoteEditor 
            note={note} 
            onComplete={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
