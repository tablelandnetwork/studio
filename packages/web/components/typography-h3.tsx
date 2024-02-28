export function TypographyH3(props: { children: React.ReactNode }) {
  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight [&:not(:first-child)]:mt-8">
      {props.children}
    </h3>
  );
}
