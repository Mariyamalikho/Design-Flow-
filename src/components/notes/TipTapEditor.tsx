import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./EditorToolbar";
import { cn } from "@/lib/utils";

export interface TipTapEditorProps {
  content: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  showToolbar?: boolean;
  className?: string;
  onOpenMarkdownGuide?: () => void;
  onEditorReady?: (editor: Editor) => void;
  editorRef?: React.MutableRefObject<Editor | null>;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  placeholder = "Write your thoughts, design ideas, or project brief...",
  editable = true,
  showToolbar = true,
  className,
  onOpenMarkdownGuide,
  onEditorReady,
  editorRef,
}) => {
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "is-editor-empty before:content-[attr(data-placeholder)] before:text-zinc-400 before:float-left before:pointer-events-none before:h-0",
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none min-h-[350px] leading-relaxed text-zinc-900 dark:text-zinc-100",
          "prose prose-zinc dark:prose-invert max-w-none subpixel-antialiased",
          "prose-headings:font-bold prose-headings:tracking-tight",
          "prose-h1:text-2xl prose-h1:font-bold prose-h1:tracking-tight prose-h1:text-zinc-900 dark:prose-h1:text-zinc-50 prose-h1:mt-6 prose-h1:mb-3",
          "prose-h2:text-xl prose-h2:font-semibold prose-h2:tracking-tight prose-h2:text-zinc-800 dark:prose-h2:text-zinc-100 prose-h2:mt-5 prose-h2:mb-2",
          "prose-h3:text-lg prose-h3:font-medium prose-h3:text-zinc-800 dark:prose-h3:text-zinc-200 prose-h3:mt-4 prose-h3:mb-1.5",
          "prose-p:text-[15px] prose-p:leading-7 prose-p:my-2.5 prose-p:text-zinc-700 dark:prose-p:text-zinc-300",
          "prose-blockquote:border-l-4 prose-blockquote:border-l-indigo-500 dark:prose-blockquote:border-l-indigo-400 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-950/20 prose-blockquote:py-1.5 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:my-3.5 prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400",
          "prose-code:font-mono prose-code:text-xs prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50/80 dark:prose-code:bg-indigo-950/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:border prose-code:border-indigo-100 dark:prose-code:border-indigo-900/50",
          "prose-pre:font-mono prose-pre:text-xs prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 prose-pre:text-zinc-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:my-3.5",
          "prose-ul:list-disc prose-ul:my-2.5 prose-ul:pl-5 prose-ol:list-decimal prose-ol:my-2.5 prose-ol:pl-5 prose-li:my-1",
          "prose-hr:my-6 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800",
          "prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100",
          "selection:bg-indigo-500/20 dark:selection:bg-indigo-500/30",
          className
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true;
      const html = ed.getHTML();
      onChange?.(html);
    },
  });

  // Share editor instance if ref provided
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, editorRef, onEditorReady]);

  // Update content when it changes externally (e.g., selecting a different note or auto-save sync)
  useEffect(() => {
    if (!editor) return;

    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const currentHTML = editor.getHTML();
    if (content === currentHTML) {
      return;
    }

    // Preserve selection during save / background updates so cursor does not jump
    const { from, to } = editor.state.selection;
    editor.commands.setContent(content || "", { emitUpdate: false });
    try {
      const maxPos = editor.state.doc.content.size;
      const newFrom = Math.min(Math.max(0, from), maxPos);
      const newTo = Math.min(Math.max(0, to), maxPos);
      editor.commands.setTextSelection({ from: newFrom, to: newTo });
    } catch {
      // Fallback if cursor position cannot be restored
    }
  }, [content, editor]);

  // Update editable mode if prop changes
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <div
      className="tiptap-editor-wrapper w-full h-full flex flex-col"
      data-testid="tiptap-editor"
    >
      {showToolbar && editable && (
        <EditorToolbar
          editor={editor}
          onOpenMarkdownGuide={onOpenMarkdownGuide}
        />
      )}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
