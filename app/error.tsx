"use client";
export default function ErrorPage({ reset }: { reset(): void }) { return <main role="alert"><h1>Page temporarily unavailable</h1><p>Live stream failures never remove static content. Please retry.</p><button onClick={reset}>Retry</button></main>; }
