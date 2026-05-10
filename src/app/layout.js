export const metadata = {
  title: "Interview Simulation",
  description: "Company-specific interview simulation (STT → LLM → TTS)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, Arial" }}>{children}</body>
    </html>
  );
}

