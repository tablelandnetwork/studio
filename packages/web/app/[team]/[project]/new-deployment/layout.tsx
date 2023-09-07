import CrumbBack from "@/components/crumb-back";

export default async function NewProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="sticky top-0 flex flex-col space-y-4 border-b bg-white px-4 py-3">
        <CrumbBack title="New Deployment" />
      </header>
      {children}
    </div>
  );
}
