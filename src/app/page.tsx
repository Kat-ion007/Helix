import type { Metadata } from "next"
import { LandingClient } from "@/components/landing/landing-client"

export const metadata: Metadata = {
  title: "Helix | High-Speed B2B Customer Support Admin Platform",
  description: "Helix helps customer support teams manage tickets, customer context, escalations, and workload visibility from a single streamlined workspace. Book a demo today.",
}

export default function Home() {
  return <LandingClient />
}

