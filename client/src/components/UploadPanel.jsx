import { useState } from 'react';

export default function UploadPanel({ onUpload, onShowGuide }) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <section
      className={`upload-panel${dragging ? ' dragging' : ''}`}
      id="uploadPanel"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div className="upload-symbol">⇧</div>
      <div className="upload-copy">
        <b>Importe sua planilha de frequência</b>
        <span>
          Arraste o arquivo para cá ou clique em “Selecionar arquivo”. Formatos XLS e XLSX,
          até 15 MB.
        </span>
        <button className="guide-link" type="button" onClick={onShowGuide}>
          Ver estrutura necessária
        </button>
      </div>
      <label className="secondary-btn" htmlFor="fileInput">
        Selecionar arquivo
      </label>
    </section>
  );
}
