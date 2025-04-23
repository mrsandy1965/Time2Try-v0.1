import { Inter } from 'next/font/google';
import { metadata as siteMetadata } from './metadata';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = siteMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
