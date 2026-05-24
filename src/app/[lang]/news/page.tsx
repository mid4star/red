import NewsClient from './NewsClient';

export default function NewsPage({ params }: { params: { lang: string } }) {
  return <NewsClient lang={params.lang} />;
}
