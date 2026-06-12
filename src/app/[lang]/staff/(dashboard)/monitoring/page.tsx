import MonitoringMain from './MonitoringMain';

export default function MonitoringPage({ params }: { params: { lang: string } }) {
  return <MonitoringMain lang={params.lang} />;
}
