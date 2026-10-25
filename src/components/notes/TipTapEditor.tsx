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
          "prose prose-zinc dark:prose-invert max-w-none",
          "prose-headings:font-bold prose-headings:tracking-tight",
          "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:my-2 prose-blockquote:border-l-indigo-500 prose-blockquote:italic",
          "prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
          "prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-lg prose-pre:p-4",
          "prose-ul:list-disc prose-ol:list-decimal",
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

  // Update content when it changes externally (e.g., selecting a different note)
  useEffect(() => {
    if (!editor) return;

    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const currentHTML = editor.getHTML();
    if (content !== currentHTML) {
      editor.commands.setContent(content || "", { emitUpdate: false });
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
