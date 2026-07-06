"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

interface RichTextEditorProps {
  /** Initial HTML content (from the DB). */
  value: string;
  /** Called with the current HTML on every change. */
  onChange: (html: string) => void;
  /** Editor min-height class (e.g. small for short desc, larger for long). */
  minHeightClass?: string;
  placeholder?: string;
}

// A single toolbar button.
function ToolButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent the editor from losing focus/selection on click.
        e.preventDefault();
        onClick();
      }}
      aria-label={label}
      title={label}
      className={`w-9 h-9 flex items-center justify-center rounded-md text-sm transition-colors ${
        active
          ? "bg-green-end text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 px-2 py-1.5 bg-gray-50 rounded-t-lg">
      <ToolButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Grassetto"
      >
        <span className="font-bold">B</span>
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Corsivo"
      >
        <span className="italic font-serif">I</span>
      </ToolButton>
      <ToolButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        label="Sottolineato"
      >
        <span className="underline">U</span>
      </ToolButton>
      <span className="w-px h-5 bg-gray-200 mx-1" aria-hidden />
      <ToolButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Elenco puntato"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12" />
        </svg>
      </ToolButton>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  minHeightClass = "min-h-[6rem]",
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    // Keep only the marks/nodes we expose in the toolbar. StarterKit brings
    // bold/italic/bulletList/paragraph; we add Underline separately.
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
      }),
      Underline,
    ],
    content: value || "",
    // SSR safety for Next.js App Router.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-sm prose-gray max-w-none focus:outline-none px-3 py-2 ${minHeightClass}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Report empty markup as "" so required/empty checks work downstream.
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  if (!editor) {
    return (
      <div className={`border border-gray-200 rounded-lg bg-white ${minHeightClass}`} />
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-green-end focus-within:border-transparent">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} data-placeholder={placeholder} />
    </div>
  );
}
