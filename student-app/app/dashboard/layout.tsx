import Navbar from "@/_components/Navbar";

interface HostelLayoutProps {
  children: React.ReactNode;
}

const HostelLayout: React.FC<HostelLayoutProps> = ({ children }) => {
  return (
    <div className="hostel-layout">
      <main className="hostel-content">
        {/* <div className="flex fixed inset-0 z-40 top-0 h-screen w-screen bg-black/10 backdrop-blur-xs"></div> */}
        <div className="flex mb-12">
        <Navbar />
        </div>
        {children}
      </main>
    </div>
  );
};

export default HostelLayout;
