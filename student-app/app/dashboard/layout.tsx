import Navbar from "@/_components/Navbar";

interface HostelLayoutProps {
  children: React.ReactNode;
}

const HostelLayout: React.FC<HostelLayoutProps> = ({ children }) => {
  return (
    <div className="hostel-layout">
      <main className="hostel-content">
        <div className="flex mb-12">
        <Navbar />
        </div>
        {children}
      </main>
    </div>
  );
};

export default HostelLayout;
