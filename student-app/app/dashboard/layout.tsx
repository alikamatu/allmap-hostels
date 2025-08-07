interface HostelLayoutProps {
  children: React.ReactNode;
}

const HostelLayout: React.FC<HostelLayoutProps> = ({ children }) => {
  return (
    <div className="hostel-layout">
      <header className="hostel-header">Hostel Header</header>
      <main className="hostel-content">{children}</main>
      <footer className="hostel-footer">Hostel Footer</footer>
    </div>
  );
};

export default HostelLayout;
