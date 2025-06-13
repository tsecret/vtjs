export const Debug = ({ config }: { config: string[] }) => {
  return <ul className="versions">
      <li className="electron-version">Port {config[0]}</li>
      <li className="electron-version">Port {config[1]}</li>
      <li className="electron-version">Hashed Password {config[2]}</li>
    </ul>
}
