import ReservesClient from './ReservesClient';

export default function ReservesPage({ params }: { params: { lang: string } }) {
  return <ReservesClient lang={params.lang} />;
}
