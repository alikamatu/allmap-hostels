type SectionHeaderProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  icon,
}: SectionHeaderProps) {
  return (
    <div className="mb-16 text-center">
      <div className="mb-4 inline-flex items-center gap-2">
        {icon && <div className="bg-orange-50 p-2">{icon}</div>}
        <span className="text-xs tracking-wider text-gray-500 uppercase">
          {eyebrow}
        </span>
      </div>
      <h2
        id={id}
        className="mb-4 text-4xl font-light tracking-tight text-gray-900"
      >
        {title}
      </h2>
      <div className="mx-auto mb-6 h-px w-24 bg-gray-300" />
      <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600">
        {description}
      </p>
    </div>
  );
}
