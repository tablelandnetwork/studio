export default function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <p>New project breadcrumb</p>
      {children}
    </div>
  );
}
