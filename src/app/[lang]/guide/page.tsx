import GuideClient from './GuideClient';

export default function GuidePage({ params }: { params: { lang: string } }) {
  return <GuideClient lang={params.lang} />;
}
