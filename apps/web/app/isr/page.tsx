export const revalidate = 120;

export default async function ISRPage() {
  const now = new Date().toISOString();

  return (
    <main style={{ padding: 30 }}>
      <h1>ISR Redis Cache Test</h1>
      <p>Generated at: {now}</p>
      <p>Revalidate: 10 seconds</p>
    </main>
  );
}
