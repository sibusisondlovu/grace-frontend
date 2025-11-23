import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import ChatAssistant from "@/components/ai/ChatAssistant";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="p-6 flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <ChatAssistant />
    </div>
  );
}