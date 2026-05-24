import StatisticsClient from './StatisticsClient';

export default function StatisticsPage({ params }: { params: { lang: string } }) {
  return <StatisticsClient lang={params.lang} />;
}
