import MonitoringClient from './MonitoringClient';

export default function MonitoringPage({ params }: { params: { lang: string } }) {
  return <MonitoringClient lang={params.lang} />;
}
