import { Card as ShadCard } from "@/components/ui/card";

export function Card({ ...props }) {
  return (
    <ShadCard className="overflow-hidden" { ...props }>{props.children}</ShadCard>
  );
}
