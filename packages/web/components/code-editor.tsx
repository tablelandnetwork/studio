import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "@/app/prism.js";
import "@/app/prism.css";

const hightlightWithLineNumbers = (
  input: any,
  language: any,
  hideLineNumbers: boolean,
): any =>
  highlight(input, language)
    .split("\n")
    .map(
      (line: string, i: number) =>
        `${
          hideLineNumbers
            ? ""
            : `<span class="absolute left-0 text-right w-4 font-thin">${i + 1}</span>`
        }${line}`,
    )
    .join("\n");

export function CodeEditor(props: any): React.JSX.Element {
  return (
    <Editor
      preClassName="language-sql"
      value={props.code}
      onValueChange={props.onChange}
      highlight={(code) =>
        hightlightWithLineNumbers(
          code,
          (languages as any).sql,
          props.hideLineNumbers,
        )
      }
      padding={10}
      placeholder="SELECT * FROM YourTable;"
      textareaId={props.hideLineNumbers ? "codeViewer" : "codeEditor"}
      textareaClassName="ml-8"
      className="editor language-sql"
      disabled={props.loading}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 18,
        outline: 0,
      }}
    />
  );
}
