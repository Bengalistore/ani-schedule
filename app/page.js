import HomeClient from "@/components/HomeClient";

export const metadata = {
  title: "Anime Release Schedule & Upcoming Episodes",
  description:
    "Browse currently airing anime with live episode countdowns and discover upcoming anime releases, with official streaming links for each title.",
  alternates: { canonical: "/" }
};

export default function HomePage() {
  return <HomeClient />;
}
