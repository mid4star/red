import EventsClient from './EventsClient';

export default function EventsPage({ params }: { params: { lang: string } }) {
  return <EventsClient lang={params.lang} />;
}
