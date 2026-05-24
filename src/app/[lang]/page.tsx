import HomeClient from './HomeClient';

export default function Home({ params }: { params: { lang: string } }) {
  return <HomeClient lang={params.lang} />;
}
