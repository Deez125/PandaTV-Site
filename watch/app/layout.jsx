import './globals.css';

export const metadata = {
  title: 'Novix — Watch',
  description: 'All your streaming. One quiet app.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
