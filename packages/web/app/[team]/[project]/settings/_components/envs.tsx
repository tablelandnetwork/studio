"use client";

import { type schema } from "@tableland/studio-store";
import { Edit, Trash } from "lucide-react";

export default function Envs({ envs }: { envs: schema.Environment[] }) {
  return (
    <div>
      {envs.map((env) => (
        <div
          key={env.id}
          className="group flex items-center gap-x-2 px-4 py-2 hover:bg-accent"
        >
          <p>{env.name}</p>
          <Trash className="ml-auto opacity-10 group-hover:opacity-100" />
          <Edit className="opacity-10 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}
