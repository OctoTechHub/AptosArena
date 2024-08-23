import { StatsSection } from "@/pages/Stake/components/StatsSection";
import { Socials } from "@/pages/Stake/components/Socials";
import { useGetTokenData } from "@/hooks/useGetTokenData";

export const Stake: React.FC = () => {
  const { tokenData } = useGetTokenData();

  return (
    <div style={{ overflow: "hidden" }} className="overflow-hidden h-full ">
      <main className="flex flex-col gap-10 md:gap-16 mt-6">
        <StatsSection />
      </main>

      <footer className="footer-container px-4 pb-6 w-full max-w-screen-xl mx-auto mt-6 md:mt-16 flex items-center justify-between ">
        <p>{tokenData?.name ?? "TOKEN"}</p>
        <Socials />
      </footer>
    </div>
  );
};
