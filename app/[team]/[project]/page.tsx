export default function Project({ params }: { params: { project: string } }) {
  return <div>My Project: {params.project}</div>;
}
