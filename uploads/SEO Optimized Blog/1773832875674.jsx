import { useRef, useEffect, useState } from "react";

const RichTextEditor = ({ value = "", onChange, placeholder = "Write your task description here..." }) => {
  const iframeRef = useRef(null);
  const [activeBlock, setActiveBlock] = useState("p");
  const [fontSize, setFontSize] = useState("3");
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false, strikeThrough: false,
    insertUnorderedList: false, insertOrderedList: false,
    justifyLeft: false, justifyCenter: false, justifyRight: false,
  });

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: sans-serif;
              font-size: 14px;
              color: #1f2937;
              padding: 12px 16px;
              min-height: 180px;
              outline: none;
              line-height: 1.6;
              word-break: break-word;
            }
            body:empty:before {
              content: attr(data-placeholder);
              color: #9ca3af;
              pointer-events: none;
            }
            blockquote {
              border-left: 3px solid #3b82f6;
              padding-left: 12px;
              color: #6b7280;
              margin: 4px 0;
            }
            a { color: #3b82f6; }
            ul, ol { padding-left: 20px; }
          </style>
        </head>
        <body data-placeholder="${placeholder}" contenteditable="true">${value}</body>
      </html>
    `);
    doc.close();
    doc.designMode = "on";

    const syncToolbar = () => {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      // Sync block type
      let node = sel.anchorNode;
      while (node && node !== doc.body) {
        const tag = node.nodeName?.toLowerCase();
        if (["h1","h2","h3","h4","p","blockquote"].includes(tag)) {
          setActiveBlock(tag);
          break;
        }
        if (node.parentNode === doc.body) { setActiveBlock("p"); break; }
        node = node.parentNode;
      }

      // Sync font size
      const fs = doc.queryCommandValue("fontSize");
      if (fs) setFontSize(fs);

      // Sync active format buttons
      setActiveFormats({
        bold: doc.queryCommandState("bold"),
        italic: doc.queryCommandState("italic"),
        underline: doc.queryCommandState("underline"),
        strikeThrough: doc.queryCommandState("strikeThrough"),
        insertUnorderedList: doc.queryCommandState("insertUnorderedList"),
        insertOrderedList: doc.queryCommandState("insertOrderedList"),
        justifyLeft: doc.queryCommandState("justifyLeft"),
        justifyCenter: doc.queryCommandState("justifyCenter"),
        justifyRight: doc.queryCommandState("justifyRight"),
      });
    };

    const notifyChange = () => {
      if (onChange) onChange(doc.body.innerHTML);
      syncToolbar();
    };

    doc.body.addEventListener("input", notifyChange);
    doc.body.addEventListener("keyup", syncToolbar);
    doc.body.addEventListener("mouseup", syncToolbar);
    doc.addEventListener("selectionchange", syncToolbar);

    return () => {
      doc.body.removeEventListener("input", notifyChange);
      doc.body.removeEventListener("keyup", syncToolbar);
      doc.body.removeEventListener("mouseup", syncToolbar);
      doc.removeEventListener("selectionchange", syncToolbar);
    };
  }, []);

  const exec = (command, val = null) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    iframeRef.current.contentWindow.focus();
    doc.execCommand(command, false, val);
    if (onChange) onChange(doc.body.innerHTML);
    // Re-sync after exec
    setActiveFormats(prev => ({
      ...prev,
      [command]: doc.queryCommandState(command),
    }));
  };

  const handleHeading = (e) => {
    const val = e.target.value;
    setActiveBlock(val);
    exec("formatBlock", val);
  };

  const handleFontSize = (e) => {
    const val = e.target.value;
    setFontSize(val);
    exec("fontSize", val);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const Btn = ({ cmd, val, title, children }) => {
    const isActive = activeFormats[cmd];
    return (
      <button
        type="button"
        title={title}
        onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }}
        className={`px-2 py-1 rounded text-sm transition-colors
          ${isActive
            ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
            : "hover:bg-gray-200 text-gray-700"
          }`}
      >
        {children}
      </button>
    );
  };

  const Sep = () => <div className="w-px h-5 bg-gray-300 mx-0.5 self-center flex-shrink-0" />;

  return (
    <div className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">

        <select
          value={activeBlock}
          onChange={handleHeading}
          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-blue-300 h-7"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Blockquote</option>
        </select>

        <Sep />

        <select
          value={fontSize}
          onChange={handleFontSize}
          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-blue-300 h-7"
        >
          <option value="1">Small</option>
          <option value="2">Normal</option>
          <option value="3">Medium</option>
          <option value="4">Large</option>
          <option value="5">X-Large</option>
        </select>

        <Sep />

        <Btn cmd="bold" title="Bold"><b className="font-bold">B</b></Btn>
        <Btn cmd="italic" title="Italic"><i>I</i></Btn>
        <Btn cmd="underline" title="Underline"><u>U</u></Btn>
        <Btn cmd="strikeThrough" title="Strikethrough"><s>S</s></Btn>

        <Sep />

        <Btn cmd="insertUnorderedList" title="Bullet List">
          <span className="flex flex-col gap-0.5 w-4">
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-current inline-block"/><span className="w-3 h-0.5 bg-current inline-block"/></span>
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-current inline-block"/><span className="w-3 h-0.5 bg-current inline-block"/></span>
            <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-current inline-block"/><span className="w-3 h-0.5 bg-current inline-block"/></span>
          </span>
        </Btn>

        <Btn cmd="insertOrderedList" title="Numbered List">
          <span className="flex flex-col gap-0.5 w-4 text-[9px] leading-none">
            <span className="flex items-center gap-1">1<span className="w-3 h-0.5 bg-current inline-block"/></span>
            <span className="flex items-center gap-1">2<span className="w-3 h-0.5 bg-current inline-block"/></span>
            <span className="flex items-center gap-1">3<span className="w-3 h-0.5 bg-current inline-block"/></span>
          </span>
        </Btn>

        <Sep />

        <Btn cmd="justifyLeft" title="Align Left">
          <span className="flex flex-col gap-0.5 w-4">
            <span className="w-4 h-0.5 bg-current block"/>
            <span className="w-3 h-0.5 bg-current block"/>
            <span className="w-4 h-0.5 bg-current block"/>
          </span>
        </Btn>
        <Btn cmd="justifyCenter" title="Center">
          <span className="flex flex-col gap-0.5 w-4 items-center">
            <span className="w-4 h-0.5 bg-current block"/>
            <span className="w-2 h-0.5 bg-current block"/>
            <span className="w-4 h-0.5 bg-current block"/>
          </span>
        </Btn>
        <Btn cmd="justifyRight" title="Align Right">
          <span className="flex flex-col gap-0.5 w-4 items-end">
            <span className="w-4 h-0.5 bg-current block"/>
            <span className="w-3 h-0.5 bg-current block"/>
            <span className="w-4 h-0.5 bg-current block"/>
          </span>
        </Btn>

        <Sep />

        <Btn cmd="indent" title="Indent"><span className="text-xs font-mono">→</span></Btn>
        <Btn cmd="outdent" title="Outdent"><span className="text-xs font-mono">←</span></Btn>

        <Sep />

        <button
          type="button"
          title="Insert Link"
          onMouseDown={(e) => { e.preventDefault(); insertLink(); }}
          className="px-2 py-1 rounded text-sm hover:bg-gray-200 text-gray-700 transition-colors"
        >
          🔗
        </button>

        <Sep />

        <label title="Text Color" className="flex items-center gap-0.5 text-xs text-gray-600 cursor-pointer px-1 py-1 rounded hover:bg-gray-200">
          <span className="font-semibold">A</span>
          <input
            type="color"
            defaultValue="#000000"
            onChange={(e) => exec("foreColor", e.target.value)}
            className="w-4 h-4 cursor-pointer border-0 p-0 rounded"
          />
        </label>

        <Sep />

        <Btn cmd="removeFormat" title="Clear Formatting"><span className="text-xs">✕</span></Btn>
      </div>

      {/* iframe editor */}
      <iframe
        ref={iframeRef}
        title="editor"
        className="w-full bg-white"
        style={{ minHeight: "180px", maxHeight: "320px", border: "none", display: "block" }}
      />
    </div>
  );
};

export default RichTextEditor;
