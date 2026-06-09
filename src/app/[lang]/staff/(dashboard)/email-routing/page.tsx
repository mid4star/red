import EmailRoutingClient from './EmailRoutingClient';

export const metadata = {
  title: 'Email Routing | Red Sea Reserves',
  description: 'Manage email routing aliases',
};

export default function EmailRoutingPage({ params }: { params: { lang: string } }) {
  return <EmailRoutingClient lang={params.lang} />;
}
