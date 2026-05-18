import * as React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { WarningBanner } from './Banner';

const LINCC_EMBARGO_S3_URL = 's3://rubin-lincc-hats';

// ---------------------------------------------------------------------------
// Syntax tokenizers
// ---------------------------------------------------------------------------

const tokenizePython = (code) => {
  const segments = code.split(/((?:'[^']*')|(?:"[^"]*"))/);
  return segments.flatMap((seg, si) => {
    if (si % 2 === 1)
      return [
        <span key={si} className='tk-str'>
          {seg}
        </span>,
      ];
    const parts = [];
    const re =
      /(\b(?:import|as|from|def|return|if|else|for|in|with|None|True|False)\b)|([a-zA-Z_]\w*(?=\s*\())/g;
    let last = 0;
    let m;
    while ((m = re.exec(seg)) !== null) {
      if (m.index > last) parts.push(<span key={`${si}-${last}`}>{seg.slice(last, m.index)}</span>);
      if (m[1])
        parts.push(
          <span key={`${si}-k${m.index}`} className='tk-kw'>
            {m[1]}
          </span>
        );
      else if (m[2])
        parts.push(
          <span key={`${si}-f${m.index}`} className='tk-fn'>
            {m[2]}
          </span>
        );
      last = m.index + m[0].length;
    }
    if (last < seg.length) parts.push(<span key={`${si}-${last}`}>{seg.slice(last)}</span>);
    return parts;
  });
};

const tokenizeShell = (code) => {
  const segments = code.split(/((?:"[^"]*")|(?:'[^']*'))/);
  let isFirst = true;
  return segments.flatMap((seg, si) => {
    if (si % 2 === 1)
      return [
        <span key={si} className='tk-str'>
          {seg}
        </span>,
      ];
    const words = seg.split(/(\s+)/);
    return words.map((word, wi) => {
      if (!word || /^\s+$/.test(word)) return <span key={`${si}-${wi}`}>{word}</span>;
      if (isFirst) {
        isFirst = false;
        return (
          <span key={`${si}-${wi}`} className='tk-cmd'>
            {word}
          </span>
        );
      }
      if (/^--?[a-zA-Z]/.test(word))
        return (
          <span key={`${si}-${wi}`} className='tk-flag'>
            {word}
          </span>
        );
      return <span key={`${si}-${wi}`}>{word}</span>;
    });
  });
};

// ---------------------------------------------------------------------------
// Code block with syntax highlighting
// ---------------------------------------------------------------------------

const CodeBlock = ({ command, is_python }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className='code-block-wrapper'>
      <div className='code-block'>
        <code>
          <span className='tk-prompt'>{is_python ? '>> ' : '$ '}</span>
          {is_python ? tokenizePython(command) : tokenizeShell(command)}
        </code>
      </div>
      <Box sx={{ display: 'flex' }}>
        <Tooltip title={copied ? 'Copied!' : 'Copy'} open={copied || undefined}>
          <IconButton
            className='copy-btn'
            onClick={handleCopy}
            sx={{ height: '100%', width: '100%', borderRadius: '8px' }}
          >
            {copied ? (
              <CheckIcon sx={{ fontSize: 18, color: '#4ade80' }} />
            ) : (
              <ContentCopyIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Exported section components
// ---------------------------------------------------------------------------

export const ReadHatsSection = ({ protocol, command, hideTitle = false }) => {
  const loader = command.includes('.parquet') ? 'Pandas' : 'LSDB';
  return (
    <div>
      {!hideTitle && (
        <div className='command-title'>
          <h5>{`Load using ${loader}`}</h5>
        </div>
      )}
      {getAdditionalReadInfo(protocol)}
      <CodeBlock command={command} is_python={true} />
    </div>
  );
};

export const DownloadSection = ({ protocol, command, hideTitle = false }) => {
  const type = protocol == 's3' ? 'S3' : 'wget';
  return (
    <div>
      {!hideTitle && (
        <div className='command-title'>
          <h5>Download with {type}</h5>
        </div>
      )}
      {getAdditionalDownloadInfo(protocol)}
      <CodeBlock command={command} is_python={false} />
    </div>
  );
};

export const getReadCommand = (catalog_url, margin_url) => {
  if (!catalog_url) return null;
  const open_call = catalog_url.includes('.parquet') ? 'pd.read_parquet' : 'lsdb.open_catalog';
  const extra_args = margin_url ? [`margin_cache=${_formatPathArguments(margin_url)}`] : [];
  const formatted_args = _formatPathArguments(catalog_url, extra_args);
  return `${open_call}(${formatted_args})`;
};

export const getDownloadCommand = (protocol, catalog_url) => {
  if (!catalog_url) return null;
  if (catalog_url.includes('.parquet')) return null;
  switch (protocol) {
    case 'http':
    case 'https':
      return getWgetCommand(catalog_url);
    case 's3':
      return getS3CpCommand(catalog_url);
    default:
      return null;
  }
};

export const getAdditionalReadInfo = (protocol) => {
  return (
    protocol == 's3' && (
      <div className='s3-info'>
        <WarningBanner>
          Install <a href='https://s3fs.readthedocs.io/en/latest/install.html'>s3fs</a> before
          attempting to read the catalog from Amazon S3.
        </WarningBanner>
      </div>
    )
  );
};

export const getAdditionalDownloadInfo = (protocol) => {
  return (
    protocol == 's3' && (
      <WarningBanner>
        Install the <a href='https://aws.amazon.com/cli/'>AWS CLI</a> before attempting downloads
        from Amazon S3.
      </WarningBanner>
    )
  );
};

const _formatPathArguments = (url, extra_args) => {
  if (!extra_args) extra_args = [];
  let path = `'${url}'`;
  if (url.startsWith(LINCC_EMBARGO_S3_URL)) {
    path = `upath.UPath(${path})`;
  }
  return [path, ...extra_args].join(', ');
};

const getWgetCommand = (catalog_url) => {
  const path = new URL(catalog_url).pathname;
  const directories = path.split('/').filter((segment) => segment !== '');
  const cutDirsFlag = directories.length > 1 ? `--cut-dirs=${directories.length - 1}` : '';
  const wgetUrl = catalog_url.endsWith('/') ? catalog_url : `${catalog_url}/`;
  return `wget -e robots=off -r -np -nH ${cutDirsFlag} -c -R "index.html*" -l 0 ${wgetUrl}`;
};

const getS3CpCommand = (catalog_url) => {
  const flags = catalog_url.startsWith(LINCC_EMBARGO_S3_URL) ? '' : '--no-sign-request';
  return `aws s3 cp ${flags} --recursive ${catalog_url} <local_dir>`;
};
