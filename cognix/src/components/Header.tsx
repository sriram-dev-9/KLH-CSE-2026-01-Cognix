interface HeaderProps {
  onAddFolder: () => void;
  folderName: string | null;
}

export default function Header({ onAddFolder, folderName }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo">◇</span>
        <span className="app-header__name">Cognix</span>
        {folderName && <span className="app-header__folder">/ {folderName}</span>}
      </div>
      <button className="btn btn--primary" onClick={onAddFolder}>
        + Add Folder
      </button>
    </header>
  );
}
