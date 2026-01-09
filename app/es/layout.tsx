import EsLangProvider from "./EsLangProvider";

export default function EsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EsLangProvider>
      {children}
    </EsLangProvider>
  );
}
