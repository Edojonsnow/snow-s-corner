import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CustomToolbar from "./Toolbar";
import React from "react";

interface EditorProps {
  text: string;
  onTextChange: (text: string) => void;
}

const Editor = ({ text, onTextChange }: EditorProps) => {
  const [editorText, setText] = React.useState(text);

  const handleChange = (html: string) => {
    setText(html);
    onTextChange(html);
  };
  const modules = {
    toolbar: {
      container: "#toolbar",
    },
  };
  const formats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "header",
    "blockquote",
    "code-block",
    "indent",
    "list",
    "direction",
    "align",
    "link",
    "image",
    "video",
    "formula",
  ];

  return (
    <>
      <CustomToolbar />
      <ReactQuill
        value={editorText}
        onChange={handleChange}
        modules={modules}
        formats={formats}
      />
    </>
  );
};

export default Editor;
