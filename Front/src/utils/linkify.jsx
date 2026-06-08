import React from 'react';

/**
 * Converte URLs em texto para elementos <a> clicáveis de forma segura.
 * Sempre retorna um React Fragment renderizável.
 */
export function linkify(text) {
  // Garante que só processa strings
  if (text === null || text === undefined) return null;
  if (typeof text !== 'string') return String(text);

  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let keyCounter = 0;

  while ((match = urlRegex.exec(text)) !== null) {
    // Texto antes da URL
    if (match.index > lastIndex) {
      parts.push(
        <React.Fragment key={keyCounter++}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>
      );
    }

    const url = match[0];
    parts.push(
      <a
        key={keyCounter++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all' }}
      >
        {url}
      </a>
    );

    lastIndex = match.index + url.length;
  }

  // Texto restante após a última URL
  if (lastIndex < text.length) {
    parts.push(
      <React.Fragment key={keyCounter++}>
        {text.slice(lastIndex)}
      </React.Fragment>
    );
  }

  // Sem URLs: retorna o texto direto
  if (parts.length === 0) return <>{text}</>;

  return <>{parts}</>;
}
