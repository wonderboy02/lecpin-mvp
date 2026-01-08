import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'K-Audit: GraphRAG Learning Analytics',
  description: 'AI-powered learning analytics using GraphRAG and Neo4j',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
