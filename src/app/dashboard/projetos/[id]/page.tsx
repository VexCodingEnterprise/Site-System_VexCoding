import { ProjectDetailView } from '@/components/dashboard/project-detail-view';

export default function DashboardProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProjectDetailView projectId={params.id} />;
}
