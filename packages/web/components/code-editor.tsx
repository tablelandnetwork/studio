import React from "react";
import Editor from "react-simple-code-editor";
// @ts-expect-error this came from the o.g. console and there's no types for this afaik
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-sql";

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
            : `<span class='editorLineNumber'>${i + 1}</span>`
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
        hightlightWithLineNumbers(code, languages.sql, props.hideLineNumbers)
      }
      padding={10}
      placeholder="SELECT * FROM YourTable;"
      textareaId={props.hideLineNumbers ? "codeViewer" : "codeEditor"}
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
