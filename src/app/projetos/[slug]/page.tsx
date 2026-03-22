import { VexPublicProject } from '@/components/vex-public-project';

export default function PublicProjectRoute({
  params,
}: {
  params: { slug: string };
}) {
  return <VexPublicProject slug={params.slug} />;
}
