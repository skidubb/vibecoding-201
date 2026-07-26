import { Deck } from "@/components/Deck";

// Kept a Server Component so the metadata export in layout.tsx stays valid;
// all interactivity lives inside <Deck />.
export default function Home() {
  return <Deck />;
}
