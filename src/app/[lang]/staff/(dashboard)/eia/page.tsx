import EIAMain from './EIAMain';

export default function EIAPage({ params }: { params: { lang: string } }) {
  return <EIAMain lang={params.lang} />;
}
