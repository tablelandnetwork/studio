import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-sql";

const hightlightWithLineNumbers = (input, language, hideLineNumbers): any =>
  highlight(input, language)
    .split("\n")
    .map(
      (line, i) =>
        `${
          hideLineNumbers
            ? ""
            : `<span class='editorLineNumber'>${(i as number) + 1}</span>`
        }${line as string}`,
    )
    .join("\n");

export function CodeEditor(props: any): React.JSX.Element {
  return (
    <Editor
      preClassName="language-sql"
      value={props.code}
      onValueChange={props.onChange}
      highlight={(code) =>
        hightlightWithLineNumbers(code, languages.sql, props.hideLineNumbers)
      }
      padding={10}
      placeholder="SELECT * FROM YourTable;"
      textareaId={props.hideLineNumbers ? "codeViewer" : "codeEditor"}
      className="editor language-sql"
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 18,
        outline: 0,
      }}
    />
  );
}
