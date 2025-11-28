import { SettingsWrapper } from './components/settings-wrapper';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsWrapper>{children}</SettingsWrapper>;
}
